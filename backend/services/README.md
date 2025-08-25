# SolChain Backend Services

This directory contains the core business logic services for the SolChain platform. These services act as an abstraction layer between the API routes and the underlying blockchain infrastructure, providing clean, reusable, and well-documented interfaces for all platform operations.

## 📁 Directory Structure

```
services/
├── README.md                  # This documentation file
├── blockchainService.js       # Primary blockchain integration service
├── authService.js            # Authentication and authorization (future)
├── iotService.js             # IoT device integration (future)
├── notificationService.js    # User notifications (future)
└── analyticsService.js       # Data analytics and reporting (future)
```

## 🔗 Core Services

### BlockchainService (`blockchainService.js`)

The primary service for all blockchain-related operations in the SolChain ecosystem.

**Purpose**: Provides a high-level interface for interacting with SolChain smart contracts, managing user wallets, handling energy trading, and processing token operations.

**Key Features**:
- 🏦 **Wallet Management**: Create and manage user blockchain wallets
- 🪙 **Token Operations**: Transfer, mint, and query SolarToken balances
- ⚡ **Energy Trading**: P2P energy marketplace integration
- 📊 **System Monitoring**: Blockchain statistics and health monitoring
- 🔮 **Oracle Integration**: Real-time energy pricing data
- 💾 **Transaction Tracking**: Comprehensive transaction history

**Architecture**:
```
Frontend Routes → BlockchainService → SolChainAPI → Smart Contracts
```

## 🚀 Quick Start

### Initialize Blockchain Service

```javascript
const blockchainService = require('./services/blockchainService');

// Service auto-initializes on require
// Wait for initialization in async context
while (!blockchainService.isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
}
```

### Basic Operations

#### Create User Wallet
```javascript
const wallet = await blockchainService.createUserWallet('user123');
if (wallet.success) {
    console.log('Wallet Address:', wallet.data.address);
    console.log('Initial Balance:', wallet.data.balance);
}
```

#### Transfer Tokens
```javascript
const transfer = await blockchainService.transferTokens(
    'user123',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '50'
);
if (transfer.success) {
    console.log('Transaction Hash:', transfer.data.transactionHash);
}
```

#### Create Energy Sell Offer
```javascript
const offer = await blockchainService.createSellOffer('user123', {
    energyAmount: '100',
    pricePerKwh: '0.08',
    duration: 24,
    location: 'Solar-Farm-A',
    energySource: 'Solar'
});
```

#### Get Marketplace Data
```javascript
const offers = await blockchainService.getActiveOffers(0, 10);
const stats = await blockchainService.getSystemStats();
const price = await blockchainService.getCurrentEnergyPrice();
```

## 📊 API Reference

### BlockchainService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `createUserWallet(userId)` | Create new blockchain wallet | `userId: string` | `Promise<WalletResult>` |
| `getUserWallet(userId)` | Get wallet data and balances | `userId: string` | `Promise<WalletData>` |
| `getUserAddress(userId)` | Get user's blockchain address | `userId: string` | `string` |
| `transferTokens(fromUserId, toAddress, amount)` | Transfer ST tokens | `fromUserId: string, toAddress: string, amount: string` | `Promise<TransactionResult>` |
| `createSellOffer(userId, offerData)` | Create energy sell offer | `userId: string, offerData: OfferData` | `Promise<OfferResult>` |
| `createBuyOffer(userId, offerData)` | Create energy buy offer | `userId: string, offerData: OfferData` | `Promise<OfferResult>` |
| `getActiveOffers(offset, limit)` | Get marketplace offers | `offset: number, limit: number` | `Promise<OffersResult>` |
| `acceptOffer(userId, offerId, amount)` | Execute energy trade | `userId: string, offerId: string, amount: string` | `Promise<TransactionResult>` |
| `mintTokensForProduction(userId, amount)` | Mint tokens for energy production | `userId: string, amount: string` | `Promise<MintResult>` |
| `getSystemStats()` | Get blockchain statistics | None | `Promise<StatsResult>` |
| `getCurrentEnergyPrice()` | Get oracle price data | None | `Promise<PriceResult>` |

### Data Types

#### WalletResult
```typescript
interface WalletResult {
    success: boolean;
    data?: {
        address: string;
        balance: string;
        walletIndex: number;
    };
    error?: string;
}
```

#### OfferData
```typescript
interface OfferData {
    energyAmount: string;     // Amount in kWh
    pricePerKwh: string;      // Price in ST tokens
    duration?: number;        // Duration in hours (default: 24)
    location?: string;        // Grid location (default: "Grid-Zone-A")
    energySource?: string;    // Energy source (default: "Solar")
}
```

#### TransactionResult
```typescript
interface TransactionResult {
    success: boolean;
    data?: {
        transactionHash: string;
        blockNumber: string;
        gasUsed: string;
        nonce?: number;
    };
    error?: string;
}
```

