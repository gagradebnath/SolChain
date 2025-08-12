# Database - SolChain Data Management

## Overview
The database component manages all persistent data for the SolChain platform using SQLite with Knex.js as the query builder and migration tool. It handles user data, energy consumption/production records, trading transactions, IoT device information, and system configurations.

## Technology Stack
- **Database Engine**: SQLite 3
- **Query Builder**: Knex.js
- **Migration Tool**: Knex migrations
- **Connection Pooling**: Built-in SQLite connection pooling
- **Backup**: SQLite backup utilities
- **Monitoring**: Custom database monitoring tools
- **Testing**: SQLite in-memory databases for testing

## Database Structure
```
database/
├── knexfile.js              # Knex configuration file
├── migrations/              # Database schema migrations
│   ├── 001_create_users_table.js
│   ├── 002_create_energy_data_table.js
│   ├── 003_create_trading_table.js
│   ├── 004_create_transactions_table.js
│   └── 005_create_iot_devices_table.js
├── seeds/                   # Database seed data
│   ├── 001_users.js
│   ├── 002_sample_devices.js
│   └── 003_sample_data.js
├── backup/                  # Database backups
├── schema.sql              # Complete schema documentation
└── utils/                  # Database utilities
    ├── connection.js       # Database connection manager
    ├── backup.js          # Backup utilities
    └── monitoring.js      # Performance monitoring
```

## Setup Instructions

### Prerequisites
```bash
# Node.js v16 or higher
node --version

# Navigate to database directory (if running standalone)
cd database

# Install dependencies
npm install knex sqlite3
```

### Configuration
The database is configured through `knexfile.js`:

```javascript
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/solchain_dev.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database/solchain_prod.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
```

### Database Initialization
```bash
# Run migrations to create tables
npx knex migrate:latest

# Seed database with sample data
npx knex seed:run

# Check migration status
npx knex migrate:status

# Rollback last migration (if needed)
npx knex migrate:rollback
```

## Database Schema

### 1. Users Table (`migrations/001_create_users_table.js`)

**Purpose**: Store user account information and authentication data

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('wallet_address').unique();
    table.decimal('lat', 10, 8);
    table.decimal('lng', 11, 8);
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('country');
    table.string('postal_code');
    table.json('preferences');
    table.enum('user_type', ['consumer', 'prosumer', 'admin']).defaultTo('consumer');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.timestamp('email_verified_at');
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['wallet_address']);
    table.index(['lat', 'lng']);
    table.index(['status']);
  });
};
```

**Key Fields**:
- `id`: Primary key
- `email`: Unique email for authentication
- `password_hash`: Encrypted password
- `wallet_address`: Blockchain wallet address
- `lat`, `lng`: Geographic coordinates for location-based services
- `preferences`: JSON object storing user settings
- `user_type`: Consumer (only buys), Prosumer (buys/sells), Admin
- `status`: Account status for access control

### 2. Energy Data Table (`migrations/002_create_energy_data_table.js`)

**Purpose**: Store time-series energy consumption and production data

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('energy_data', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('device_id').notNullable();
    table.enum('data_type', ['consumption', 'production']).notNullable();
    table.decimal('energy_amount', 10, 4).notNullable(); // kWh with 4 decimal precision
    table.decimal('instantaneous_power', 10, 4); // kW current reading
    table.timestamp('recorded_at').notNullable();
    table.decimal('cost', 10, 4); // Associated cost
    table.decimal('carbon_footprint', 10, 4); // kg CO2
    table.json('metadata'); // Device-specific additional data
    table.enum('quality', ['excellent', 'good', 'fair', 'poor']).defaultTo('good');
    table.boolean('validated').defaultTo(false);
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['user_id', 'recorded_at']);
    table.index(['device_id', 'recorded_at']);
    table.index(['data_type', 'recorded_at']);
    table.index(['recorded_at']);
  });
};
```

**Key Fields**:
- `user_id`: Links to users table
- `device_id`: IoT device identifier
- `data_type`: Consumption or production
- `energy_amount`: Energy in kWh
- `instantaneous_power`: Current power draw/generation in kW
- `recorded_at`: Timestamp of measurement
- `metadata`: JSON object for additional device data
- `quality`: Data quality indicator
- `validated`: Whether data has been verified

### 3. Trading Table (`migrations/003_create_trading_table.js`)

