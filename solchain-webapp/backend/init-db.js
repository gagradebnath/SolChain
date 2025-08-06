const { sequelize } = require('./src/config/database');
const models = require('./src/models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing SQLite database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Create tables if they don't exist
    await sequelize.sync({ force: false });
    console.log('📋 Database tables synchronized');
    
    console.log('🎉 Database initialization completed successfully!');
    
    // Optional: Create sample data
    if (process.argv.includes('--seed')) {
      await seedDatabase();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');
  
  try {
    const { User, SmartMeter, EnergyTransaction } = models;
    
    // Create sample users
    const sampleUsers = [
      {
        username: 'alice_solar',
        email: 'alice@example.com',
        password: 'password123',
        walletAddress: '0x742d35Cc6634C0532925a3b8D53aD24E659B47c4',
        role: 'producer',
        isVerified: true
      },
      {
        username: 'bob_consumer',
        email: 'bob@example.com',
        password: 'password123',
        walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        role: 'consumer',
        isVerified: true
      }
    ];
    
    for (const userData of sampleUsers) {
      const [user] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData
      });
      console.log(`✅ Created user: ${user.username}`);
    }
    
    console.log('🎉 Sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, seedDatabase };
