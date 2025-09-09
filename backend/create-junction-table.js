const { sequelize } = require('./src/models');

async function createApplicationIncentivesTable() {
  try {
    console.log('🔧 ApplicationIncentives junction table oluşturuluyor...');
    
    // Önce mevcut table'ı sil
    await sequelize.query('DROP TABLE IF EXISTS "ApplicationIncentives";');
    
    // Raw SQL ile table oluştur
    await sequelize.query(`
      CREATE TABLE "ApplicationIncentives" (
        id SERIAL PRIMARY KEY,
        application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
        incentive_id INTEGER NOT NULL REFERENCES incentives(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(application_id, incentive_id)
      );
    `);
    
    console.log('✅ ApplicationIncentives table başarıyla oluşturuldu!');
    
    // Test için bir kayıt ekleyelim
    const [applications] = await sequelize.query('SELECT id FROM applications LIMIT 1');
    const [incentives] = await sequelize.query('SELECT id FROM incentives LIMIT 1');
    
    if (applications.length > 0 && incentives.length > 0) {
      await sequelize.query(`
        INSERT INTO "ApplicationIncentives" (application_id, incentive_id, created_at, updated_at)
        VALUES ('${applications[0].id}', ${incentives[0].id}, NOW(), NOW())
        ON CONFLICT (application_id, incentive_id) DO NOTHING;
      `);
      console.log('✅ Test verisi eklendi!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createApplicationIncentivesTable();