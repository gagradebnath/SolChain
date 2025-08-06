const { sequelize } = require('../config/database');
const User = require('./User');
const EnergyTransaction = require('./EnergyTransaction');
const SmartMeter = require('./SmartMeter');

// Define all models
const models = {
  User,
  EnergyTransaction,
  SmartMeter
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// User associations
User.hasMany(EnergyTransaction, { foreignKey: 'senderId', as: 'sentTransactions' });
User.hasMany(EnergyTransaction, { foreignKey: 'receiverId', as: 'receivedTransactions' });
User.hasMany(SmartMeter, { foreignKey: 'userId', as: 'smartMeters' });

// EnergyTransaction associations
EnergyTransaction.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
EnergyTransaction.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// SmartMeter associations
SmartMeter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export sequelize instance and models
module.exports = {
  sequelize,
  ...models
};
