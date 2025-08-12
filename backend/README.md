# Backend - SolChain API Server

## Overview
The backend is a Node.js/Express API server that provides the core business logic, data management, and integration layer for the SolChain platform. It handles user authentication, energy data processing, trading operations, IoT device management, and blockchain integration.

## Technology Stack
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: SQLite with Knex.js ORM
- **Authentication**: JWT tokens, bcrypt
- **Real-time**: Socket.io for WebSocket connections
- **Blockchain**: Web3.js/ethers.js for smart contract interaction
- **Validation**: Joi for request validation
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## Project Structure
```
src/
├── app.js                 # Main application entry point
├── controllers/          # Request handlers and business logic
│   ├── authController.js     # User authentication
│   ├── energyController.js   # Energy data management
│   ├── iotController.js      # IoT device operations
│   ├── tradingController.js  # P2P trading logic
│   └── walletController.js   # Wallet and transaction handling
└── models/               # Database models and schemas
    ├── EnergyData.js        # Energy consumption/production data
    ├── IoTDevice.js         # IoT device information
    ├── Trading.js           # Trading orders and transactions
    ├── Transaction.js       # Financial transactions
    └── User.js              # User accounts and profiles
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- SQLite3

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Development
```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run in debug mode
npm run debug
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register a new user account
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "walletAddress": "0x742d35Cc6585C6E0B6d9F2f8c6b5b9c8d5b8a9e7"
}
```

#### POST /api/auth/login
**Purpose**: Authenticate user and return JWT token
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### GET /api/auth/profile
**Purpose**: Get current user profile
**Headers**: `Authorization: Bearer <jwt_token>`

### Energy Management Endpoints

#### GET /api/energy/consumption
**Purpose**: Get user's energy consumption data
**Query Parameters**:
- `startDate`: Start date for data range
- `endDate`: End date for data range
- `deviceId`: Filter by specific IoT device

#### POST /api/energy/production
**Purpose**: Record energy production data
**Request Body**:
```json
{
  "deviceId": "solar_panel_001",
  "energyProduced": 15.5,
  "timestamp": "2025-08-13T10:00:00Z",
  "efficiency": 0.85
}
```

#### GET /api/energy/analytics
**Purpose**: Get energy analytics and insights
**Response**: Consumption patterns, efficiency metrics, cost savings

### Trading Endpoints

#### GET /api/trading/marketplace
**Purpose**: Get available energy offers in marketplace
**Query Parameters**:
- `location`: Filter by geographical location
- `priceRange`: Filter by price range
- `energyType`: Filter by energy source type

#### POST /api/trading/order
**Purpose**: Create a new buy/sell order
**Request Body**:
```json
{
  "type": "sell",
  "energyAmount": 25.0,
  "pricePerKWh": 0.12,
  "availableFrom": "2025-08-13T14:00:00Z",
  "availableUntil": "2025-08-13T18:00:00Z",
  "location": "coordinates or area"
}
```

#### GET /api/trading/orders
**Purpose**: Get user's trading orders and history

#### POST /api/trading/match
**Purpose**: Execute a trade between buyer and seller
**Request Body**:
```json
{
  "buyOrderId": 123,
  "sellOrderId": 456,
  "energyAmount": 20.0,
  "agreedPrice": 0.11
}
```

### IoT Device Endpoints

#### GET /api/iot/devices
**Purpose**: Get user's registered IoT devices

#### POST /api/iot/register
**Purpose**: Register a new IoT device
**Request Body**:
```json
{
  "deviceType": "smart_meter",
  "deviceId": "SM_12345",
  "location": "kitchen",
  "specifications": {
    "maxCapacity": 50,
    "accuracy": 0.99
  }
}
```

#### PUT /api/iot/devices/:deviceId
**Purpose**: Update device configuration

#### DELETE /api/iot/devices/:deviceId
**Purpose**: Unregister an IoT device

#### POST /api/iot/data
**Purpose**: Receive data from IoT devices
**Request Body**:
```json
{
  "deviceId": "SM_12345",
  "dataType": "consumption",
  "value": 5.2,
  "unit": "kWh",
  "timestamp": "2025-08-13T10:00:00Z",
  "quality": "good"
}
```

### Wallet Endpoints

#### GET /api/wallet/balance
**Purpose**: Get user's SolarToken balance

#### POST /api/wallet/transfer
**Purpose**: Transfer tokens between wallets
**Request Body**:
```json
{
  "toAddress": "0x742d35Cc6585C6E0B6d9F2f8c6b5b9c8d5b8a9e7",
  "amount": 100.0,
  "reason": "energy_payment"
}
```

#### GET /api/wallet/transactions
**Purpose**: Get transaction history

#### POST /api/wallet/stake
**Purpose**: Stake tokens for rewards
**Request Body**:
```json
{
  "amount": 500.0,
  "duration": 30
}
```

## Database Models

### User Model (`models/User.js`)
**Purpose**: Store user account information and preferences
**Fields**:
- `id`: Primary key
- `email`: Unique email address
- `passwordHash`: Encrypted password
- `firstName`, `lastName`: User name
- `walletAddress`: Blockchain wallet address
- `location`: User's geographical location
- `preferences`: JSON object with user settings
- `createdAt`, `updatedAt`: Timestamps

### EnergyData Model (`models/EnergyData.js`)
**Purpose**: Store energy consumption and production data
**Fields**:
- `id`: Primary key
- `userId`: Foreign key to User
- `deviceId`: IoT device identifier
- `dataType`: 'consumption' or 'production'
- `energyAmount`: Energy in kWh
- `timestamp`: When data was recorded
- `cost`: Associated cost
- `metadata`: Additional device-specific data

### Trading Model (`models/Trading.js`)
**Purpose**: Store energy trading orders and marketplace data
**Fields**:
- `id`: Primary key
- `userId`: Foreign key to User
- `orderType`: 'buy' or 'sell'
- `energyAmount`: Amount of energy in kWh
- `pricePerKWh`: Price per kilowatt-hour
- `status`: 'active', 'matched', 'completed', 'cancelled'
- `availableFrom`, `availableUntil`: Time window
- `location`: Geographical constraints
- `createdAt`, `updatedAt`: Timestamps

### Transaction Model (`models/Transaction.js`)
**Purpose**: Store financial transactions and payments
**Fields**:
- `id`: Primary key
- `fromUserId`, `toUserId`: Transaction participants
- `amount`: Transaction amount in SolarTokens
- `transactionType`: 'energy_trade', 'staking_reward', 'transfer'
- `blockchainTxHash`: Reference to blockchain transaction
- `status`: 'pending', 'confirmed', 'failed'
- `metadata`: Additional transaction details

### IoTDevice Model (`models/IoTDevice.js`)
**Purpose**: Store IoT device registration and configuration
**Fields**:
- `id`: Primary key
- `userId`: Foreign key to User
- `deviceId`: Unique device identifier
- `deviceType`: 'smart_meter', 'solar_panel', 'battery'
- `name`: User-friendly device name
- `location`: Physical location
- `specifications`: Device capabilities and limits
- `status`: 'active', 'inactive', 'error'
- `lastSeen`: Last communication timestamp

## Controller Logic

### Auth Controller (`controllers/authController.js`)
**Responsibilities**:
- User registration with email verification
- Login with JWT token generation
- Password reset functionality
- Profile management
- Session management

**Key Functions**:
- `register()`: Create new user account
- `login()`: Authenticate and generate tokens
- `refreshToken()`: Renew JWT tokens
- `logout()`: Invalidate sessions
- `resetPassword()`: Handle password recovery

### Energy Controller (`controllers/energyController.js`)
**Responsibilities**:
- Process energy consumption/production data
- Generate analytics and insights
- Handle energy forecasting integration
- Manage energy efficiency recommendations

**Key Functions**:
- `recordConsumption()`: Store energy usage data
- `recordProduction()`: Store energy generation data
- `getAnalytics()`: Generate consumption/production insights
- `getForecast()`: Integrate with AI forecasting models
- `getEfficiencyTips()`: Provide optimization suggestions

### Trading Controller (`controllers/tradingController.js`)
**Responsibilities**:
- Manage energy marketplace operations
- Handle order matching algorithms
- Process trade executions
- Integrate with blockchain for payments

**Key Functions**:
- `createOrder()`: Create buy/sell orders
- `getMarketplace()`: Fetch available offers
- `matchOrders()`: Execute automated trading
- `executeTradeV`: Complete transactions
- `getTradeHistory()`: Retrieve user's trading history

### IoT Controller (`controllers/iotController.js`)
**Responsibilities**:
- Manage IoT device registration
- Handle real-time data ingestion
- Process device status monitoring
- Manage device configurations

**Key Functions**:
- `registerDevice()`: Add new IoT devices
- `receiveData()`: Process incoming device data
- `updateDeviceConfig()`: Modify device settings
- `getDeviceStatus()`: Monitor device health
- `handleDeviceAlerts()`: Process error conditions

### Wallet Controller (`controllers/walletController.js`)
**Responsibilities**:
- Manage SolarToken operations
- Handle blockchain transactions
- Process staking operations
- Generate transaction reports

**Key Functions**:
- `getBalance()`: Retrieve token balance
- `transfer()`: Send tokens between wallets
- `stake()`: Stake tokens for rewards
- `unstake()`: Withdraw staked tokens
- `getTransactionHistory()`: Retrieve transaction records

## Middleware and Utilities

### Authentication Middleware
```javascript
// Verify JWT tokens on protected routes
const authenticateToken = (req, res, next) => {
  // Implementation
};
```

### Validation Middleware
```javascript
// Validate request data using Joi schemas
const validateRequest = (schema) => (req, res, next) => {
  // Implementation
};
```

### Error Handling
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  // Implementation
};
```

### Rate Limiting
```javascript
// Prevent API abuse
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Environment Configuration
```bash
# .env file
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=sqlite:./database/solchain.db
BLOCKCHAIN_RPC_URL=http://localhost:8545
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- auth.test.js
```

## Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Run with PM2 (process manager)
pm2 start ecosystem.config.js
```

## Performance Optimization
- Implement database indexing
- Use caching (Redis) for frequently accessed data
- Optimize database queries
- Implement request pagination
- Use compression middleware

## Security Considerations
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting
- Secure headers (Helmet.js)
- Environment variable protection

## Monitoring and Logging
- Implement structured logging
- Monitor API performance
- Track error rates
- Database query monitoring
- Real-time alerts for critical issues

## Next Steps
1. Implement Redis caching
2. Add comprehensive API documentation with Swagger
3. Implement real-time notifications
4. Add advanced analytics endpoints
5. Implement microservices architecture
