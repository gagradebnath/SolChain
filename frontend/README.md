# Frontend - SolChain User Interface

## Overview
The frontend is a React Native/Web application that provides the user interface for the SolChain platform. Users can monitor their energy consumption, participate in P2P energy trading, manage their wallets, and interact with IoT devices through this interface.

## Technology Stack
- **Framework**: React Native (cross-platform mobile & web)
- **State Management**: Redux/Context API
- **Styling**: Styled Components / React Native StyleSheet
- **Navigation**: React Navigation
- **Charts**: React Native Chart Kit
- **Blockchain Integration**: Web3.js/ethers.js

## Project Structure
```
src/
├── App.js                 # Main application entry point
├── components/           # Reusable UI components
│   ├── Auth.js          # Authentication components
│   ├── EnergyDashboard.js # Energy monitoring dashboard
│   ├── IoTDevices.js    # IoT device management
│   ├── P2PTrading.js    # Peer-to-peer trading interface
│   └── Wallet.js        # Wallet management components
├── screens/             # Main application screens
│   ├── EnergyScreen.js  # Energy consumption/production screen
│   ├── HomeScreen.js    # Dashboard home screen
│   ├── ProfileScreen.js # User profile management
│   ├── TradingScreen.js # Energy trading marketplace
│   └── WalletScreen.js  # Wallet and transaction screen
└── services/            # API and service integrations
    ├── apiService.js    # Backend API communication
    ├── blockchainService.js # Blockchain interactions
    └── storageService.js    # Local storage management
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- React Native CLI (for mobile development)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Development
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

## Key Features

### 1. Authentication (`components/Auth.js`)
- User registration and login
- Wallet connection
- Biometric authentication support
- Multi-factor authentication

### 2. Energy Dashboard (`components/EnergyDashboard.js`)
- Real-time energy consumption monitoring
- Solar panel production tracking
- Energy balance visualization
- Historical data charts

### 3. P2P Trading (`components/P2PTrading.js`)
- Browse available energy offers
- Create energy sell/buy orders
- View trading history
- Real-time price tracking

### 4. IoT Device Management (`components/IoTDevices.js`)
- Connect and manage smart meters
- Solar panel monitoring
- Device status and alerts
- Remote device control

### 5. Wallet Integration (`components/Wallet.js`)
- SolarToken balance display
- Transaction history
- Send/receive tokens
- Staking interface

## Screen Descriptions

### Home Screen (`screens/HomeScreen.js`)
**Purpose**: Main dashboard providing overview of user's energy ecosystem
**Features**:
- Energy production/consumption summary
- Active trading orders
- Wallet balance
- Recent notifications
- Quick action buttons

### Energy Screen (`screens/EnergyScreen.js`)
**Purpose**: Detailed energy monitoring and analytics
**Features**:
- Real-time energy metrics
- Historical consumption patterns
- Solar panel performance
- Energy efficiency recommendations
- Carbon footprint tracking

### Trading Screen (`screens/TradingScreen.js`)
**Purpose**: P2P energy marketplace interface
**Features**:
- Browse energy offers
- Create buy/sell orders
- Price analytics
- Trading history
- Market trends

### Wallet Screen (`screens/WalletScreen.js`)
**Purpose**: Financial management and transactions
**Features**:
- SolarToken balance and transactions
- Staking rewards
- Payment methods
- Transaction history
- Security settings

### Profile Screen (`screens/ProfileScreen.js`)
**Purpose**: User account and system settings
**Features**:
- Personal information management
- Device connections
- Notification preferences
- Security settings
- Help and support

## Services Integration

### API Service (`services/apiService.js`)
**Purpose**: Handle all backend API communications
**Responsibilities**:
- User authentication
- Energy data retrieval
- Trading operations
- IoT device management
- Real-time updates via WebSockets

### Blockchain Service (`services/blockchainService.js`)
**Purpose**: Interact with smart contracts and blockchain
**Responsibilities**:
- Wallet connection
- Smart contract interactions
- Transaction signing
- Token operations
- Event listening

### Storage Service (`services/storageService.js`)
**Purpose**: Local data storage and caching
**Responsibilities**:
- User preferences
- Offline data caching
- Secure credential storage
- App state persistence

## Development Guidelines

### Code Structure
- Use functional components with hooks
- Implement proper error boundaries
- Follow React Native best practices
- Maintain consistent styling

### State Management
- Use Redux for global state
- Local state for component-specific data
- Implement proper data flow
- Cache frequently accessed data

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# E2E testing
npm run test:e2e
```

### Build and Deployment
```bash
# Build for production
npm run build

# Android APK
npm run build:android

# iOS IPA
npm run build:ios
```

## Environment Configuration
Create `.env` files for different environments:

```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_BLOCKCHAIN_RPC=http://localhost:8545
REACT_APP_ENVIRONMENT=development

# .env.production
REACT_APP_API_URL=https://api.solchain.com
REACT_APP_BLOCKCHAIN_RPC=https://mainnet.infura.io
REACT_APP_ENVIRONMENT=production
```

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Build failures**: Clean build with `npm run clean`
3. **iOS build issues**: Clean Xcode build folder
4. **Android build issues**: Clean gradle cache

### Performance Optimization
- Implement lazy loading for screens
- Use FlatList for large datasets
- Optimize image loading
- Implement proper caching strategies

## Contributing
1. Follow the established folder structure
2. Write tests for new components
3. Update documentation for new features
4. Follow the coding standards
5. Test on multiple devices before submitting

## Next Steps
1. Implement push notifications
2. Add offline functionality
3. Enhance UI/UX design
4. Add more chart types
5. Implement advanced trading features
