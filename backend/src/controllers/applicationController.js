const { Application, User, Incentive, Chat } = require('../models');
const { Op } = require('sequelize');

// Get all applications with filtering and pagination
const getAllApplications = async (req, res) => {
  try {
    const { 
      status, 
      consultantId, 
      companyId, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;
    
    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (consultantId) {
      whereClause.consultantId = consultantId;
    }
    
    if (companyId) {
      whereClause.companyId = companyId;
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Include options for related data
    const includeOptions = [
      {
        model: User,
        as: 'company',
        attributes: ['id', 'fullName', 'companyName', 'email', 'sectorId']
      },
      {
        model: User,
        as: 'consultant',
        attributes: ['id', 'fullName', 'email', 'sectorId'],
        required: false
      },
      {
        model: Incentive,
        as: 'incentives',
        attributes: ['id', 'name', 'type', 'amount'],
        through: { attributes: [] }
      }
    ];
    
    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { '$company.fullName$': { [Op.iLike]: `%${search}%` } },
        { '$company.companyName$': { [Op.iLike]: `%${search}%` } },
        { '$consultant.fullName$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get applications with filtering and pagination
    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    // Format the response data
    const formattedApplications = applications.map(app => {
      const totalAmount = app.incentives.reduce((sum, incentive) => sum + (incentive.amount || 0), 0);
      
      return {
        id: app.id,
        companyName: app.company?.companyName || app.company?.fullName || 'Bilinmeyen Şirket',
        type: app.incentives.length > 0 ? app.incentives.map(i => i.type).join(', ') : 'Teşvik Türü Belirtilmemiş',
        sector: app.company?.sectorId || 'Belirtilmemiş',
        amount: totalAmount,
        status: app.status,
        applicationDate: app.createdAt,
        consultant: app.consultant?.fullName || 'Atanmadı',
        companyId: app.companyId,
        consultantId: app.consultantId,
        incentives: app.incentives
      };
    });
    
    res.json({
      applications: formattedApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalApplications: count,
        hasNext: offset + applications.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ 
      message: 'Başvurular getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'company',
          attributes: ['id', 'fullName', 'companyName', 'email', 'phone', 'sector']
        },
        {
          model: User,
          as: 'consultant',
          attributes: ['id', 'fullName', 'email', 'phone', 'sector'],
          required: false
        },
        {
          model: Incentive,
          as: 'incentives',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ 
      message: 'Başvuru getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = [
      'pending_assignment',
      'in_progress', 
      'document_review',
      'completed',
      'submitted',
      'rejected'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Geçersiz durum değeri',
        validStatuses 
      });
    }
    
    // Find application
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    
    // Update status
    await application.update({ status });
    
    res.json({
      message: 'Başvuru durumu güncellendi',
      application: {
        id: application.id,
        status: application.status
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      message: 'Başvuru durumu güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Assign consultant to application
const assignConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const { consultantId } = req.body;
    
    // Find application
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    
    // Verify consultant exists and has correct role
    if (consultantId) {
      const consultant = await User.findOne({
        where: { 
          id: consultantId, 
          role: 'consultant',
          status: 'active'
        }
      });
      
      if (!consultant) {
        return res.status(400).json({ 
          message: 'Geçersiz danışman ID veya danışman aktif değil' 
        });
      }
    }
    
    // Update consultant assignment
    await application.update({ 
      consultantId,
      status: consultantId ? 'in_progress' : 'pending_assignment'
    });
    
    res.json({
      message: consultantId ? 'Danışman atandı' : 'Danışman ataması kaldırıldı',
      application: {
        id: application.id,
        consultantId: application.consultantId,
        status: application.status
      }
    });
  } catch (error) {
    console.error('Assign consultant error:', error);
    res.status(500).json({ 
      message: 'Danışman atanırken hata oluştu',
      error: error.message 
    });
  }
};

// Auto assign consultant to pending applications
const autoAssignConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find application
    const application = await Application.findByPk(id, {
      include: [{
        model: Incentive,
        as: 'incentives',
        include: [{
          model: require('../models').Sector,
          as: 'sector'
        }]
      }]
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    
    if (application.status !== 'pending_assignment') {
      return res.status(400).json({ message: 'Bu başvuru zaten atanmış veya işlemde' });
    }
    
    // Determine sector from incentives
    let sectorId = null;
    if (application.incentives && application.incentives.length > 0) {
      sectorId = application.incentives[0].sectorId;
    }
    
    // Find available consultant based on sector
    const whereClause = { 
      role: 'consultant',
      status: 'active'
    };
    
    if (sectorId) {
      whereClause.sectorId = sectorId;
    }
    
    let availableConsultant = await User.findOne({
      where: whereClause,
      order: [['createdAt', 'ASC']] // Load balancing: assign to oldest consultant
    });
    
    // If no sector-specific consultant found, assign any available consultant
    if (!availableConsultant && sectorId) {
      availableConsultant = await User.findOne({
        where: { 
          role: 'consultant',
          status: 'active'
        },
        order: [['createdAt', 'ASC']]
      });
    }
    
    if (!availableConsultant) {
      return res.status(404).json({ message: 'Uygun danışman bulunamadı' });
    }
    
    // Assign consultant
    await application.update({ 
      consultantId: availableConsultant.id,
      status: 'in_progress'
    });
    
    res.json({
      message: 'Danışman otomatik olarak atandı',
      application: {
        id: application.id,
        consultantId: availableConsultant.id,
        consultantName: availableConsultant.fullName,
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error('Auto assign consultant error:', error);
    res.status(500).json({ 
      message: 'Otomatik danışman ataması sırasında hata oluştu',
      error: error.message 
    });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const totalApplications = await Application.count();
    const pendingAssignment = await Application.count({ 
      where: { status: 'pending_assignment' } 
    });
    const inProgress = await Application.count({ 
      where: { status: 'in_progress' } 
    });
    const completed = await Application.count({ 
      where: { status: 'completed' } 
    });
    const documentReview = await Application.count({ 
      where: { status: 'document_review' } 
    });
    
    // Calculate total amount from all applications with incentives
    const applicationsWithIncentives = await Application.findAll({
      include: [{
        model: Incentive,
        as: 'incentives',
        attributes: ['amount'],
        through: {
          attributes: []
        }
      }]
    });
    
    const totalAmount = applicationsWithIncentives.reduce((sum, app) => {
      const appAmount = app.incentives.reduce((appSum, incentive) => 
        appSum + (incentive.amount || 0), 0
      );
      return sum + appAmount;
    }, 0);
    
    // Calculate success rate
    const successRate = totalApplications > 0 
      ? Math.round((completed / totalApplications) * 100) 
      : 0;
    
    res.json({
      totalApplications,
      pendingAssignment,
      inProgress,
      completed,
      documentReview,
      totalAmount,
      successRate
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Create new application
const createApplication = async (req, res) => {
  try {
    const { incentiveIds, description, projectDuration } = req.body;
    const companyId = req.user.id;
    const userRole = req.user.role;

    // Only companies can create applications
    if (userRole !== 'company') {
      return res.status(403).json({ 
        message: 'Sadece şirket kullanıcıları başvuru oluşturabilir' 
      });
    }

    // Get company user with sector info
    const company = await User.findByPk(companyId, {
      include: [{
        model: require('../models').Sector,
        as: 'sector'
      }]
    });

    if (!company) {
      return res.status(404).json({ message: 'Şirket bulunamadı' });
    }

    // Create application
    const application = await Application.create({
      companyId,
      status: 'pending_assignment',
      description,
      projectDuration
    });

    // Add incentives to application if provided
    if (incentiveIds && incentiveIds.length > 0) {
      const incentives = await Incentive.findAll({
        where: { id: incentiveIds }
      });
      
      if (incentives.length > 0) {
        await application.addIncentives(incentives);
      }
    }

    // Auto-assign consultant based on sector
    if (company.sectorId) {
      const availableConsultant = await User.findOne({
        where: {
          role: 'consultant',
          status: 'active',
          sectorId: company.sectorId
        },
        order: [['createdAt', 'ASC']] // First available consultant
      });

      if (availableConsultant) {
        await application.update({
          consultantId: availableConsultant.id,
          status: 'in_progress'
        });
      }
    }

    // Create chat for the application
    await Chat.create({
      applicationId: application.id,
      userId: companyId,
      consultantId: application.consultantId,
      status: 'active',
      title: `${company.companyName || company.fullName} - Teşvik Başvurusu`
    });

    // Return application with related data
    const createdApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'company',
          attributes: ['id', 'fullName', 'companyName', 'email']
        },
        {
          model: User,
          as: 'consultant',
          attributes: ['id', 'fullName', 'email'],
          required: false
        },
        {
          model: Incentive,
          as: 'incentives',
          attributes: ['id', 'name', 'type', 'amount'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Başvuru başarıyla oluşturuldu',
      data: createdApplication
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ 
      message: 'Başvuru oluşturulurken hata oluştu',
      error: error.message 
    });
  }
};

// Delete application and related conversations
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the application
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Başvuru bulunamadı' 
      });
    }
    
    // Delete related chats first
    await Chat.destroy({
      where: { applicationId: id }
    });
    
    // Delete the application
    await application.destroy();
    
    res.json({
      success: true,
      message: 'Başvuru ve ilgili konuşmalar başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Başvuru silinirken hata oluştu',
      error: error.message 
    });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  assignConsultant,
  autoAssignConsultant,
  getApplicationStats,
  deleteApplication
};