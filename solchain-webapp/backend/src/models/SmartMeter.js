const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SmartMeter = sequelize.define('SmartMeter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meterId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deviceType: {
    type: DataTypes.ENUM('solar_panel', 'battery', 'inverter', 'grid_meter', 'smart_appliance'),
    allowNull: false,
    defaultValue: 'solar_panel'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  currentEnergyGenerated: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0.0000,
    validate: {
      min: 0
    }
  },
  currentEnergyConsumed: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0.0000,
    validate: {
      min: 0
    }
  },
  totalEnergyGenerated: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0.0000,
    validate: {
      min: 0
    }
  },
  totalEnergyConsumed: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0.0000,
    validate: {
      min: 0
    }
  },
  efficiency: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  capacity: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
    allowNull: false,
    defaultValue: 'active'
  },
  lastReadingAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  installationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  firmware: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'smart_meters',
  indexes: [
    { fields: ['meterId'] },
    { fields: ['userId'] },
    { fields: ['deviceType'] },
    { fields: ['status'] },
    { fields: ['serialNumber'] },
    { fields: ['lastReadingAt'] }
  ]
});

// Define associations
SmartMeter.associate = (models) => {
  SmartMeter.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = SmartMeter;