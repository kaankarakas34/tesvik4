const { Incentive, User, Application, Document } = require('../models');
const { Op } = require('sequelize');

// Tüm teşvikleri getir
const getAllIncentives = async (req, res) => {
  try {
    const incentives = await Incentive.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: incentives
    });
  } catch (error) {
    console.error('Get all incentives error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvikler getirilirken hata oluştu'
    });
  }
};

// Şirket teşviklerini getir (kullanıcının sektörüne göre filtrelenmiş)
const getCompanyIncentives = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [{
        model: require('../models').Sector,
        as: 'sector',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Temel filtreleme koşulu
    let whereCondition = { isActive: true };
    
    // Kullanıcının sektörü varsa, sadece o sektöre ait teşvikleri getir
    if (user.sectorId) {
      whereCondition.sectorId = user.sectorId;
    }

    const incentives = await Incentive.findAll({
      where: whereCondition,
      include: [{
        model: require('../models').Sector,
        as: 'sector',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: incentives,
      userSector: user.sector?.name || null,
      sectorId: user.sectorId
    });
  } catch (error) {
    console.error('Get company incentives error:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket teşvikleri getirilirken hata oluştu'
    });
  }
};

// Teşvik detayını getir
const getIncentiveById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incentive = await Incentive.findOne({
      where: { id, isActive: true }
    });

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    res.json({
      success: true,
      data: incentive
    });
  } catch (error) {
    console.error('Get incentive by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik detayı getirilirken hata oluştu'
    });
  }
};

// Teşvik oluştur (sadece admin)
const createIncentive = async (req, res) => {
  try {
    const { name, description, amount, type, requirements, deadline } = req.body;

    const incentive = await Incentive.create({
      name,
      description,
      amount,
      type,
      requirements,
      deadline,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: incentive,
      message: 'Teşvik başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik oluşturulurken hata oluştu'
    });
  }
};

// Teşvik güncelle (sadece admin)
const updateIncentive = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, amount, type, requirements, deadline, isActive } = req.body;

    const incentive = await Incentive.findByPk(id);
    
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    await incentive.update({
      name,
      description,
      amount,
      type,
      requirements,
      deadline,
      isActive
    });

    res.json({
      success: true,
      data: incentive,
      message: 'Teşvik başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik güncellenirken hata oluştu'
    });
  }
};

// Teşvik sil (sadece admin)
const deleteIncentive = async (req, res) => {
  try {
    const { id } = req.params;

    const incentive = await Incentive.findByPk(id);
    
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    // Soft delete
    await incentive.update({ isActive: false });

    res.json({
      success: true,
      message: 'Teşvik başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik silinirken hata oluştu'
    });
  }
};

// Teşvik için gerekli belgeleri getir
const getIncentiveRequiredDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incentive = await Incentive.findOne({
      where: { id, isActive: true },
      include: [{
        model: Document,
        as: 'requiredDocuments',
        through: { attributes: [] }
      }]
    });

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        incentive: {
          id: incentive.id,
          name: incentive.name,
          description: incentive.description
        },
        requiredDocuments: incentive.requiredDocuments
      }
    });
  } catch (error) {
    console.error('Get incentive required documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik belgeleri getirilirken hata oluştu'
    });
  }
};

// Birden fazla teşvik için gerekli belgeleri getir
const getMultipleIncentivesRequiredDocuments = async (req, res) => {
  try {
    const { incentiveIds } = req.body;
    
    if (!incentiveIds || !Array.isArray(incentiveIds) || incentiveIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Teşvik ID\'leri gerekli'
      });
    }

    const incentives = await Incentive.findAll({
      where: { 
        id: incentiveIds,
        isActive: true 
      },
      include: [{
        model: Document,
        as: 'requiredDocuments',
        through: { attributes: [] }
      }]
    });

    // Tüm belgeleri topla ve tekrarları kaldır
    const allDocuments = [];
    const documentIds = new Set();
    
    incentives.forEach(incentive => {
      incentive.requiredDocuments.forEach(doc => {
        if (!documentIds.has(doc.id)) {
          documentIds.add(doc.id);
          allDocuments.push({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            required: true
          });
        }
      });
    });

    res.json({
      success: true,
      data: {
        incentives: incentives.map(inc => ({
          id: inc.id,
          name: inc.name,
          description: inc.description
        })),
        requiredDocuments: allDocuments
      }
    });
  } catch (error) {
    console.error('Get multiple incentives required documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik belgeleri getirilirken hata oluştu'
    });
  }
};

module.exports = {
  getAllIncentives,
  getCompanyIncentives,
  getIncentiveById,
  createIncentive,
  updateIncentive,
  deleteIncentive,
  getIncentiveRequiredDocuments,
  getMultipleIncentivesRequiredDocuments
};