**Purpose**: Store energy trading orders and marketplace data

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('trading', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('order_type', ['buy', 'sell']).notNullable();
    table.decimal('energy_amount', 10, 4).notNullable(); // kWh
    table.decimal('price_per_kwh', 8, 6).notNullable(); // Price with high precision
    table.decimal('total_value', 12, 6); // Total order value
    table.timestamp('available_from').notNullable();
    table.timestamp('available_until').notNullable();
    table.decimal('lat', 10, 8); // Geographic constraints
    table.decimal('lng', 11, 8);
    table.decimal('max_distance', 8, 2); // Maximum delivery distance in km
    table.enum('status', ['active', 'partial', 'completed', 'cancelled', 'expired']).defaultTo('active');
    table.integer('matched_order_id').unsigned(); // Reference to matched order
    table.decimal('filled_amount', 10, 4).defaultTo(0); // Amount already traded
    table.json('requirements'); // Special requirements (e.g., renewable only)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    
    // Indexes
    table.index(['order_type', 'status']);
    table.index(['available_from', 'available_until']);
    table.index(['lat', 'lng']);
    table.index(['price_per_kwh']);
    table.index(['user_id', 'status']);
  });
};
```

**Key Fields**:
- `order_type`: Buy or sell order
- `energy_amount`: Amount of energy in kWh
- `price_per_kwh`: Price per kilowatt-hour
- `available_from/until`: Time window for energy delivery
- `lat`, `lng`, `max_distance`: Geographic constraints
- `status`: Order lifecycle status
- `matched_order_id`: Links to the matched counterpart order
- `filled_amount`: Partially filled orders tracking

### 4. Transactions Table (`migrations/004_create_transactions_table.js`)

**Purpose**: Store financial transactions and payment records

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.integer('from_user_id').unsigned().references('id').inTable('users');
    table.integer('to_user_id').unsigned().references('id').inTable('users');
    table.integer('trading_order_id').unsigned().references('id').inTable('trading');
    table.decimal('amount', 12, 6).notNullable(); // SolarToken amount
    table.decimal('energy_amount', 10, 4); // Associated energy amount
    table.enum('transaction_type', [
      'energy_trade',
      'staking_reward',
      'token_transfer',
      'fee_payment',
      'governance_reward',
      'penalty'
    ]).notNullable();
    table.string('blockchain_tx_hash').unique(); // Blockchain transaction reference
    table.enum('status', ['pending', 'confirmed', 'failed', 'cancelled']).defaultTo('pending');
    table.json('metadata'); // Additional transaction details
    table.text('description');
    table.decimal('gas_fee', 10, 6); // Transaction gas cost
    table.integer('block_number'); // Blockchain block number
    table.timestamp('confirmed_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['from_user_id']);
    table.index(['to_user_id']);
    table.index(['transaction_type', 'status']);
    table.index(['blockchain_tx_hash']);
    table.index(['created_at']);
  });
};
```

**Key Fields**:
- `from_user_id`, `to_user_id`: Transaction participants
- `trading_order_id`: Links to the trading order
- `amount`: Transaction amount in SolarTokens
- `transaction_type`: Categorizes transaction purpose
- `blockchain_tx_hash`: Reference to blockchain transaction
- `status`: Transaction status tracking
- `gas_fee`: Blockchain transaction cost
- `block_number`: Blockchain confirmation block

### 5. IoT Devices Table (`migrations/005_create_iot_devices_table.js`)

