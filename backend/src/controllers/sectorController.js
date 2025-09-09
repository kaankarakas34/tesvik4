const { Sector, User, Incentive } = require('../models');
const { Op } = require('sequelize');

// Get all sectors
const getAllSectors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await Sector.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'fullName', 'email'],
          required: false
        },
        {
          model: Incentive,
          as: 'incentives',
          attributes: ['id', 'name', 'type'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        sectors: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all sectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektörler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get sector by ID
const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'fullName', 'email', 'role']
        },
        {
          model: Incentive,
          as: 'incentives',
          attributes: ['id', 'name', 'description', 'type', 'amount']
        }
      ]
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sektör bulunamadı'
      });
    }

    res.json({
      success: true,
      data: sector
    });
  } catch (error) {
    console.error('Get sector by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektör getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Create new sector
const createSector = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Sektör adı en az 2 karakter olmalıdır'
      });
    }

    // Check if sector already exists
    const existingSector = await Sector.findOne({
      where: { name: name.trim() }
    });

    if (existingSector) {
      return res.status(409).json({
        success: false,
        message: 'Bu isimde bir sektör zaten mevcut'
      });
    }

    const sector = await Sector.create({
      name: name.trim(),
      description: description?.trim() || null,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'Sektör başarıyla oluşturuldu',
      data: sector
    });
  } catch (error) {
    console.error('Create sector error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektör oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Update sector
const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sektör bulunamadı'
      });
    }

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Sektör adı en az 2 karakter olmalıdır'
      });
    }

    // Check if new name already exists (excluding current sector)
    if (name && name.trim() !== sector.name) {
      const existingSector = await Sector.findOne({
        where: {
          name: name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingSector) {
        return res.status(409).json({
          success: false,
          message: 'Bu isimde bir sektör zaten mevcut'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await sector.update(updateData);

    res.json({
      success: true,
      message: 'Sektör başarıyla güncellendi',
      data: sector
    });
  } catch (error) {
    console.error('Update sector error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektör güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Delete sector
const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sektör bulunamadı'
      });
    }

    // Check if sector has users or incentives
    const userCount = await User.count({ where: { sectorId: id } });
    const incentiveCount = await Incentive.count({ where: { sectorId: id } });

    if (userCount > 0 || incentiveCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu sektör silinemez. ${userCount} kullanıcı ve ${incentiveCount} teşvik ile ilişkili.`,
        data: {
          userCount,
          incentiveCount
        }
      });
    }

    await sector.destroy();

    res.json({
      success: true,
      message: 'Sektör başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete sector error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektör silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Toggle sector status
const toggleSectorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sektör bulunamadı'
      });
    }

    await sector.update({ isActive: !sector.isActive });

    res.json({
      success: true,
      message: `Sektör ${sector.isActive ? 'aktif' : 'pasif'} hale getirildi`,
      data: sector
    });
  } catch (error) {
    console.error('Toggle sector status error:', error);
    res.status(500).json({
      success: false,
      message: 'Sektör durumu değiştirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get active sectors (for dropdowns)
const getActiveSectors = async (req, res) => {
  try {
    const sectors = await Sector.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: sectors
    });
  } catch (error) {
    console.error('Get active sectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif sektörler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  getActiveSectors
};