## 🔧 Configuration

### Environment Variables

The blockchain service uses these environment variables (defined in `.env`):

```bash
# Blockchain Configuration
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=1337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Contract Addresses (auto-populated during deployment)
SOLAR_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ENERGY_TRADING_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
ORACLE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

# Gas Configuration
DEFAULT_GAS_LIMIT=3000000
DEFAULT_GAS_PRICE=20000000000
```

### Initialization Dependencies

1. **Blockchain Node**: Hardhat local node must be running
2. **Smart Contracts**: All SolChain contracts must be deployed
3. **Configuration**: Contract addresses must be available

## 🧪 Testing

### Integration Tests

Run the comprehensive integration test suite:

```bash
cd backend
npm test
```

This executes `test-blockchain-integration.js` which tests:
- ✅ Service initialization
- ✅ Wallet creation and management
- ✅ Token operations (mint, transfer, balance)
- ✅ Energy marketplace (create/retrieve offers)
- ✅ System statistics and oracle data

### Manual Testing

```javascript
// Test wallet creation
const wallet = await blockchainService.createUserWallet('test123');
console.log('Wallet created:', wallet);

// Test token minting
const mint = await blockchainService.mintTokensForProduction('test123', '100');
console.log('Tokens minted:', mint);

// Test offer creation
const offer = await blockchainService.createSellOffer('test123', {
    energyAmount: '50',
    pricePerKwh: '0.08'
});
console.log('Offer created:', offer);
```

## 🔒 Security Considerations

### Private Key Management
- 🚨 **Development**: Uses hardhat accounts for testing
- 🏭 **Production**: Implement secure key management (HSM, AWS KMS)
- 🔐 **Access Control**: Limit minting permissions to authorized accounts

### Smart Contract Security
- ✅ **Role-based Access**: MINTER_ROLE, PAUSER_ROLE controls
- ✅ **Reentrancy Protection**: NonReentrant modifiers
- ✅ **Input Validation**: Comprehensive parameter checking

### API Security
- 🛡️ **Input Sanitization**: Validate all user inputs
- 📊 **Rate Limiting**: Prevent blockchain spam
- 🔍 **Transaction Monitoring**: Log all blockchain operations

## 🚀 Deployment

### Local Development
```bash
# Start blockchain node
npm run blockchain:start

# Deploy contracts
npm run blockchain:deploy

# Start backend
npm run dev
```

### Production Deployment
1. **Configure Network**: Update RPC_URL for mainnet/testnet
2. **Deploy Contracts**: Run deployment scripts on target network
3. **Update Addresses**: Set contract addresses in environment
4. **Start Services**: Launch backend with production configuration

## 📈 Performance Optimization

### Caching Strategies
- **User Address Mapping**: Cache userId → address relationships
- **Contract ABIs**: Load once during initialization
- **Transaction Nonces**: Track to prevent conflicts

### Gas Optimization
- **Batch Operations**: Group multiple transactions
- **Gas Price Monitoring**: Adjust based on network conditions
- **Transaction Queuing**: Manage transaction ordering

## 🔮 Future Enhancements

### Planned Services

#### AuthService
- JWT token management
- Role-based permissions
- Session handling

#### IoTService
- Device registration and management
- Real-time energy data ingestion
- Device verification and certification

#### NotificationService
- Real-time transaction notifications
- Email/SMS alerts
- Push notifications for mobile app

#### AnalyticsService
- Energy trading analytics
- User behavior insights
- Platform performance metrics

### Roadmap Features
- 🌐 **Multi-chain Support**: Ethereum, Polygon, BSC
- 🔄 **Cross-chain Bridges**: Asset transfers between networks
- 📱 **Mobile SDK**: React Native integration
- 🤖 **AI-powered Pricing**: Smart contract-based dynamic pricing

## 🤝 Contributing

### Development Guidelines
1. **Documentation**: All methods must have JSDoc comments
2. **Error Handling**: Use consistent error response format
3. **Testing**: Add tests for new functionality
4. **Logging**: Include comprehensive logging for debugging

### Code Style
- Use async/await for asynchronous operations
- Return standardized `{success, data, error}` objects
- Include transaction hashes in successful responses
- Log important operations for monitoring

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add comprehensive tests
4. Update documentation
5. Submit pull request with detailed description

## 📞 Support

For questions or issues with the backend services:

- 📧 **Email**: dev@solchain.com
- 💬 **Discord**: SolChain Development Server
- 📖 **Documentation**: [Full API Docs](../docs/api-reference.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/gagradebnath/SolChain/issues)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

**Built with ❤️ by the SolChain Team**

*Revolutionizing energy trading through blockchain technology*
