const { User, Sector } = require('../models');
const { Op } = require('sequelize');

// Get all users with filtering
const getAllUsers = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get users with filtering and pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'companyName', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: offset + users.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Kullanıcılar getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Geçersiz durum değeri',
        validStatuses 
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && status === 'inactive') {
      return res.status(400).json({ 
        message: 'Kendi hesabınızı pasife alamazsınız' 
      });
    }
    
    // Update status
    await user.update({ status });
    
    res.json({
      message: 'Kullanıcı durumu güncellendi',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı durumu güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['company', 'consultant', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Geçersiz rol değeri',
        validRoles 
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Kendi rolünüzü değiştiremezsiniz' 
      });
    }
    
    // Update role
    await user.update({ role });
    
    res.json({
      message: 'Kullanıcı rolü güncellendi',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı rolü güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user sector
const updateUserSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectorId } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Validate sector if provided
    if (sectorId) {
      const sector = await Sector.findByPk(sectorId);
      if (!sector || !sector.isActive) {
        return res.status(400).json({ message: 'Geçersiz sektör seçimi' });
      }
    }
    
    // Update sector
    await user.update({ sectorId: sectorId || null });
    
    // Get updated user with sector info
    const updatedUser = await User.findByPk(id, {
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name', 'description']
      }],
      attributes: ['id', 'fullName', 'email', 'role', 'sectorId']
    });
    
    res.json({
      message: 'Kullanıcı sektörü güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user sector error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı sektörü güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user (role, status, sector)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, sector } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from changing their own role or deactivating themselves
    if (user.id === req.user.id) {
      if (role && role !== user.role) {
        return res.status(400).json({ 
          message: 'Kendi rolünüzü değiştiremezsiniz' 
        });
      }
      if (status === 'inactive') {
        return res.status(400).json({ 
          message: 'Kendi hesabınızı pasife alamazsınız' 
        });
      }
    }
    
    // Validate role if provided
    if (role) {
      const validRoles = ['company', 'consultant', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Geçersiz rol değeri',
          validRoles 
        });
      }
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'active', 'inactive'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Geçersiz durum değeri',
          validStatuses 
        });
      }
    }
    
    // Find sector by name if provided
    let sectorId = user.sectorId;
    if (sector !== undefined) {
      if (sector) {
        const sectorRecord = await Sector.findOne({
          where: { name: sector, isActive: true }
        });
        if (!sectorRecord) {
          return res.status(400).json({ message: 'Geçersiz sektör seçimi' });
        }
        sectorId = sectorRecord.id;
      } else {
        sectorId = null;
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (sector !== undefined) updateData.sectorId = sectorId;
    
    // Update user
    await user.update(updateData);
    
    // Get updated user with sector info
    const updatedUser = await User.findByPk(id, {
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name', 'description']
      }],
      attributes: ['id', 'fullName', 'companyName', 'email', 'role', 'status', 'sectorId', 'createdAt']
    });
    
    res.json({
      message: 'Kullanıcı güncellendi',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        companyName: updatedUser.companyName,
        email: updatedUser.email,
        role: updatedUser.role,
        sector: updatedUser.sector?.name || null,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Soft delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Kendi hesabınızı silemezsiniz' 
      });
    }
    
    // Soft delete by setting status to inactive
    await user.update({ status: 'inactive' });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı silinirken hata oluştu',
      error: error.message 
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const pendingUsers = await User.count({ where: { status: 'pending' } });
    const activeUsers = await User.count({ where: { status: 'active' } });
    const companies = await User.count({ where: { role: 'company' } });
    const consultants = await User.count({ where: { role: 'consultant' } });
    
    res.json({
      totalUsers,
      pendingUsers,
      activeUsers,
      companies,
      consultants
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Assign consultants to sectors (ensure min 3 per sector)
const assignConsultantsToSectors = async (req, res) => {
  try {
    // Get all active sectors
    const sectors = await Sector.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    // Get all consultants without sector assignment
    const unassignedConsultants = await User.findAll({
      where: {
        role: 'consultant',
        status: 'active',
        sectorId: null
      },
      order: [['createdAt', 'ASC']]
    });

    if (unassignedConsultants.length === 0) {
      return res.status(400).json({ message: 'Atanacak danışman bulunamadı' });
    }

    const assignments = [];
    let consultantIndex = 0;

    // Assign consultants to sectors in round-robin fashion
    for (const sector of sectors) {
      // Check current consultant count in this sector
      const currentCount = await User.count({
        where: {
          role: 'consultant',
          sectorId: sector.id,
          status: 'active'
        }
      });

      // Assign consultants to reach minimum of 3 per sector
      const needed = Math.max(0, 3 - currentCount);
      
      for (let i = 0; i < needed && consultantIndex < unassignedConsultants.length; i++) {
        const consultant = unassignedConsultants[consultantIndex];
        await consultant.update({ sectorId: sector.id });
        
        assignments.push({
          consultantId: consultant.id,
          consultantName: consultant.fullName,
          sectorId: sector.id,
          sectorName: sector.name
        });
        
        consultantIndex++;
      }
    }

    // If there are remaining consultants, distribute them evenly
    if (consultantIndex < unassignedConsultants.length) {
      let sectorIndex = 0;
      
      while (consultantIndex < unassignedConsultants.length) {
        const sector = sectors[sectorIndex % sectors.length];
        const consultant = unassignedConsultants[consultantIndex];
        
        await consultant.update({ sectorId: sector.id });
        
        assignments.push({
          consultantId: consultant.id,
          consultantName: consultant.fullName,
          sectorId: sector.id,
          sectorName: sector.name
        });
        
        consultantIndex++;
        sectorIndex++;
      }
    }

    res.json({
      message: `${assignments.length} danışman sektörlere atandı`,
      assignments
    });
  } catch (error) {
    console.error('Assign consultants to sectors error:', error);
    res.status(500).json({ 
      message: 'Danışmanlar sektörlere atanırken hata oluştu',
      error: error.message 
    });
  }
};

// Get sector distribution statistics
const getSectorDistribution = async (req, res) => {
  try {
    const sectors = await Sector.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'fullName', 'email', 'role', 'status'],
        where: { status: 'active' },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    const distribution = sectors.map(sector => {
      const users = sector.users || [];
      const consultants = users.filter(user => user.role === 'consultant');
      const companies = users.filter(user => user.role === 'company');
      
      return {
        sectorId: sector.id,
        sectorName: sector.name,
        totalUsers: users.length,
        consultants: consultants.length,
        companies: companies.length,
        consultantList: consultants.map(c => ({
          id: c.id,
          fullName: c.fullName,
          email: c.email
        })),
        companyList: companies.map(c => ({
          id: c.id,
          fullName: c.fullName,
          email: c.email
        }))
      };
    });

    res.json({
      success: true,
      distribution
    });
  } catch (error) {
    console.error('Get sector distribution error:', error);
    res.status(500).json({ 
      message: 'Sektör dağılımı getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Assign members (companies) to sectors based on their business area
const assignMembersToSectors = async (req, res) => {
  try {
    // Get all companies without sector assignment
    const companies = await User.findAll({
      where: {
        role: 'company',
        sectorId: null
      },
      include: [{
        model: Sector,
        as: 'sector'
      }]
    });

    if (companies.length === 0) {
      return res.json({
        message: 'Sektör ataması yapılacak şirket bulunamadı',
        assignments: []
      });
    }

    // Get all active sectors
    const sectors = await Sector.findAll({
      where: { isActive: true }
    });

    if (sectors.length === 0) {
      return res.status(400).json({
        message: 'Aktif sektör bulunamadı'
      });
    }

    const assignments = [];
    
    // Simple round-robin assignment for companies
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const sector = sectors[i % sectors.length];
      
      await company.update({ sectorId: sector.id });
      
      assignments.push({
        userId: company.id,
        userName: company.companyName || company.fullName,
        sectorId: sector.id,
        sectorName: sector.name
      });
    }

    res.json({
      message: `${assignments.length} şirket sektörlere atandı`,
      assignments
    });
  } catch (error) {
    console.error('Şirket sektör atama hatası:', error);
    res.status(500).json({
      message: 'Şirket sektör atama sırasında hata oluştu',
      error: error.message
    });
  }
};

// Get all companies with member count
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get companies with member count and additional details
    const companies = await User.findAll({
      attributes: [
        'companyName',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'memberCount'],
        [User.sequelize.fn('MAX', User.sequelize.col('createdAt')), 'createdAt'],
        [User.sequelize.fn('MAX', User.sequelize.col('sector')), 'sector']
      ],
      where: {
        companyName: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      },
      group: ['companyName'],
      order: [['companyName', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true
    });

    // Enhance companies with additional statistics
    const enhancedCompanies = await Promise.all(companies.map(async (company) => {
      // Get incentive statistics for this company
      const incentiveStats = await User.sequelize.query(`
        SELECT 
          COALESCE(SUM(CAST(i.amount AS DECIMAL)), 0) as totalIncentiveAmount,
          COUNT(i.id) as totalIncentiveCount
        FROM applications a
        LEFT JOIN incentives i ON a.incentiveId = i.id
        LEFT JOIN users u ON a.userId = u.id
        WHERE u.companyName = :companyName AND a.status = 'approved'
      `, {
        replacements: { companyName: company.companyName },
        type: User.sequelize.QueryTypes.SELECT
      });

      // Get consultant usage count (mock data for now)
      const consultantUsageCount = Math.floor(Math.random() * 10) + 1;
      
      // Determine membership status based on user activity
      const activeUsers = await User.count({
        where: {
          companyName: company.companyName,
          status: 'active'
        }
      });
      
      const membershipStatus = activeUsers > 0 ? 'active' : 'inactive';

      return {
        name: company.companyName,
        companyName: company.companyName,
        memberCount: parseInt(company.memberCount),
        totalIncentiveAmount: parseFloat(incentiveStats[0]?.totalIncentiveAmount || 0),
        totalIncentiveCount: parseInt(incentiveStats[0]?.totalIncentiveCount || 0),
        consultantUsageCount,
        membershipStatus,
        createdAt: company.createdAt,
        sector: company.sector
      };
    }));

    // Get total company count for pagination
    const totalCompanies = await User.findAll({
      attributes: ['companyName'],
      where: {
        companyName: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      },
      group: ['companyName'],
      raw: true
    });

    res.json({
      companies: enhancedCompanies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies.length / limit),
        totalCompanies: totalCompanies.length,
        hasNext: offset + companies.length < totalCompanies.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ 
      message: 'Şirketler getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Get company members
const getCompanyMembers = async (req, res) => {
  try {
    const { companyName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: members } = await User.findAndCountAll({
      where: {
        companyName: companyName
      },
      attributes: ['id', 'fullName', 'email', 'role', 'status', 'createdAt', 'sector'],
      include: [{
        model: Sector,
        as: 'sectorInfo',
        attributes: ['id', 'name'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      companyName,
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalMembers: count,
        hasNext: offset + members.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get company members error:', error);
    res.status(500).json({ 
      message: 'Şirket üyeleri getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Assign sectors to all users
const assignSectorsToAllUsers = async (req, res) => {
  try {
    // Tüm aktif sektörleri getir
    const sectors = await Sector.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });
    
    if (sectors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hiç aktif sektör bulunamadı'
      });
    }
    
    // Sektörü olmayan tüm kullanıcıları getir
    const usersWithoutSector = await User.findAll({
      where: {
        sectorId: null
      },
      attributes: ['id', 'fullName', 'email', 'role', 'sectorId']
    });
    
    if (usersWithoutSector.length === 0) {
      return res.json({
        success: true,
        message: 'Tüm kullanıcıların zaten sektörü var',
        assignedCount: 0
      });
    }
    
    // Her kullanıcıya rastgele sektör ata
    let assignedCount = 0;
    const assignments = [];
    
    for (const user of usersWithoutSector) {
      // Rastgele sektör seç
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      
      await User.update(
        { sectorId: randomSector.id },
        { where: { id: user.id } }
      );
      
      assignments.push({
        userId: user.id,
        userName: user.fullName,
        sectorId: randomSector.id,
        sectorName: randomSector.name
      });
      
      assignedCount++;
    }
    
    res.json({
      success: true,
      message: `Toplam ${assignedCount} kullanıcıya sektör ataması yapıldı`,
      assignedCount,
      assignments
    });
  } catch (error) {
    console.error('Assign sectors to all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sektör ataması sırasında hata oluştu',
      error: error.message 
    });
  }
};

// Get consultant companies
const getConsultantCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {
      role: 'consultant',
      companyName: { [Op.not]: null }
    };

    if (search) {
      whereCondition[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: consultantCompanies } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'fullName', 'email', 'companyName', 'phone', 'status', 'createdAt'],
      include: [{
        model: User,
        as: 'companyMembers',
        attributes: ['id', 'fullName', 'email', 'role', 'status'],
        required: false
      }],
      order: [['companyName', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Add member count to each company
    const companiesWithMemberCount = consultantCompanies.map(company => ({
      ...company.toJSON(),
      memberCount: company.companyMembers ? company.companyMembers.length : 0
    }));

    res.json({
      consultantCompanies: companiesWithMemberCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalCompanies: count,
        hasNext: offset + consultantCompanies.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get consultant companies error:', error);
    res.status(500).json({ 
      message: 'Danışman şirketleri getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Get consultant company members
const getConsultantCompanyMembers = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: members } = await User.findAndCountAll({
      where: {
        companyId: companyId,
        role: 'consultant'
      },
      attributes: ['id', 'fullName', 'email', 'phone', 'status', 'createdAt'],
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get company info
    const company = await User.findByPk(companyId, {
      attributes: ['id', 'fullName', 'companyName', 'email']
    });

    res.json({
      company,
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalMembers: count,
        hasNext: offset + members.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get consultant company members error:', error);
    res.status(500).json({ 
      message: 'Danışman şirket üyeleri getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Assign consultants to companies
const assignConsultantsToCompanies = async (req, res) => {
  try {
    // Get all consultants without company assignment
    const unassignedConsultants = await User.findAll({
      where: {
        role: 'consultant',
        companyId: null
      }
    });

    if (unassignedConsultants.length === 0) {
      return res.json({
        message: 'Şirkete atanacak danışman bulunamadı',
        assignments: []
      });
    }

    // Get all consultant companies
    const consultantCompanies = await User.findAll({
      where: {
        role: 'consultant',
        companyName: { [Op.not]: null }
      }
    });

    if (consultantCompanies.length === 0) {
      return res.status(400).json({
        message: 'Danışman şirketi bulunamadı'
      });
    }

    const assignments = [];
    
    // Round-robin assignment
    for (let i = 0; i < unassignedConsultants.length; i++) {
      const consultant = unassignedConsultants[i];
      const company = consultantCompanies[i % consultantCompanies.length];
      
      await consultant.update({ companyId: company.id });
      
      assignments.push({
        consultantId: consultant.id,
        consultantName: consultant.fullName,
        companyId: company.id,
        companyName: company.companyName
      });
    }

    res.json({
      message: `${assignments.length} danışman şirketlere atandı`,
      assignments
    });
  } catch (error) {
    console.error('Assign consultants to companies error:', error);
    res.status(500).json({
      message: 'Danışman şirket atama sırasında hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserSector,
  updateUser,
  deleteUser,
  getUserStats,
  assignConsultantsToSectors,
  getSectorDistribution,
  assignMembersToSectors,
  getCompanies,
  getCompanyMembers,
  assignSectorsToAllUsers,
  getConsultantCompanies,
  getConsultantCompanyMembers,
  assignConsultantsToCompanies
};