**Purpose**: Store IoT device registration and configuration data

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('iot_devices', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('device_id').unique().notNullable();
    table.enum('device_type', [
      'smart_meter',
      'solar_panel',
      'battery_storage',
      'ev_charger',
      'heat_pump',
      'inverter',
      'weather_station'
    ]).notNullable();
    table.string('manufacturer');
    table.string('model');
    table.string('firmware_version');
    table.string('name'); // User-friendly name
    table.string('location'); // Physical location description
    table.decimal('lat', 10, 8); // GPS coordinates
    table.decimal('lng', 11, 8);
    table.json('specifications'); // Device capabilities and limits
    table.json('configuration'); // Current device settings
    table.enum('status', ['active', 'inactive', 'error', 'maintenance']).defaultTo('active');
    table.timestamp('last_seen');
    table.timestamp('last_maintenance');
    table.timestamp('next_maintenance');
    table.decimal('battery_level', 5, 2); // For battery-powered devices
    table.json('communication_settings'); // MQTT, LoRaWAN, etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id', 'status']);
    table.index(['device_type']);
    table.index(['device_id']);
    table.index(['status']);
    table.index(['last_seen']);
  });
};
```

**Key Fields**:
- `device_id`: Unique device identifier
- `device_type`: Category of IoT device
- `specifications`: JSON object with device capabilities
- `configuration`: Current device settings
- `status`: Device operational status
- `last_seen`: Last communication timestamp
- `battery_level`: For wireless devices
- `communication_settings`: Connection configuration

## Advanced Features

### Data Partitioning
For high-volume time-series data, implement logical partitioning:

```javascript
// Create monthly partitions for energy_data
exports.up = function(knex) {
  return knex.schema.createTable('energy_data_2025_08', function(table) {
    // Same schema as energy_data
    // ... table definition
    
    // Additional constraint for partition
    table.check('recorded_at >= ? AND recorded_at < ?', [
      '2025-08-01 00:00:00',
      '2025-09-01 00:00:00'
    ]);
  });
};
```

### Indexes for Performance
```javascript
// Additional indexes for complex queries
exports.up = function(knex) {
  return knex.schema.table('energy_data', function(table) {
    // Composite index for user energy analytics
    table.index(['user_id', 'data_type', 'recorded_at'], 'idx_user_energy_timeline');
    
    // Index for energy amount range queries
    table.index(['energy_amount', 'recorded_at'], 'idx_energy_amount_time');
    
    // Covering index for dashboard queries
    table.index(['user_id', 'device_id', 'data_type', 'recorded_at'], 'idx_dashboard_covering');
  });
};
```

### Views for Complex Queries
```javascript
// Create database views for common queries
exports.up = function(knex) {
  return knex.raw(`
    CREATE VIEW user_energy_summary AS
    SELECT 
      u.id as user_id,
      u.email,
      u.user_type,
      COALESCE(consumption.total_consumption, 0) as total_consumption,
      COALESCE(production.total_production, 0) as total_production,
      COALESCE(production.total_production, 0) - COALESCE(consumption.total_consumption, 0) as net_production
    FROM users u
    LEFT JOIN (
      SELECT user_id, SUM(energy_amount) as total_consumption
      FROM energy_data 
      WHERE data_type = 'consumption'
      GROUP BY user_id
    ) consumption ON u.id = consumption.user_id
    LEFT JOIN (
      SELECT user_id, SUM(energy_amount) as total_production
      FROM energy_data 
      WHERE data_type = 'production'
      GROUP BY user_id
    ) production ON u.id = production.user_id
  `);
};
```

## Database Utilities

### Connection Manager (`utils/connection.js`)
```javascript
const knex = require('knex');
const config = require('../knexfile');

class DatabaseConnection {
  constructor() {
    const environment = process.env.NODE_ENV || 'development';
    this.knex = knex(config[environment]);
  }
  
  async testConnection() {
    try {
      await this.knex.raw('SELECT 1');
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
  
  async closeConnection() {
    await this.knex.destroy();
  }
  
  // Transaction wrapper
  async transaction(callback) {
    return this.knex.transaction(callback);
  }
  
  // Query builder helpers
  getKnex() {
    return this.knex;
  }
}

module.exports = new DatabaseConnection();
```

### Backup Utilities (`utils/backup.js`)
```javascript
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DatabaseBackup {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.backupDir = path.join(__dirname, '../backup');
  }
  
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `solchain_backup_${timestamp}.db`;
    const backupPath = path.join(this.backupDir, backupFileName);
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Copy database file
      await fs.copyFile(this.dbPath, backupPath);
      
      // Compress backup
      await execAsync(`gzip ${backupPath}`);
      
      console.log(`Backup created: ${backupPath}.gz`);
      return `${backupPath}.gz`;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }
  
