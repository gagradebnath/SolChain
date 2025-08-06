const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EnergyTransaction = sequelize.define('EnergyTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  blockchainHash: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  energyAmount: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    validate: {
      min: 0.0001
    }
  },
  pricePerUnit: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
    validate: {
      min: 0.000001
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false,
    validate: {
      min: 0.000001
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ETH',
    validate: {
      isIn: [['ETH', 'USDT', 'ST']]
    }
  },
  transactionType: {
    type: DataTypes.ENUM('purchase', 'sale', 'transfer'),
    allowNull: false,
    defaultValue: 'purchase'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  energySource: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'other']]
    }
  },
  carbonCredits: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true,
    defaultValue: 0.0000
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'energy_transactions',
  indexes: [
    { fields: ['transactionId'] },
    { fields: ['blockchainHash'] },
    { fields: ['senderId'] },
    { fields: ['receiverId'] },
    { fields: ['status'] },
    { fields: ['transactionType'] },
    { fields: ['created_at'] }
  ]
});

// Define associations
EnergyTransaction.associate = (models) => {
  EnergyTransaction.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  EnergyTransaction.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiver'
  });
};

module.exports = EnergyTransaction;