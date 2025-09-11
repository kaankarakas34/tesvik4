const { IncentiveType, Sector, Incentive } = require('../models');
const { Op } = require('sequelize');

// Get all incentive types
const getAllIncentiveTypes = async (req, res) => {
  try {
    const { sectorId, category, isActive } = req.query;
    
    const whereClause = {};
    
    if (sectorId) {
      whereClause.sectorId = sectorId;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const incentiveTypes = await IncentiveType.findAll({
      where: whereClause,
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        },
        {
          model: Incentive,
          as: 'incentives',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: incentiveTypes
    });
  } catch (error) {
    console.error('Get all incentive types error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik türleri getirilirken hata oluştu'
    });
  }
};

// Get incentive types by sector
const getIncentiveTypesBySector = async (req, res) => {
  try {
    const { sectorId } = req.params;
    
    const incentiveTypes = await IncentiveType.findAll({
      where: {
        [Op.or]: [
          { sectorId: sectorId },
          { sectorId: null } // Genel teşvik türleri
        ],
        isActive: true
      },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ],
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: incentiveTypes
    });
  } catch (error) {
    console.error('Get incentive types by sector error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektöre göre teşvik türleri getirilirken hata oluştu'
    });
  }
};

// Create incentive type
const createIncentiveType = async (req, res) => {
  try {
    const { name, description, sectorId, category, priority = 0 } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Teşvik türü adı en az 2 karakter olmalıdır'
      });
    }

    // Check if sector exists (if provided)
    if (sectorId) {
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({
          success: false,
          message: 'Belirtilen sektör bulunamadı'
        });
      }
    }

    const incentiveType = await IncentiveType.create({
      name: name.trim(),
      description: description?.trim() || null,
      sectorId: sectorId || null,
      category,
      priority,
      isActive: true
    });

    // Get created incentive type with associations
    const createdIncentiveType = await IncentiveType.findByPk(incentiveType.id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Teşvik türü başarıyla oluşturuldu',
      data: createdIncentiveType
    });
  } catch (error) {
    console.error('Create incentive type error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik türü oluşturulurken hata oluştu'
    });
  }
};

// Update incentive type
const updateIncentiveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sectorId, category, priority, isActive } = req.body;

    const incentiveType = await IncentiveType.findByPk(id);

    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik türü bulunamadı'
      });
    }

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Teşvik türü adı en az 2 karakter olmalıdır'
      });
    }

    // Check if sector exists (if provided)
    if (sectorId) {
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({
          success: false,
          message: 'Belirtilen sektör bulunamadı'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (sectorId !== undefined) updateData.sectorId = sectorId || null;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    await incentiveType.update(updateData);

    // Get updated incentive type with associations
    const updatedIncentiveType = await IncentiveType.findByPk(id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Teşvik türü başarıyla güncellendi',
      data: updatedIncentiveType
    });
  } catch (error) {
    console.error('Update incentive type error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik türü güncellenirken hata oluştu'
    });
  }
};

// Delete incentive type
const deleteIncentiveType = async (req, res) => {
  try {
    const { id } = req.params;

    const incentiveType = await IncentiveType.findByPk(id);

    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik türü bulunamadı'
      });
    }

    // Check if incentive type has incentives
    const incentiveCount = await Incentive.count({ where: { incentiveTypeId: id } });

    if (incentiveCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu teşvik türü silinemez. ${incentiveCount} teşvik ile ilişkili.`,
        data: {
          incentiveCount
        }
      });
    }

    await incentiveType.destroy();

    res.json({
      success: true,
      message: 'Teşvik türü başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete incentive type error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik türü silinirken hata oluştu'
    });
  }
};

// Get incentive type categories
const getIncentiveTypeCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'vergi_tesviki', label: 'Vergi Teşviki' },
      { value: 'subvansiyon', label: 'Sübvansiyon' },
      { value: 'kredi_destegi', label: 'Kredi Desteği' },
      { value: 'hibe', label: 'Hibe' },
      { value: 'istihdam_destegi', label: 'İstihdam Desteği' },
      { value: 'ar_ge_destegi', label: 'Ar-Ge Desteği' },
      { value: 'ihracat_destegi', label: 'İhracat Desteği' },
      { value: 'yatirim_destegi', label: 'Yatırım Desteği' },
      { value: 'diger', label: 'Diğer' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get incentive type categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik türü kategorileri getirilirken hata oluştu'
    });
  }
};

module.exports = {
  getAllIncentiveTypes,
  getIncentiveTypesBySector,
  createIncentiveType,
  updateIncentiveType,
  deleteIncentiveType,
  getIncentiveTypeCategories
};