  async restoreBackup(backupPath) {
    try {
      // Decompress if needed
      if (backupPath.endsWith('.gz')) {
        await execAsync(`gunzip -c ${backupPath} > ${this.dbPath}`);
      } else {
        await fs.copyFile(backupPath, this.dbPath);
      }
      
      console.log(`Database restored from: ${backupPath}`);
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
  
  async scheduleBackups(intervalHours = 24) {
    setInterval(async () => {
      await this.createBackup();
    }, intervalHours * 60 * 60 * 1000);
    
    console.log(`Scheduled backups every ${intervalHours} hours`);
  }
  
  async cleanOldBackups(retentionDays = 30) {
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

module.exports = DatabaseBackup;
```

### Performance Monitoring (`utils/monitoring.js`)
```javascript
class DatabaseMonitor {
  constructor(knex) {
    this.knex = knex;
    this.queryStats = {
      totalQueries: 0,
      slowQueries: [],
      averageQueryTime: 0
    };
  }
  
  startMonitoring() {
    this.knex.on('query', (query) => {
      query.startTime = Date.now();
    });
    
    this.knex.on('query-response', (response, query) => {
      const duration = Date.now() - query.startTime;
      this.recordQuery(query, duration);
    });
    
    this.knex.on('query-error', (error, query) => {
      console.error('Query error:', error);
      console.error('Query:', query.sql);
    });
  }
  
  recordQuery(query, duration) {
    this.queryStats.totalQueries++;
    
    // Track slow queries (>1000ms)
    if (duration > 1000) {
      this.queryStats.slowQueries.push({
        sql: query.sql,
        duration: duration,
        timestamp: new Date()
      });
      
      // Keep only last 100 slow queries
      if (this.queryStats.slowQueries.length > 100) {
        this.queryStats.slowQueries.shift();
      }
    }
    
    // Update average query time
    this.queryStats.averageQueryTime = 
      (this.queryStats.averageQueryTime * (this.queryStats.totalQueries - 1) + duration) / 
      this.queryStats.totalQueries;
  }
  
  getStats() {
    return {
      ...this.queryStats,
      slowQueryCount: this.queryStats.slowQueries.length
    };
  }
  
  async getDatabaseSize() {
    const result = await this.knex.raw("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
    return result[0].size;
  }
  
  async getTableSizes() {
    const tables = ['users', 'energy_data', 'trading', 'transactions', 'iot_devices'];
    const sizes = {};
    
    for (const table of tables) {
      const result = await this.knex(table).count('* as count');
      sizes[table] = result[0].count;
    }
    
    return sizes;
  }
}

module.exports = DatabaseMonitor;
```

## Sample Data Seeds

### Users Seed (`seeds/001_users.js`)
```javascript
exports.seed = function(knex) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        {
          id: 1,
          email: 'alice@solchain.com',
          password_hash: '$2b$10$...',
          first_name: 'Alice',
          last_name: 'Johnson',
          wallet_address: '0x742d35Cc6585C6E0B6d9F2f8c6b5b9c8d5b8a9e7',
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Solar Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          user_type: 'prosumer',
          preferences: JSON.stringify({
            notifications: true,
            renewable_only: true,
            max_trade_distance: 50
          })
        },
        {
          id: 2,
          email: 'bob@solchain.com',
          password_hash: '$2b$10$...',
          first_name: 'Bob',
          last_name: 'Smith',
          wallet_address: '0x8f3c2A4E9D5F7B2C8A1E6F9D3C7B5A8E2F4D9C1A',
          lat: 40.7589,
          lng: -73.9851,
          address: '456 Energy Avenue',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          user_type: 'consumer',
          preferences: JSON.stringify({
            notifications: true,
            price_alerts: true,
            max_price_per_kwh: 0.20
          })
        }
      ]);
    });
};
```

### IoT Devices Seed (`seeds/002_sample_devices.js`)
```javascript
exports.seed = function(knex) {
  return knex('iot_devices').del()
    .then(function () {
      return knex('iot_devices').insert([
        {
          id: 1,
          user_id: 1,
          device_id: 'SP_001_ALICE_ROOFTOP',
          device_type: 'solar_panel',
          manufacturer: 'SolarTech',
          model: 'ST-350W-MONO',
          firmware_version: '2.1.3',
          name: 'Rooftop Solar Array',
          location: 'Rooftop - South Facing',
          lat: 40.7128,
          lng: -74.0060,
          specifications: JSON.stringify({
            capacity_kw: 5.0,
            panel_count: 14,
            efficiency: 0.20,
            technology: 'monocrystalline'
          }),
          configuration: JSON.stringify({
            tilt_angle: 30,
            azimuth: 180,
            tracking: false
          }),
          status: 'active'
        },
        {
          id: 2,
          user_id: 1,
          device_id: 'SM_001_ALICE_MAIN',
          device_type: 'smart_meter',
          manufacturer: 'GridSmart',
          model: 'GS-2000',
          firmware_version: '1.8.2',
          name: 'Main House Meter',
          location: 'Utility Room',
          lat: 40.7128,
          lng: -74.0060,
          specifications: JSON.stringify({
            max_current: 200,
            voltage: 240,
            accuracy: 0.99,
            communication: ['wifi', 'zigbee']
          }),
          status: 'active'
        }
      ]);
    });
};
```

## Query Examples

### Common Queries
```javascript
// Get user's energy balance for the last 30 days
async function getUserEnergyBalance(userId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await knex('energy_data')
    .select('data_type')
    .sum('energy_amount as total')
    .where('user_id', userId)
    .where('recorded_at', '>=', cutoffDate)
    .groupBy('data_type');
  
  return result;
}

