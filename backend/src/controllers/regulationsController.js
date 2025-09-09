const { Regulation, User } = require('../models');
const { Op } = require('sequelize');

// Get all regulations
const getAllRegulations = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isPublished: true
    };

    // Add category filter
    if (category && category !== 'Tümü') {
      whereClause.category = category;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const regulations = await Regulation.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: regulations.rows,
      pagination: {
        total: regulations.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(regulations.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching regulations:', error);
    res.status(500).json({
      success: false,
      message: 'Mevzuatlar getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Get regulation by ID
const getRegulationById = async (req, res) => {
  try {
    const { id } = req.params;

    const regulation = await Regulation.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    if (!regulation) {
      return res.status(404).json({
        success: false,
        message: 'Mevzuat bulunamadı'
      });
    }

    res.json({
      success: true,
      data: regulation
    });
  } catch (error) {
    console.error('Error fetching regulation:', error);
    res.status(500).json({
      success: false,
      message: 'Mevzuat getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Create new regulation (Admin only)
const createRegulation = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const authorId = req.user.id;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Başlık, içerik ve kategori alanları zorunludur'
      });
    }

    const regulation = await Regulation.create({
      title,
      content,
      category,
      authorId,
      isPublished: true
    });

    // Fetch the created regulation with author info
    const createdRegulation = await Regulation.findByPk(regulation.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Mevzuat başarıyla oluşturuldu',
      data: createdRegulation
    });
  } catch (error) {
    console.error('Error creating regulation:', error);
    res.status(500).json({
      success: false,
      message: 'Mevzuat oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Update regulation (Admin only)
const updateRegulation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished } = req.body;

    const regulation = await Regulation.findByPk(id);

    if (!regulation) {
      return res.status(404).json({
        success: false,
        message: 'Mevzuat bulunamadı'
      });
    }

    // Update regulation
    await regulation.update({
      title: title || regulation.title,
      content: content || regulation.content,
      category: category || regulation.category,
      isPublished: isPublished !== undefined ? isPublished : regulation.isPublished
    });

    // Fetch updated regulation with author info
    const updatedRegulation = await Regulation.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Mevzuat başarıyla güncellendi',
      data: updatedRegulation
    });
  } catch (error) {
    console.error('Error updating regulation:', error);
    res.status(500).json({
      success: false,
      message: 'Mevzuat güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Delete regulation (Admin only)
const deleteRegulation = async (req, res) => {
  try {
    const { id } = req.params;

    const regulation = await Regulation.findByPk(id);

    if (!regulation) {
      return res.status(404).json({
        success: false,
        message: 'Mevzuat bulunamadı'
      });
    }

    await regulation.destroy();

    res.json({
      success: true,
      message: 'Mevzuat başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting regulation:', error);
    res.status(500).json({
      success: false,
      message: 'Mevzuat silinirken hata oluştu',
      error: error.message
    });
  }
};

// Get regulation categories
const getRegulationCategories = async (req, res) => {
  try {
    const categories = await Regulation.findAll({
      attributes: ['category'],
      where: { isPublished: true },
      group: ['category'],
      raw: true
    });

    const categoryList = categories.map(cat => cat.category);

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  getRegulationCategories
};