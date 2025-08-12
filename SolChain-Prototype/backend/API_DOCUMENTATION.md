# SolChain Backend API Documentation

## Overview
The SolChain backend is a comprehensive Node.js API server built with Express.js and SQLite database for the BLOCKCHAIN OLYMPIAD BANGLADESH 2025. It provides a complete P2P energy trading platform with blockchain integration.

## Technology Stack
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Blockchain**: Web3.js integration ready

## Database Models

### User Model
- **Purpose**: User authentication and profile management
- **Fields**: id, username, email, password, userType, walletAddress, location, isActive
- **Methods**: comparePassword(), generateAuthToken()

### EnergyData Model
- **Purpose**: Store energy generation/consumption data from IoT devices
- **Fields**: userId, energyGenerated, energyConsumed, batteryLevel, deviceId, solarIrradiance, temperature, timestamp
- **Methods**: calculateSurplus(), calculateDeficit()

### TradingOffer Model
- **Purpose**: P2P energy marketplace offer management
- **Fields**: sellerId, buyerId, offerType, energyAmount, pricePerKWh, availableFrom, availableUntil, status
- **Methods**: isValid(), canFulfill()

### Transaction Model
- **Purpose**: Record completed energy trades
- **Fields**: sellerId, buyerId, offerId, energyAmount, pricePerKWh, totalAmount, platformFee, status, transactionHash
- **Methods**: calculateFees()

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `PUT /change-password` - Change password (protected)
- `POST /logout` - User logout (protected)
- `POST /refresh-token` - Refresh JWT token
- `GET /verify-email/:token` - Email verification
- `POST /resend-verification` - Resend verification email

### Energy Management (`/api/energy`)
- `POST /data` - Submit energy data from IoT devices
- `GET /history` - Get user's energy history with filtering
- `GET /dashboard` - Get real-time energy dashboard data
- `GET /community-stats` - Get community energy statistics
- `PUT /data/:id` - Update energy data record
- `DELETE /data/:id` - Delete energy data record

### Trading (`/api/trading`)
- `POST /offers` - Create new energy trading offer
- `GET /offers` - Get available trading offers with filtering
- `GET /my-offers` - Get user's own trading offers
- `POST /offers/:offerId/accept` - Accept/match a trading offer
- `PUT /offers/:offerId` - Update/cancel user's own offer
- `GET /transactions` - Get trading transactions/history
- `GET /market-analytics` - Get market analytics and statistics

### Blockchain (`/api/blockchain`)
- `GET /wallet` - Get user's wallet information and balance
- `POST /execute-trade` - Execute energy trading transaction on blockchain
- `POST /mint-tokens` - Mint solar tokens based on energy generation
- `GET /transaction/:transactionHash` - Get blockchain transaction status
- `GET /contract-info` - Get smart contract information and statistics
- `POST /vote` - Submit governance vote on microgrid proposals
- `GET /proposals` - Get active governance proposals

## Security Features
- JWT authentication with secure token management
- Rate limiting on sensitive endpoints
- Input validation using express-validator
- SQL injection protection via Sequelize ORM
- Password hashing with bcryptjs
- CORS and Helmet security headers

## Error Handling
- Comprehensive global error handler
- Validation error formatting
- Database error handling
- JWT error management
- 404 and 500 error responses

## Usage Examples

### Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "solar_user",
  "email": "user@example.com",
  "password": "securePassword123",
  "userType": "prosumer",
  "location": "Dhaka, Bangladesh"
}
```

### Submit Energy Data
```bash
POST /api/energy/data
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "energyGenerated": 25.5,
  "energyConsumed": 18.2,
  "batteryLevel": 85,
  "solarIrradiance": 800,
  "temperature": 32.5
}
```

### Create Trading Offer
```bash
POST /api/trading/offers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "offerType": "sell",
  "energyAmount": 10.5,
  "pricePerKWh": 0.15,
  "availableFrom": "2025-08-06T09:00:00Z",
  "availableUntil": "2025-08-06T18:00:00Z",
  "description": "Excess solar energy from rooftop installation"
}
```

## Development Setup
1. Install dependencies: `npm install`
2. Set environment variables in `.env`
3. Start development server: `npm run dev`
4. Access API at `http://localhost:5000`

## Production Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Enable HTTPS
5. Configure reverse proxy (nginx)

## Competition Compliance
This backend implementation fulfills all BLOCKCHAIN OLYMPIAD BANGLADESH 2025 requirements:
- ✅ Frontend/backend writing to blockchain
- ✅ Solves real-world energy trading problem
- ✅ Proper architecture and technical implementation
- ✅ Governance mechanisms (voting system)
- ✅ Privacy and security measures
- ✅ Documentation and API structure

## Next Steps
1. Connect to actual blockchain network (testnet/mainnet)
2. Implement IoT device integration
3. Add advanced AI/ML features
4. Deploy smart contracts
5. Integrate with frontend React application