// Get active trading orders in a geographic area
async function getLocalTradingOrders(lat, lng, radiusKm = 50) {
  const result = await knex('trading')
    .select('*')
    .where('status', 'active')
    .whereRaw(`
      (6371 * acos(cos(radians(?)) * cos(radians(lat)) * 
      cos(radians(lng) - radians(?)) + sin(radians(?)) * 
      sin(radians(lat)))) <= ?
    `, [lat, lng, lat, radiusKm]);
  
  return result;
}

// Get device performance analytics
async function getDevicePerformance(deviceId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await knex('energy_data')
    .select(
      knex.raw('DATE(recorded_at) as date'),
      knex.raw('SUM(energy_amount) as daily_total'),
      knex.raw('AVG(energy_amount) as average'),
      knex.raw('MAX(instantaneous_power) as peak_power')
    )
    .where('device_id', deviceId)
    .where('recorded_at', '>=', cutoffDate)
    .groupBy(knex.raw('DATE(recorded_at)'))
    .orderBy('date');
  
  return result;
}
```

## Maintenance and Optimization

### Regular Maintenance Tasks
```bash
# Analyze database for optimization
sqlite3 solchain.db "PRAGMA optimize;"

# Update table statistics
sqlite3 solchain.db "ANALYZE;"

# Vacuum database to reclaim space
sqlite3 solchain.db "VACUUM;"

# Check database integrity
sqlite3 solchain.db "PRAGMA integrity_check;"
```

### Performance Tuning
```javascript
// Enable WAL mode for better concurrency
await knex.raw('PRAGMA journal_mode = WAL');

// Increase cache size
await knex.raw('PRAGMA cache_size = 10000');

// Enable foreign key constraints
await knex.raw('PRAGMA foreign_keys = ON');

// Set synchronous mode for performance
await knex.raw('PRAGMA synchronous = NORMAL');
```

### Data Archival Strategy
```javascript
async function archiveOldData(tableName, daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  // Move old data to archive table
  await knex.raw(`
    INSERT INTO ${tableName}_archive 
    SELECT * FROM ${tableName} 
    WHERE created_at < ?
  `, [cutoffDate]);
  
  // Delete old data from main table
  const deletedCount = await knex(tableName)
    .where('created_at', '<', cutoffDate)
    .del();
  
  console.log(`Archived ${deletedCount} records from ${tableName}`);
  return deletedCount;
}
```

## Testing

### Database Testing Setup
```javascript
// test/database.test.js
const knex = require('knex');
const config = require('../knexfile');

describe('Database Tests', () => {
  let db;
  
  beforeEach(async () => {
    db = knex(config.test);
    await db.migrate.latest();
    await db.seed.run();
  });
  
  afterEach(async () => {
    await db.destroy();
  });
  
  test('should create user and related data', async () => {
    const userId = await db('users').insert({
      email: 'test@example.com',
      password_hash: 'hash',
      first_name: 'Test',
      last_name: 'User'
    });
    
    expect(userId[0]).toBeDefined();
    
    const user = await db('users').where('id', userId[0]).first();
    expect(user.email).toBe('test@example.com');
  });
});
```

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use parameterized queries to prevent SQL injection
- Implement proper access controls
- Regular security audits
- Backup encryption

### Privacy Compliance
- Implement data anonymization for analytics
- Support GDPR right to be forgotten
- Data retention policies
- Audit logging for data access

## Future Enhancements

### Planned Features
1. **Database Sharding**: Horizontal scaling for large datasets
2. **Real-time Replication**: Master-slave replication setup
3. **Advanced Analytics**: Time-series specific optimizations
4. **Encryption at Rest**: Full database encryption
5. **Multi-tenant Architecture**: Separate data by organization
6. **Graph Database Integration**: For network analysis
7. **Data Lake Integration**: Long-term analytics storage

### Migration Strategy
- Plan for PostgreSQL migration for production scale
- Implement database abstraction layer
- Gradual migration with dual-write strategy
- Performance benchmarking and optimization
