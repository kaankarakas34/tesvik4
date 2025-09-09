const { Document, Incentive, IncentiveRequiredDocuments } = require('../models');
const { Op } = require('sequelize');

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Belgeler getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Belge bulunamadı'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Belge getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Create new document (admin only)
const createDocument = async (req, res) => {
  try {
    const { name, description, type, required = false } = req.body;

    if (!name || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Belge adı, açıklama ve tür gereklidir'
      });
    }

    // Check if document with same name already exists
    const existingDocument = await Document.findOne({ where: { name } });
    if (existingDocument) {
      return res.status(400).json({
        success: false,
        message: 'Bu isimde bir belge zaten mevcut'
      });
    }

    const document = await Document.create({
      name,
      description,
      type,
      required
    });

    res.status(201).json({
      success: true,
      message: 'Belge başarıyla oluşturuldu',
      data: document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Belge oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Update document (admin only)
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, required } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Belge bulunamadı'
      });
    }

    // Check if another document with same name exists
    if (name && name !== document.name) {
      const existingDocument = await Document.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: id }
        } 
      });
      if (existingDocument) {
        return res.status(400).json({
          success: false,
          message: 'Bu isimde bir belge zaten mevcut'
        });
      }
    }

    await document.update({
      name: name || document.name,
      description: description || document.description,
      type: type || document.type,
      required: required !== undefined ? required : document.required
    });

    res.json({
      success: true,
      message: 'Belge başarıyla güncellendi',
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Belge güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Delete document (admin only)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Belge bulunamadı'
      });
    }

    // Check if document is used in any incentive mappings
    const mappingCount = await IncentiveRequiredDocuments.count({
      where: { documentId: id }
    });

    if (mappingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu belge teşvik eşleştirmelerinde kullanıldığı için silinemez'
      });
    }

    await document.destroy();

    res.json({
      success: true,
      message: 'Belge başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Belge silinirken hata oluştu',
      error: error.message
    });
  }
};

// Get incentive-document mappings
const getIncentiveDocumentMappings = async (req, res) => {
  try {
    const mappings = await IncentiveRequiredDocuments.findAll({
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'name', 'description', 'type']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedMappings = mappings.map(mapping => ({
      id: mapping.id,
      incentiveId: mapping.incentiveId,
      documentId: mapping.documentId,
      incentiveName: mapping.incentive?.name || 'Bilinmeyen Teşvik',
      documentName: mapping.document?.name || 'Bilinmeyen Belge',
      createdAt: mapping.createdAt,
      updatedAt: mapping.updatedAt
    }));

    res.json({
      success: true,
      data: formattedMappings
    });
  } catch (error) {
    console.error('Get incentive document mappings error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik-belge eşleştirmeleri getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Create incentive-document mapping (admin only)
const createIncentiveDocumentMapping = async (req, res) => {
  try {
    const { incentiveId, documentId } = req.body;

    if (!incentiveId || !documentId) {
      return res.status(400).json({
        success: false,
        message: 'Teşvik ID ve Belge ID gereklidir'
      });
    }

    // Check if incentive exists
    const incentive = await Incentive.findByPk(incentiveId);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    // Check if document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Belge bulunamadı'
      });
    }

    // Check if mapping already exists
    const existingMapping = await IncentiveRequiredDocuments.findOne({
      where: { incentiveId, documentId }
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: 'Bu teşvik-belge eşleştirmesi zaten mevcut'
      });
    }

    const mapping = await IncentiveRequiredDocuments.create({
      incentiveId,
      documentId
    });

    // Get the created mapping with related data
    const createdMapping = await IncentiveRequiredDocuments.findByPk(mapping.id, {
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'name', 'description', 'type']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Teşvik-belge eşleştirmesi başarıyla oluşturuldu',
      data: {
        id: createdMapping.id,
        incentiveId: createdMapping.incentiveId,
        documentId: createdMapping.documentId,
        incentiveName: createdMapping.incentive?.name || 'Bilinmeyen Teşvik',
        documentName: createdMapping.document?.name || 'Bilinmeyen Belge',
        createdAt: createdMapping.createdAt,
        updatedAt: createdMapping.updatedAt
      }
    });
  } catch (error) {
    console.error('Create incentive document mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik-belge eşleştirmesi oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Delete incentive-document mapping (admin only)
const deleteIncentiveDocumentMapping = async (req, res) => {
  try {
    const { id } = req.params;

    const mapping = await IncentiveRequiredDocuments.findByPk(id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik-belge eşleştirmesi bulunamadı'
      });
    }

    await mapping.destroy();

    res.json({
      success: true,
      message: 'Teşvik-belge eşleştirmesi başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete incentive document mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik-belge eşleştirmesi silinirken hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getIncentiveDocumentMappings,
  createIncentiveDocumentMapping,
  deleteIncentiveDocumentMapping
};