const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite Database Configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || path.join(__dirname, '../../database/solchain.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully');
    
    // Sync database models (create tables)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('📋 Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to SQLite database:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};