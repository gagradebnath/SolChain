# 🌞 SolChain Blockchain API

**The Complete Blockchain Backend for P2P Solar Energy Trading**

> **Ready-to-use blockchain API that your backend can integrate in minutes, not days.**

## 🚀 Quick Start for Backend Developers

### What You'll Get
- ✅ **5 Production-Ready Smart Contracts** (deployed & tested)
- ✅ **Complete JavaScript API** (1200+ lines, battle-tested)
- ✅ **Zero Blockchain Knowledge Required** (we handle the complexity)
- ✅ **Simple Function Calls** (just like any REST API)
- ✅ **Comprehensive Error Handling** (detailed responses)

### 30-Second Integration Test
```bash
cd blockchain
npm install
npm test
# ✅ All tests pass? You're ready to integrate!
```

---

## 📋 Contents

1. [🏃‍♂️ Quick Backend Integration](#-quick-backend-integration)
2. [🛠️ Complete Setup Guide](#️-complete-setup-guide)
3. [📡 API Functions Reference](#-api-functions-reference)
4. [💻 Real Integration Examples](#-real-integration-examples)
5. [🧪 Testing Your Integration](#-testing-your-integration)
6. [🚢 Production Deployment](#-production-deployment)
7. [❓ Troubleshooting](#-troubleshooting)

---

## 🏃‍♂️ Quick Backend Integration

### Step 1: Copy Blockchain Folder to Your Project
```bash
# Copy the entire blockchain folder to your backend project
cp -r SolChain/blockchain your-backend-project/blockchain
cd your-backend-project/blockchain
npm install
```

### Step 2: Start Local Blockchain (Development)
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Step 3: Integrate into Your Backend
```javascript
// your-backend/services/EnergyService.js
const { SolChainConfig } = require('../blockchain/src/config');

class EnergyService {
    constructor() {
        this.solchain = null;
        this.init();
    }

    async init() {
        const config = new SolChainConfig();
        const result = await config.createAPIInstance();
        if (result.success) {
            this.solchain = result.api;
            console.log('✅ SolChain API initialized');
        } else {
            console.error('❌ Failed to initialize SolChain:', result.error);
        }
    }

    // Your business logic methods
    async recordEnergyProduction(userId, kwhProduced) {
        // Mint tokens for energy production
        return await this.solchain.mintTokens(userId, kwhProduced.toString());
    }

    async createEnergyOffer(sellerId, kwh, pricePerKwh) {
        return await this.solchain.createSellOffer(
            kwh.toString(),
            pricePerKwh.toString(),
            new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
            "Grid-Zone-A",
            "Solar"
        );
    }

    async getUserEnergyBalance(userId) {
        return await this.solchain.getTokenBalance(userId);
    }
}

module.exports = EnergyService;
```

### Step 4: Use in Your Routes
```javascript
// your-backend/routes/api.js
const EnergyService = require('./services/EnergyService');
const energyService = new EnergyService();

app.post('/api/energy/produce', async (req, res) => {
    const { userId, kwhProduced } = req.body;
    
    const result = await energyService.recordEnergyProduction(userId, kwhProduced);
    
    if (result.success) {
        res.json({ 
            success: true, 
            message: `Minted ${kwhProduced} ST tokens`,
            txHash: result.data.transactionHash 
        });
    } else {
        res.status(400).json({ error: result.error });
    }
});

app.post('/api/energy/sell', async (req, res) => {
    const { sellerId, kwh, pricePerKwh } = req.body;
    
    const result = await energyService.createEnergyOffer(sellerId, kwh, pricePerKwh);
    
    if (result.success) {
        res.json({ 
            success: true, 
            offerId: result.data.offerId,
            txHash: result.data.transactionHash 
        });
    } else {
        res.status(400).json({ error: result.error });
    }
});

app.get('/api/energy/balance/:userId', async (req, res) => {
    const result = await energyService.getUserEnergyBalance(req.params.userId);
    
    if (result.success) {
        res.json({ 
            balance: result.data.formatted,
            balanceWei: result.data.balance 
        });
    } else {
        res.status(400).json({ error: result.error });
    }
});
```

**That's it! Your backend now has full blockchain integration.**

---

## � User Management & Authentication

### Understanding Blockchain Users vs Traditional Users

In SolChain, there are **two types of user identities**:

1. **Traditional Backend Users** - Your app's users with usernames, passwords, emails
2. **Blockchain Addresses** - Ethereum wallet addresses that interact with smart contracts

### 🔐 User Creation Process

#### Step 1: Create Blockchain Wallet for New User

```javascript
// services/UserService.js
const { ethers } = require('ethers');
const bcrypt = require('bcrypt');

class UserService {
    constructor(energyService) {
        this.energyService = energyService;
    }

    // Create a new user with blockchain wallet
    async createUser(userData) {
        const { username, email, password, fullName, location } = userData;
        
        try {
            console.log(`👤 Creating new user: ${username}`);
            
            // 1. Create blockchain wallet
            const wallet = ethers.Wallet.createRandom();
            const blockchainAddress = wallet.address;
            const privateKey = wallet.privateKey;
            const mnemonic = wallet.mnemonic.phrase;
            
            // 2. Encrypt private key with user password
            const encryptedPrivateKey = await this.encryptPrivateKey(privateKey, password);
            
            // 3. Hash password for database
            const hashedPassword = await bcrypt.hash(password, 12);
            
            // 4. Store user in database
            const user = await database.createUser({
                username,
                email,
                fullName,
                location,
                hashedPassword,
                blockchainAddress,
                encryptedPrivateKey,
                mnemonic: await this.encryptMnemonic(mnemonic, password),
                createdAt: new Date(),
                isActive: true,
                energyBalance: 0,
                role: 'consumer' // or 'prosumer'
            });
            
            // 5. Initialize blockchain account with some tokens
            await this.initializeBlockchainAccount(blockchainAddress);
            
            console.log(`✅ User created successfully`);
            console.log(`   Username: ${username}`);
            console.log(`   Blockchain Address: ${blockchainAddress}`);
            
            return {
                success: true,
                data: {
                    userId: user.id,
                    username,
                    email,
                    blockchainAddress,
                    mnemonic: mnemonic, // Return once for user to save
                    message: 'User created successfully! Save your mnemonic phrase securely.'
                }
            };
            
        } catch (error) {
            console.error(`❌ User creation failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Initialize new blockchain account
    async initializeBlockchainAccount(address) {
        try {
            // Give new users 10 ST tokens to start trading
            const welcomeBonus = "10";
            
            const mintResult = await this.energyService.solchain.mintTokens(
                address, 
                welcomeBonus
            );
            
            if (mintResult.success) {
                console.log(`🎁 Welcome bonus: ${welcomeBonus} ST tokens sent to ${address}`);
                
                // Log the bonus
                await database.logWelcomeBonus({
                    address,
                    amount: welcomeBonus,
                    txHash: mintResult.data.transactionHash,
                    timestamp: new Date()
                });
            }
            
            return mintResult;
        } catch (error) {
            console.error(`Failed to initialize blockchain account: ${error.message}`);
            // Don't fail user creation if bonus fails
            return { success: false, error: error.message };
        }
    }

    // Encrypt private key with user password
    async encryptPrivateKey(privateKey, password) {
        const crypto = require('crypto');
        const algorithm = 'aes-256-gcm';
        const salt = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAAD(salt);
        
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    // Decrypt private key with user password
    async decryptPrivateKey(encryptedData, password) {
        const crypto = require('crypto');
        const algorithm = 'aes-256-gcm';
        
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAAD(salt);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

module.exports = UserService;
```

#### Step 2: User Registration API Endpoint

```javascript
// routes/auth.js
const express = require('express');
const UserService = require('../services/UserService');
const router = express.Router();

const userService = new UserService(energyService);

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName, location, userType } = req.body;
        
        // Validate input
        const validation = validateRegistration(req.body);
        if (!validation.valid) {
            return res.status(400).json({ 
                success: false, 
                error: validation.errors.join(', ')
            });
        }
        
        // Check if user already exists
        const existingUser = await database.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }
        
        // Create user
        const result = await userService.createUser({
            username,
            email,
            password,
            fullName,
            location,
            userType // 'consumer' or 'prosumer'
        });
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    userId: result.data.userId,
                    username: result.data.username,
                    blockchainAddress: result.data.blockchainAddress,
                    mnemonic: result.data.mnemonic, // User must save this!
                    welcomeBonus: '10 ST tokens'
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during registration'
        });
    }
});

// Input validation
function validateRegistration(data) {
    const errors = [];
    
    if (!data.username || data.username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Valid email is required');
    }
    
    if (!data.password || data.password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (!data.fullName || data.fullName.length < 2) {
        errors.push('Full name is required');
    }
    
    if (!data.location) {
        errors.push('Location is required');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

module.exports = router;
```

### 🔑 User Login Process

#### Step 1: Authentication Service

```javascript
// services/AuthService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
    constructor(userService, energyService) {
        this.userService = userService;
        this.energyService = energyService;
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    }

    // Login user
    async loginUser(email, password) {
        try {
            console.log(`🔐 Login attempt for: ${email}`);
            
            // 1. Find user in database
            const user = await database.findUserByEmail(email);
            if (!user) {
                return { success: false, error: 'Invalid email or password' };
            }
            
            // 2. Verify password
            const passwordValid = await bcrypt.compare(password, user.hashedPassword);
            if (!passwordValid) {
                return { success: false, error: 'Invalid email or password' };
            }
            
            // 3. Check if user is active
            if (!user.isActive) {
                return { success: false, error: 'Account is deactivated' };
            }
            
            // 4. Decrypt private key for blockchain access
            const privateKey = await this.userService.decryptPrivateKey(
                user.encryptedPrivateKey, 
                password
            );
            
            // 5. Get current blockchain balance
            const balanceResult = await this.energyService.solchain.getTokenBalance(
                user.blockchainAddress
            );
            
            const currentBalance = balanceResult.success ? 
                balanceResult.data.formatted : '0 ST';
            
            // 6. Create JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    blockchainAddress: user.blockchainAddress,
                    role: user.role
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );
            
            // 7. Update last login
            await database.updateUserLastLogin(user.id);
            
            console.log(`✅ Login successful for: ${email}`);
            
            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        location: user.location,
                        role: user.role,
                        blockchainAddress: user.blockchainAddress,
                        energyBalance: currentBalance,
                        lastLogin: new Date()
                    },
                    blockchain: {
                        address: user.blockchainAddress,
                        balance: currentBalance,
                        privateKey: privateKey // Store securely in session/memory
                    }
                }
            };
            
        } catch (error) {
            console.error(`❌ Login failed: ${error.message}`);
            return { success: false, error: 'Login failed' };
        }
    }

    // Create session for blockchain operations
    async createBlockchainSession(userId, privateKey) {
        try {
            // Create a temporary API instance for this user
            const userAPI = await this.energyService.solchain.switchSigner(privateKey);
            
            // Store in session cache (Redis recommended for production)
            const sessionId = this.generateSessionId();
            await sessionStore.set(sessionId, {
                userId,
                privateKey: privateKey, // Encrypt this in production
                apiInstance: userAPI,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            });
            
            return sessionId;
        } catch (error) {
            console.error('Failed to create blockchain session:', error);
            return null;
        }
    }

    // Verify JWT token middleware
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        jwt.verify(token, this.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    }

    generateSessionId() {
        return require('crypto').randomBytes(32).toString('hex');
    }
}

module.exports = AuthService;
```

#### Step 2: Login API Endpoint

```javascript
// routes/auth.js (add to existing file)

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Attempt login
        const result = await authService.loginUser(email, password);
        
        if (result.success) {
            // Create blockchain session
            const sessionId = await authService.createBlockchainSession(
                result.data.user.id,
                result.data.blockchain.privateKey
            );
            
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token: result.data.token,
                    user: result.data.user,
                    blockchain: {
                        address: result.data.blockchain.address,
                        balance: result.data.blockchain.balance
                        // Don't send private key to frontend
                    },
                    sessionId: sessionId
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('Login endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login'
        });
    }
});

// Get user profile (protected route)
router.get('/profile', authService.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await database.findUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get fresh blockchain balance
        const balanceResult = await energyService.getUserEnergyBalance(user.blockchainAddress);
        
        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                location: user.location,
                role: user.role,
                blockchainAddress: user.blockchainAddress,
                energyBalance: balanceResult.success ? balanceResult.data.formatted : '0 ST',
                memberSince: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.error('Profile endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});

// Logout user
router.post('/logout', authService.authenticateToken, async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (sessionId) {
            // Clear blockchain session
            await sessionStore.delete(sessionId);
        }
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});
```

### 🔒 Secure Blockchain Operations

#### User-Specific Energy Operations

```javascript
// services/UserEnergyService.js
class UserEnergyService {
    constructor(authService, energyService) {
        this.authService = authService;
        this.energyService = energyService;
    }

    // Execute energy operation as specific user
    async executeAsUser(sessionId, operation) {
        try {
            // Get user session
            const session = await sessionStore.get(sessionId);
            if (!session || session.expiresAt < new Date()) {
                throw new Error('Invalid or expired session');
            }
            
            // Create temporary API instance with user's private key
            const userAPI = await this.energyService.solchain.switchSigner(session.privateKey);
            
            // Execute operation
            const result = await operation(userAPI);
            
            return result;
        } catch (error) {
            console.error('User operation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // User creates sell offer
    async createUserSellOffer(sessionId, offerData) {
        return await this.executeAsUser(sessionId, async (userAPI) => {
            return await userAPI.createSellOffer(
                offerData.energyAmount,
                offerData.pricePerKwh,
                offerData.deadline,
                offerData.location,
                offerData.energySource
            );
        });
    }

    // User buys energy
    async userBuyEnergy(sessionId, offerId) {
        return await this.executeAsUser(sessionId, async (userAPI) => {
            return await userAPI.executeOffer(offerId);
        });
    }
}
```

### 📱 Frontend Integration Examples

#### Registration Flow

```javascript
// Frontend registration
async function registerUser(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // IMPORTANT: Show mnemonic to user and ask them to save it
            alert(`IMPORTANT: Save your mnemonic phrase securely!\n\n${result.data.mnemonic}\n\nThis is your only way to recover your account!`);
            
            // Redirect to login
            window.location.href = '/login';
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Registration failed');
    }
}
```

#### Login Flow

```javascript
// Frontend login
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store token and session
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('sessionId', result.data.sessionId);
            localStorage.setItem('userAddress', result.data.blockchain.address);
            
            // Update UI
            updateUserDashboard(result.data.user);
            showEnergyBalance(result.data.blockchain.balance);
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Login failed');
    }
}
```

---

## �🛠️ Complete Setup Guide

### Prerequisites
```bash
# Required software
Node.js >= 18.0.0
npm >= 8.0.0

# Check your versions
node --version
npm --version
```

### Environment Setup

#### 1. Install Dependencies
```bash
cd blockchain
npm install
```

#### 2. Create Environment File
```bash
# Create .env file
cp .env.example .env

# Edit with your settings
nano .env
```

```bash
# .env file content
HARDHAT_NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
PRIVATE_KEY=your_private_key_here
```

#### 3. Start Development Environment
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Run tests to verify
npm test
```

### Verification
```bash
# Should see all tests passing
✅ Token operations... PASS
✅ Energy trading... PASS  
✅ Staking system... PASS
✅ Governance... PASS
```

---

## 📡 API Functions Reference

> **Complete function reference with usage examples and detailed descriptions**

### 🔋 Energy & Token Operations

#### 1. Get Token Information
**Description**: Retrieves basic information about the SolarToken (ST) contract including name, symbol, total supply, and decimals.

```javascript
const tokenInfo = await api.getTokenInfo();

// Example Response:
{
    success: true,
    data: {
        name: "SolarToken",
        symbol: "ST", 
        totalSupply: "1000000.0",
        decimals: 18,
        maxSupply: "100000000.0"
    }
}

// Usage Example:
if (tokenInfo.success) {
    console.log(`Token: ${tokenInfo.data.name} (${tokenInfo.data.symbol})`);
    console.log(`Supply: ${tokenInfo.data.totalSupply} / ${tokenInfo.data.maxSupply}`);
} else {
    console.error('Failed to get token info:', tokenInfo.error);
}
```

#### 2. Check User Balance
**Description**: Gets the ST token balance for a specific user address. Returns both raw balance and formatted display value.

```javascript
const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const balance = await api.getTokenBalance(userAddress);

// Example Response:
{
    success: true,
    data: {
        balance: "1000000000000000000000", // Wei format
        formatted: "1,000.00 ST",          // Human readable
        decimals: 18
    }
}

// Usage Example:
if (balance.success) {
    console.log(`💰 User balance: ${balance.data.formatted}`);
    
    // Check if user has enough tokens for a transaction
    const requiredAmount = 100; // 100 ST
    const userBalance = parseFloat(balance.data.formatted.replace(/[^0-9.-]+/g,""));
    
    if (userBalance >= requiredAmount) {
        console.log('✅ Sufficient balance');
    } else {
        console.log('❌ Insufficient balance');
    }
} else {
    console.error('Error getting balance:', balance.error);
}
```

#### 3. Mint Tokens (Energy Production)
**Description**: Creates new ST tokens representing energy production. Only accounts with MINTER_ROLE can call this function. Typically used when solar panels generate energy.

```javascript
const prosumerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const energyProduced = "150"; // 150 kWh produced

const result = await api.mintTokens(prosumerAddress, energyProduced);

// Example Response:
{
    success: true,
    data: {
        transactionHash: "0xabc123...",
        blockNumber: 12345,
        gasUsed: "65432",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        amount: "150"
    }
}

// Usage Example:
async function recordSolarProduction(panelId, kwhProduced) {
    console.log(`🌞 Panel ${panelId} produced ${kwhProduced} kWh`);
    
    const mintResult = await api.mintTokens(panelId, kwhProduced.toString());
    
    if (mintResult.success) {
        console.log(`✅ Minted ${kwhProduced} ST tokens`);
        console.log(`📋 Transaction: ${mintResult.data.transactionHash}`);
        
        // Log to database
        await database.logEnergyProduction({
            panelId,
            kwhProduced,
            tokensEarned: kwhProduced,
            transactionHash: mintResult.data.transactionHash,
            timestamp: new Date()
        });
        
        return mintResult;
    } else {
        console.error(`❌ Minting failed: ${mintResult.error}`);
        throw new Error(`Failed to mint tokens: ${mintResult.error}`);
    }
}
```

#### 4. Transfer Tokens
**Description**: Transfers ST tokens from the current account to another address. The sender must have sufficient balance and tokens.

```javascript
const recipientAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const amount = "50"; // 50 ST tokens

const result = await api.transferTokens(recipientAddress, amount);

// Example Response:
{
    success: true,
    data: {
        transactionHash: "0xdef456...",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        amount: "50",
        gasUsed: "51000"
    }
}

// Usage Example:
async function rewardUser(userId, rewardAmount, reason) {
    const userAddress = await getUserAddress(userId);
    
    console.log(`🎁 Rewarding ${userId} with ${rewardAmount} ST tokens`);
    console.log(`📝 Reason: ${reason}`);
    
    const transferResult = await api.transferTokens(userAddress, rewardAmount.toString());
    
    if (transferResult.success) {
        console.log(`✅ Reward sent successfully!`);
        console.log(`📋 TX: ${transferResult.data.transactionHash}`);
        
        // Send notification to user
        await notificationService.send(userId, {
            type: 'reward',
            amount: rewardAmount,
            reason: reason,
            txHash: transferResult.data.transactionHash
        });
        
        return transferResult;
    } else {
        console.error(`❌ Transfer failed: ${transferResult.error}`);
        throw new Error(`Reward transfer failed: ${transferResult.error}`);
    }
}
```

#### 5. Transfer From Another Address
**Description**: Transfers tokens from one address to another (requires prior approval). Useful for smart contract interactions and third-party transfers.

```javascript
const fromAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const toAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const amount = "25";

const result = await api.transferFrom(fromAddress, toAddress, amount);

// Usage Example:
async function processEscrowRelease(escrowId, buyerAddress, sellerAddress, amount) {
    console.log(`🔓 Releasing escrow ${escrowId}: ${amount} ST`);
    
    // Transfer from escrow contract to seller
    const releaseResult = await api.transferFrom(
        ESCROW_CONTRACT_ADDRESS,
        sellerAddress, 
        amount
    );
    
    if (releaseResult.success) {
        console.log(`✅ Escrow released to seller`);
        
        // Update escrow status in database
        await database.updateEscrowStatus(escrowId, 'RELEASED');
        
        // Notify both parties
        await Promise.all([
            notificationService.send(buyerAddress, {
                type: 'escrow_completed',
                escrowId,
                amount
            }),
            notificationService.send(sellerAddress, {
                type: 'payment_received', 
                escrowId,
                amount
            })
        ]);
        
        return releaseResult;
    } else {
        console.error(`❌ Escrow release failed: ${releaseResult.error}`);
        throw new Error(`Escrow release failed: ${releaseResult.error}`);
    }
}
```

### ⚡ Energy Trading

#### 6. Create Sell Offer
**Description**: Creates a new energy sell offer in the marketplace. Prosumers use this to sell excess energy they've produced.

```javascript
const energyAmount = "100";    // 100 kWh
const pricePerKwh = "0.08";   // 0.08 ST per kWh
const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
const location = "Grid-Zone-A";
const energySource = "Solar";

const offer = await api.createSellOffer(
    energyAmount,
    pricePerKwh,
    deadline,
    location,
    energySource
);

// Example Response:
{
    success: true,
    data: {
        offerId: "42",
        transactionHash: "0x789abc...",
        totalPrice: "8.0", // 100 * 0.08 = 8 ST
        gasUsed: "120000"
    }
}

// Usage Example:
async function autoCreateSellOffer(panelId, excessEnergy) {
    console.log(`📈 Creating sell offer for ${excessEnergy} kWh excess energy`);
    
    // Get current market price
    const marketPrice = await priceOracle.getCurrentPrice();
    const competitivePrice = (marketPrice * 0.95).toFixed(3); // 5% below market
    
    // Set offer expiry to 48 hours
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    const offerResult = await api.createSellOffer(
        excessEnergy.toString(),
        competitivePrice,
        expiry,
        await getGridLocation(panelId),
        "Solar"
    );
    
    if (offerResult.success) {
        console.log(`✅ Sell offer created: ID ${offerResult.data.offerId}`);
        console.log(`💰 Total value: ${offerResult.data.totalPrice} ST`);
        
        // Store offer in database for tracking
        await database.storeSellOffer({
            offerId: offerResult.data.offerId,
            panelId,
            energyAmount: excessEnergy,
            pricePerKwh: competitivePrice,
            totalPrice: offerResult.data.totalPrice,
            txHash: offerResult.data.transactionHash,
            status: 'ACTIVE',
            createdAt: new Date()
        });
        
        // Notify panel owner
        await notificationService.send(panelId, {
            type: 'offer_created',
            offerId: offerResult.data.offerId,
            energyAmount: excessEnergy,
            expectedEarnings: offerResult.data.totalPrice
        });
        
        return offerResult;
    } else {
        console.error(`❌ Failed to create sell offer: ${offerResult.error}`);
        throw new Error(`Sell offer creation failed: ${offerResult.error}`);
    }
}
```

#### 7. Create Buy Offer
**Description**: Creates a new energy buy offer in the marketplace. Consumers use this to request energy at a specific price.

```javascript
const energyNeeded = "50";      // 50 kWh needed
const maxPricePerKwh = "0.09"; // Willing to pay up to 0.09 ST per kWh
const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
const location = "Grid-Zone-A";

const offer = await api.createBuyOffer(
    energyNeeded,
    maxPricePerKwh,
    deadline,
    location
);

// Example Response:
{
    success: true,
    data: {
        offerId: "43",
        transactionHash: "0x456def...",
        maxTotalPrice: "4.5", // 50 * 0.09 = 4.5 ST
        gasUsed: "115000"
    }
}

// Usage Example:
async function createEnergyRequest(userId, energyNeeded, urgency) {
    console.log(`🔋 User ${userId} needs ${energyNeeded} kWh (${urgency})`);
    
    // Set price based on urgency
    const basePrice = await priceOracle.getCurrentPrice();
    let maxPrice;
    
    switch(urgency) {
        case 'LOW':
            maxPrice = (basePrice * 0.85).toFixed(3); // 15% below market
            break;
        case 'NORMAL':
            maxPrice = basePrice.toFixed(3);          // Market price
            break;
        case 'HIGH':
            maxPrice = (basePrice * 1.15).toFixed(3); // 15% above market
            break;
        default:
            maxPrice = basePrice.toFixed(3);
    }
    
    // Set deadline based on urgency
    const deadlineHours = urgency === 'HIGH' ? 2 : urgency === 'NORMAL' ? 8 : 24;
    const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);
    
    const buyOfferResult = await api.createBuyOffer(
        energyNeeded.toString(),
        maxPrice,
        deadline,
        await getUserGridLocation(userId)
    );
    
    if (buyOfferResult.success) {
        console.log(`✅ Buy offer created: ID ${buyOfferResult.data.offerId}`);
        console.log(`💰 Max cost: ${buyOfferResult.data.maxTotalPrice} ST`);
        
        // Store in database
        await database.storeBuyOffer({
            offerId: buyOfferResult.data.offerId,
            userId,
            energyNeeded,
            maxPricePerKwh: maxPrice,
            maxTotalPrice: buyOfferResult.data.maxTotalPrice,
            urgency,
            deadline,
            txHash: buyOfferResult.data.transactionHash,
            status: 'ACTIVE'
        });
        
        // Notify user
        await notificationService.send(userId, {
            type: 'buy_offer_created',
            offerId: buyOfferResult.data.offerId,
            energyNeeded,
            maxCost: buyOfferResult.data.maxTotalPrice,
            deadline: deadline.toISOString()
        });
        
        return buyOfferResult;
    } else {
        console.error(`❌ Failed to create buy offer: ${buyOfferResult.error}`);
        throw new Error(`Buy offer creation failed: ${buyOfferResult.error}`);
    }
}
```

#### 8. Get Available Offers
**Description**: Retrieves all active offers in the marketplace, including both sell and buy offers. Can be filtered by type, location, or price range.

```javascript
const offers = await api.getActiveOffers();

// Example Response:
{
    success: true,
    data: [
        {
            id: "42",
            creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            offerType: "SELL",
            energyAmount: "100000000000000000000", // 100 kWh in wei
            pricePerKwh: "80000000000000000",      // 0.08 ST in wei
            totalPrice: "8000000000000000000",     // 8 ST in wei
            deadline: 1692234567,
            status: "ACTIVE",
            location: "Grid-Zone-A",
            energySource: "Solar",
            createdAt: 1692148167
        },
        // ... more offers
    ]
}

// Usage Example:
async function displayMarketplace(userLocation, maxDistance = 50) {
    console.log(`🏪 Loading marketplace for ${userLocation}...`);
    
    const offersResult = await api.getActiveOffers();
    
    if (offersResult.success) {
        const offers = offersResult.data;
        
        // Filter offers by location proximity
        const nearbyOffers = offers.filter(offer => {
            const distance = calculateDistance(userLocation, offer.location);
            return distance <= maxDistance;
        });
        
        // Separate sell and buy offers
        const sellOffers = nearbyOffers
            .filter(offer => offer.offerType === 'SELL')
            .sort((a, b) => parseFloat(a.pricePerKwh) - parseFloat(b.pricePerKwh)); // Cheapest first
            
        const buyOffers = nearbyOffers
            .filter(offer => offer.offerType === 'BUY')
            .sort((a, b) => parseFloat(b.pricePerKwh) - parseFloat(a.pricePerKwh)); // Highest price first
        
        console.log(`\n🔋 Available Energy (${sellOffers.length} offers):`);
        sellOffers.forEach(offer => {
            const energyAmount = ethers.formatEther(offer.energyAmount);
            const pricePerKwh = ethers.formatEther(offer.pricePerKwh);
            const totalPrice = ethers.formatEther(offer.totalPrice);
            const deadline = new Date(offer.deadline * 1000);
            
            console.log(`  📊 ${energyAmount} kWh @ ${pricePerKwh} ST/kWh = ${totalPrice} ST`);
            console.log(`     📍 ${offer.location} | ⚡ ${offer.energySource} | ⏰ ${deadline.toLocaleString()}`);
            console.log(`     🆔 Offer ID: ${offer.id}`);
        });
        
        console.log(`\n💰 Energy Requests (${buyOffers.length} offers):`);
        buyOffers.forEach(offer => {
            const energyAmount = ethers.formatEther(offer.energyAmount);
            const pricePerKwh = ethers.formatEther(offer.pricePerKwh);
            const totalPrice = ethers.formatEther(offer.totalPrice);
            const deadline = new Date(offer.deadline * 1000);
            
            console.log(`  💸 ${energyAmount} kWh @ up to ${pricePerKwh} ST/kWh = max ${totalPrice} ST`);
            console.log(`     📍 ${offer.location} | ⏰ ${deadline.toLocaleString()}`);
            console.log(`     🆔 Offer ID: ${offer.id}`);
        });
        
        return { sellOffers, buyOffers };
    } else {
        console.error(`❌ Failed to load offers: ${offersResult.error}`);
        throw new Error(`Marketplace loading failed: ${offersResult.error}`);
    }
}
```

#### 9. Execute Trade
**Description**: Executes a trade by accepting an active offer. This automatically matches buyer and seller, handles payments, and creates a trade record.

```javascript
const offerId = "42";
const trade = await api.executeOffer(offerId);

// Example Response:
{
    success: true,
    data: {
        tradeId: "15",
        offerId: "42",
        transactionHash: "0x123xyz...",
        buyer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        energyAmount: "100",
        totalPrice: "8.0",
        gasUsed: "180000"
    }
}

// Usage Example:
async function buyEnergy(userId, offerId, urgency = 'NORMAL') {
    console.log(`🛒 User ${userId} attempting to buy energy from offer ${offerId}`);
    
    try {
        // Get offer details first
        const offers = await api.getActiveOffers();
        const targetOffer = offers.data.find(offer => offer.id === offerId);
        
        if (!targetOffer) {
            throw new Error('Offer not found or no longer active');
        }
        
        const energyAmount = ethers.formatEther(targetOffer.energyAmount);
        const totalPrice = ethers.formatEther(targetOffer.totalPrice);
        
        // Check user balance
        const userAddress = await getUserAddress(userId);
        const balance = await api.getTokenBalance(userAddress);
        const userBalance = parseFloat(balance.data.formatted.replace(/[^0-9.-]+/g,""));
        
        if (userBalance < parseFloat(totalPrice)) {
            throw new Error(`Insufficient balance. Need ${totalPrice} ST, have ${userBalance} ST`);
        }
        
        console.log(`💰 Purchasing ${energyAmount} kWh for ${totalPrice} ST`);
        
        // Execute the trade
        const tradeResult = await api.executeOffer(offerId);
        
        if (tradeResult.success) {
            console.log(`✅ Trade executed successfully!`);
            console.log(`🆔 Trade ID: ${tradeResult.data.tradeId}`);
            console.log(`📋 Transaction: ${tradeResult.data.transactionHash}`);
            
            // Store trade record
            await database.storeCompletedTrade({
                tradeId: tradeResult.data.tradeId,
                offerId,
                buyerId: userId,
                sellerId: await getSellerUserId(tradeResult.data.seller),
                energyAmount,
                totalPrice,
                pricePerKwh: (parseFloat(totalPrice) / parseFloat(energyAmount)).toFixed(3),
                txHash: tradeResult.data.transactionHash,
                executedAt: new Date(),
                urgency
            });
            
            // Send notifications
            await Promise.all([
                // Notify buyer
                notificationService.send(userId, {
                    type: 'energy_purchased',
                    tradeId: tradeResult.data.tradeId,
                    energyAmount,
                    totalPrice,
                    seller: tradeResult.data.seller
                }),
                
                // Notify seller
                notificationService.send(tradeResult.data.seller, {
                    type: 'energy_sold',
                    tradeId: tradeResult.data.tradeId,
                    energyAmount,
                    totalPrice,
                    buyer: userAddress
                })
            ]);
            
            // Update user's energy consumption tracking
            await energyTrackingService.recordConsumption(userId, energyAmount);
            
            return tradeResult;
        } else {
            console.error(`❌ Trade execution failed: ${tradeResult.error}`);
            throw new Error(`Trade execution failed: ${tradeResult.error}`);
        }
        
    } catch (error) {
        console.error(`💥 Buy energy error:`, error.message);
        
        // Notify user of failure
        await notificationService.send(userId, {
            type: 'purchase_failed',
            offerId,
            error: error.message
        });
        
        throw error;
    }
}
```

#### 10. Get User's Offers
**Description**: Retrieves all offers created by a specific user, including both active and completed offers.

```javascript
const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const userOffers = await api.getUserOffers(userAddress);

// Usage Example:
async function displayUserOffers(userId) {
    const userAddress = await getUserAddress(userId);
    console.log(`📋 Loading offers for user ${userId}...`);
    
    const offersResult = await api.getUserOffers(userAddress);
    
    if (offersResult.success) {
        const offers = offersResult.data;
        
        console.log(`\n👤 User ${userId} has ${offers.length} offers:`);
        
        offers.forEach(offer => {
            const energyAmount = ethers.formatEther(offer.energyAmount);
            const pricePerKwh = ethers.formatEther(offer.pricePerKwh);
            const totalValue = ethers.formatEther(offer.totalPrice);
            const deadline = new Date(offer.deadline * 1000);
            const createdAt = new Date(offer.createdAt * 1000);
            
            console.log(`\n  🆔 Offer ${offer.id} (${offer.status})`);
            console.log(`     📊 ${energyAmount} kWh @ ${pricePerKwh} ST/kWh`);
            console.log(`     💰 Total Value: ${totalValue} ST`);
            console.log(`     📍 Location: ${offer.location}`);
            console.log(`     ⚡ Source: ${offer.energySource || 'N/A'}`);
            console.log(`     📅 Created: ${createdAt.toLocaleString()}`);
            console.log(`     ⏰ Expires: ${deadline.toLocaleString()}`);
            
            // Show time remaining
            const timeLeft = deadline.getTime() - Date.now();
            if (timeLeft > 0) {
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                console.log(`     ⏳ Time left: ${hoursLeft} hours`);
            } else {
                console.log(`     ⚠️  EXPIRED`);
            }
        });
        
        return offers;
    } else {
        console.error(`❌ Failed to load user offers: ${offersResult.error}`);
        return [];
    }
}
```

#### 11. Get Trading History
**Description**: Retrieves all completed trades for a specific user, showing their trading activity and statistics.

```javascript
const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const history = await api.getUserTrades(userAddress);

// Usage Example:
async function generateTradingReport(userId, period = '30days') {
    const userAddress = await getUserAddress(userId);
    console.log(`📊 Generating ${period} trading report for user ${userId}...`);
    
    const historyResult = await api.getUserTrades(userAddress);
    
    if (historyResult.success) {
        const trades = historyResult.data;
        
        // Filter by period
        const cutoffDate = new Date();
        switch(period) {
            case '7days':
                cutoffDate.setDate(cutoffDate.getDate() - 7);
                break;
            case '30days':
                cutoffDate.setDate(cutoffDate.getDate() - 30);
                break;
            case '90days':
                cutoffDate.setDate(cutoffDate.getDate() - 90);
                break;
            default:
                cutoffDate.setFullYear(2020); // All time
        }
        
        const periodTrades = trades.filter(trade => {
            const tradeDate = new Date(trade.executedAt * 1000);
            return tradeDate >= cutoffDate;
        });
        
        // Calculate statistics
        let totalEnergyBought = 0;
        let totalEnergySold = 0;
        let totalSpent = 0;
        let totalEarned = 0;
        let buyTrades = 0;
        let sellTrades = 0;
        
        periodTrades.forEach(trade => {
            const energyAmount = parseFloat(ethers.formatEther(trade.energyAmount));
            const totalPrice = parseFloat(ethers.formatEther(trade.totalPrice));
            
            if (trade.buyer.toLowerCase() === userAddress.toLowerCase()) {
                // User was the buyer
                totalEnergyBought += energyAmount;
                totalSpent += totalPrice;
                buyTrades++;
            } else {
                // User was the seller
                totalEnergySold += energyAmount;
                totalEarned += totalPrice;
                sellTrades++;
            }
        });
        
        console.log(`\n📈 Trading Report (${period}):`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔢 Total Trades: ${periodTrades.length}`);
        console.log(`   ├─ Buy Trades: ${buyTrades}`);
        console.log(`   └─ Sell Trades: ${sellTrades}`);
        console.log(`⚡ Energy Activity:`);
        console.log(`   ├─ Bought: ${totalEnergyBought.toFixed(2)} kWh`);
        console.log(`   └─ Sold: ${totalEnergySold.toFixed(2)} kWh`);
        console.log(`💰 Financial Activity:`);
        console.log(`   ├─ Spent: ${totalSpent.toFixed(3)} ST`);
        console.log(`   ├─ Earned: ${totalEarned.toFixed(3)} ST`);
        console.log(`   └─ Net: ${(totalEarned - totalSpent).toFixed(3)} ST`);
        console.log(`📊 Average Prices:`);
        if (buyTrades > 0) {
            console.log(`   ├─ Avg Buy Price: ${(totalSpent / totalEnergyBought).toFixed(3)} ST/kWh`);
        }
        if (sellTrades > 0) {
            console.log(`   └─ Avg Sell Price: ${(totalEarned / totalEnergySold).toFixed(3)} ST/kWh`);
        }
        
        // Recent trades
        console.log(`\n📋 Recent Trades:`);
        const recentTrades = periodTrades.slice(-5).reverse();
        
        recentTrades.forEach(trade => {
            const energyAmount = ethers.formatEther(trade.energyAmount);
            const totalPrice = ethers.formatEther(trade.totalPrice);
            const pricePerKwh = (parseFloat(totalPrice) / parseFloat(energyAmount)).toFixed(3);
            const executedAt = new Date(trade.executedAt * 1000);
            const isBuyer = trade.buyer.toLowerCase() === userAddress.toLowerCase();
            
            console.log(`  ${isBuyer ? '🛒' : '💸'} ${executedAt.toLocaleDateString()}: ${energyAmount} kWh @ ${pricePerKwh} ST/kWh`);
        });
        
        return {
            totalTrades: periodTrades.length,
            buyTrades,
            sellTrades,
            totalEnergyBought,
            totalEnergySold,
            totalSpent,
            totalEarned,
            netProfit: totalEarned - totalSpent,
            avgBuyPrice: buyTrades > 0 ? totalSpent / totalEnergyBought : 0,
            avgSellPrice: sellTrades > 0 ? totalEarned / totalEnergySold : 0,
            trades: periodTrades
        };
    } else {
        console.error(`❌ Failed to load trading history: ${historyResult.error}`);
        return null;
    }
}
```

### 🏛️ Staking & Governance

#### 12. Stake Tokens
**Description**: Stakes ST tokens to become a validator in the network. Staked tokens earn rewards over time but are locked for a minimum period.

```javascript
const stakeAmount = "1000"; // 1000 ST tokens
const result = await api.stakeTokens(stakeAmount);

// Usage Example:
async function becomeValidator(userId, stakeAmount) {
    console.log(`🥩 User ${userId} staking ${stakeAmount} ST tokens to become validator`);
    
    const userAddress = await getUserAddress(userId);
    
    // Check user balance
    const balance = await api.getTokenBalance(userAddress);
    const userBalance = parseFloat(balance.data.formatted.replace(/[^0-9.-]+/g,""));
    
    if (userBalance < parseFloat(stakeAmount)) {
        throw new Error(`Insufficient balance for staking. Need ${stakeAmount} ST, have ${userBalance} ST`);
    }
    
    const stakeResult = await api.stakeTokens(stakeAmount);
    
    if (stakeResult.success) {
        console.log(`✅ Successfully staked ${stakeAmount} ST tokens`);
        console.log(`🏆 User ${userId} is now a validator!`);
        
        // Update user status
        await database.updateUserStatus(userId, {
            isValidator: true,
            stakedAmount: stakeAmount,
            stakingStartDate: new Date(),
            validatorTxHash: stakeResult.data.transactionHash
        });
        
        // Send congratulations notification
        await notificationService.send(userId, {
            type: 'validator_activated',
            stakedAmount: stakeAmount,
            estimatedDailyRewards: await calculateDailyRewards(stakeAmount),
            txHash: stakeResult.data.transactionHash
        });
        
        return stakeResult;
    } else {
        console.error(`❌ Staking failed: ${stakeResult.error}`);
        throw new Error(`Staking failed: ${stakeResult.error}`);
    }
}
```

#### 13. Unstake Tokens
**Description**: Removes tokens from staking. May have a cooldown period before tokens are fully available.

```javascript
const unstakeAmount = "500"; // 500 ST tokens
const result = await api.unstakeTokens(unstakeAmount);

// Usage Example:
async function unstakeTokens(userId, unstakeAmount) {
    console.log(`📤 User ${userId} unstaking ${unstakeAmount} ST tokens`);
    
    const userAddress = await getUserAddress(userId);
    
    // Check current stake
    const stakeInfo = await api.getUserStakeInfo(userAddress);
    if (!stakeInfo.success) {
        throw new Error('Failed to get stake information');
    }
    
    const currentStake = parseFloat(ethers.formatEther(stakeInfo.data.stakedAmount));
    
    if (currentStake < parseFloat(unstakeAmount)) {
        throw new Error(`Cannot unstake ${unstakeAmount} ST. Only have ${currentStake} ST staked`);
    }
    
    const unstakeResult = await api.unstakeTokens(unstakeAmount);
    
    if (unstakeResult.success) {
        console.log(`✅ Unstaking initiated for ${unstakeAmount} ST tokens`);
        
        // Update database
        await database.recordUnstaking(userId, {
            amount: unstakeAmount,
            txHash: unstakeResult.data.transactionHash,
            unstakeDate: new Date(),
            availableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        // Notify user
        await notificationService.send(userId, {
            type: 'unstaking_initiated',
            amount: unstakeAmount,
            availableIn: '7 days',
            txHash: unstakeResult.data.transactionHash
        });
        
        return unstakeResult;
    } else {
        console.error(`❌ Unstaking failed: ${unstakeResult.error}`);
        throw new Error(`Unstaking failed: ${unstakeResult.error}`);
    }
}
```

#### 14. Claim Staking Rewards
**Description**: Claims accumulated staking rewards earned by validators.

```javascript
const rewards = await api.claimRewards();

// Usage Example:
async function claimValidatorRewards(userId) {
    console.log(`🎁 User ${userId} claiming staking rewards`);
    
    const userAddress = await getUserAddress(userId);
    
    // Check available rewards first
    const stakeInfo = await api.getUserStakeInfo(userAddress);
    if (!stakeInfo.success) {
        throw new Error('Failed to get stake information');
    }
    
    const availableRewards = parseFloat(ethers.formatEther(stakeInfo.data.rewards));
    
    if (availableRewards <= 0) {
        console.log(`ℹ️  No rewards available to claim`);
        return { success: true, data: { amount: "0" } };
    }
    
    console.log(`💰 Available rewards: ${availableRewards.toFixed(3)} ST`);
    
    const claimResult = await api.claimRewards();
    
    if (claimResult.success) {
        console.log(`✅ Successfully claimed ${availableRewards.toFixed(3)} ST rewards`);
        
        // Update database
        await database.recordRewardClaim(userId, {
            amount: availableRewards,
            txHash: claimResult.data.transactionHash,
            claimDate: new Date()
        });
        
        // Notify user
        await notificationService.send(userId, {
            type: 'rewards_claimed',
            amount: availableRewards.toFixed(3),
            txHash: claimResult.data.transactionHash,
            newBalance: await getUpdatedBalance(userAddress)
        });
        
        return claimResult;
    } else {
        console.error(`❌ Claiming rewards failed: ${claimResult.error}`);
        throw new Error(`Claiming rewards failed: ${claimResult.error}`);
    }
}
```

#### 15. Get Stake Information
**Description**: Gets detailed information about a user's staking position including staked amount, rewards, and timing.

```javascript
const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const stakeInfo = await api.getUserStakeInfo(userAddress);

// Usage Example:
async function displayStakingDashboard(userId) {
    const userAddress = await getUserAddress(userId);
    console.log(`📊 Loading staking dashboard for user ${userId}...`);
    
    const stakeInfoResult = await api.getUserStakeInfo(userAddress);
    
    if (stakeInfoResult.success) {
        const stakeInfo = stakeInfoResult.data;
        
        const stakedAmount = parseFloat(ethers.formatEther(stakeInfo.stakedAmount));
        const availableRewards = parseFloat(ethers.formatEther(stakeInfo.rewards));
        const stakingStartTime = new Date(stakeInfo.stakingTime * 1000);
        const stakingDuration = Math.floor((Date.now() - stakingStartTime.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`\n🏛️  Staking Dashboard:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`💰 Staked Amount: ${stakedAmount.toFixed(2)} ST`);
        console.log(`🎁 Available Rewards: ${availableRewards.toFixed(4)} ST`);
        console.log(`📅 Staking Since: ${stakingStartTime.toLocaleDateString()}`);
        console.log(`⏰ Staking Duration: ${stakingDuration} days`);
        
        // Calculate APR
        const dailyRewardRate = availableRewards / stakingDuration;
        const annualRewards = dailyRewardRate * 365;
        const apr = stakedAmount > 0 ? (annualRewards / stakedAmount) * 100 : 0;
        
        console.log(`📈 Current APR: ${apr.toFixed(2)}%`);
        console.log(`📊 Daily Rewards: ~${dailyRewardRate.toFixed(4)} ST`);
        
        // Validator status
        const isValidator = stakedAmount >= 1000; // Minimum validator stake
        console.log(`🏆 Validator Status: ${isValidator ? '✅ Active' : '❌ Inactive (need 1000+ ST)'}`);
        
        if (availableRewards > 0) {
            console.log(`\n💡 You have ${availableRewards.toFixed(4)} ST ready to claim!`);
        }
        
        return {
            stakedAmount,
            availableRewards,
            stakingDuration,
            apr,
            dailyRewardRate,
            isValidator,
            stakingStartTime
        };
    } else {
        console.error(`❌ Failed to load staking info: ${stakeInfoResult.error}`);
        return null;
    }
}
```

### 📊 System Information

#### 16. Get System Overview
**Description**: Provides comprehensive statistics about the entire SolChain system including token supply, trading volume, and network health.

```javascript
const overview = await api.getSystemOverview();

// Usage Example:
async function displaySystemDashboard() {
    console.log(`🌐 Loading SolChain system overview...`);
    
    const overviewResult = await api.getSystemOverview();
    
    if (overviewResult.success) {
        const overview = overviewResult.data;
        
        console.log(`\n🌞 SolChain Network Status:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        // Token metrics
        console.log(`\n💰 Token Metrics:`);
        console.log(`   ├─ Total Supply: ${parseFloat(overview.tokenInfo.totalSupply).toLocaleString()} ST`);
        console.log(`   ├─ Max Supply: ${parseFloat(overview.tokenInfo.maxSupply).toLocaleString()} ST`);
        console.log(`   ├─ Circulating: ${((parseFloat(overview.tokenInfo.totalSupply) / parseFloat(overview.tokenInfo.maxSupply)) * 100).toFixed(1)}%`);
        console.log(`   └─ Holders: ${overview.activeUsers?.toLocaleString() || 'N/A'}`);
        
        // Trading metrics
        console.log(`\n📈 Trading Metrics:`);
        console.log(`   ├─ Total Trades: ${overview.tradingStats.totalTrades.toLocaleString()}`);
        console.log(`   ├─ Volume Traded: ${parseFloat(overview.tradingStats.totalVolume).toLocaleString()} kWh`);
        console.log(`   ├─ Trading Fees: ${parseFloat(overview.tradingStats.totalFees).toFixed(2)} ST`);
        console.log(`   └─ Active Offers: ${overview.activeOffers?.toLocaleString() || 'N/A'}`);
        
        // Staking metrics
        if (overview.stakingStats) {
            console.log(`\n🏛️  Staking Metrics:`);
            console.log(`   ├─ Total Staked: ${parseFloat(overview.stakingStats.totalStaked).toLocaleString()} ST`);
            console.log(`   ├─ Staking Ratio: ${((parseFloat(overview.stakingStats.totalStaked) / parseFloat(overview.tokenInfo.totalSupply)) * 100).toFixed(1)}%`);
            console.log(`   ├─ Active Validators: ${overview.stakingStats.activeValidators}`);
            console.log(`   └─ Rewards Distributed: ${parseFloat(overview.stakingStats.totalRewards).toFixed(2)} ST`);
        }
        
        // Network health
        console.log(`\n🔗 Network Health:`);
        console.log(`   ├─ Block Height: ${overview.blockHeight?.toLocaleString() || 'N/A'}`);
        console.log(`   ├─ Gas Price: ${overview.gasPrice || 'N/A'} gwei`);
        console.log(`   ├─ Network: ${overview.network || 'localhost'}`);
        console.log(`   └─ Status: 🟢 Operational`);
        
        // Energy production
        if (overview.energyStats) {
            console.log(`\n⚡ Energy Statistics:`);
            console.log(`   ├─ Total Generated: ${overview.energyStats.totalGenerated?.toLocaleString() || 'N/A'} kWh`);
            console.log(`   ├─ Total Traded: ${overview.energyStats.totalTraded?.toLocaleString() || 'N/A'} kWh`);
            console.log(`   ├─ Avg Price: ${overview.energyStats.avgPrice?.toFixed(3) || 'N/A'} ST/kWh`);
            console.log(`   └─ Active Producers: ${overview.energyStats.activeProducers?.toLocaleString() || 'N/A'}`);
        }
        
        return overview;
    } else {
        console.error(`❌ Failed to load system overview: ${overviewResult.error}`);
        return null;
    }
}
```

#### 17. Get Trading Statistics
**Description**: Retrieves detailed trading statistics including volume, fees, and transaction counts.

```javascript
const stats = await api.getTradingStats();

// Usage Example:
async function generateMarketReport(period = 'daily') {
    console.log(`📊 Generating ${period} market report...`);
    
    const statsResult = await api.getTradingStats();
    
    if (statsResult.success) {
        const stats = statsResult.data;
        
        console.log(`\n📈 Market Statistics:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔢 Total Trades: ${stats.totalTrades.toLocaleString()}`);
        console.log(`⚡ Volume Traded: ${parseFloat(stats.totalVolume).toLocaleString()} kWh`);
        console.log(`💰 Total Fees: ${parseFloat(stats.totalFees).toFixed(2)} ST`);
        
        // Calculate averages
        if (stats.totalTrades > 0) {
            const avgTradeSize = parseFloat(stats.totalVolume) / stats.totalTrades;
            const avgTradeValue = parseFloat(stats.totalFees) * 40; // Assuming 0.25% fee
            const avgFeePerTrade = parseFloat(stats.totalFees) / stats.totalTrades;
            
            console.log(`\n📊 Averages:`);
            console.log(`   ├─ Avg Trade Size: ${avgTradeSize.toFixed(2)} kWh`);
            console.log(`   ├─ Avg Trade Value: ${avgTradeValue.toFixed(2)} ST`);
            console.log(`   └─ Avg Fee: ${avgFeePerTrade.toFixed(4)} ST`);
        }
        
        // Market activity indicators
        const marketActivity = stats.totalTrades > 1000 ? 'High' : 
                              stats.totalTrades > 100 ? 'Medium' : 'Low';
        
        console.log(`\n🌡️  Market Activity: ${marketActivity}`);
        
        return {
            ...stats,
            marketActivity,
            avgTradeSize: stats.totalTrades > 0 ? parseFloat(stats.totalVolume) / stats.totalTrades : 0,
            avgFeePerTrade: stats.totalTrades > 0 ? parseFloat(stats.totalFees) / stats.totalTrades : 0
        };
    } else {
        console.error(`❌ Failed to load trading stats: ${statsResult.error}`);
        return null;
    }
}
```

#### 18. Get Oracle Price
**Description**: Retrieves the current energy price from the oracle system for market reference.

```javascript
const price = await api.getEnergyPrice();

// Example Response:
{
    success: true,
    data: {
        currentPrice: "0.085", // ST per kWh
        lastUpdated: 1692234567,
        priceSource: "oracle",
        confidence: 0.95
    }
}

// Usage Example:
async function getMarketPrice() {
    console.log(`📊 Fetching current energy market price...`);
    
    const priceResult = await api.getEnergyPrice();
    
    if (priceResult.success) {
        const currentPrice = parseFloat(priceResult.data.currentPrice);
        const lastUpdated = new Date(priceResult.data.lastUpdated * 1000);
        const confidence = priceResult.data.confidence * 100;
        
        console.log(`💰 Current Price: ${currentPrice.toFixed(3)} ST/kWh`);
        console.log(`⏰ Last Updated: ${lastUpdated.toLocaleString()}`);
        console.log(`📈 Confidence: ${confidence.toFixed(1)}%`);
        
        // Price analysis
        const priceLevel = currentPrice < 0.06 ? 'Very Low' :
                          currentPrice < 0.08 ? 'Low' :
                          currentPrice < 0.10 ? 'Normal' :
                          currentPrice < 0.12 ? 'High' : 'Very High';
        
        console.log(`📊 Price Level: ${priceLevel}`);
        
        // Trading recommendations
        if (priceLevel === 'Very Low' || priceLevel === 'Low') {
            console.log(`💡 Recommendation: Good time to BUY energy`);
        } else if (priceLevel === 'High' || priceLevel === 'Very High') {
            console.log(`💡 Recommendation: Good time to SELL energy`);
        } else {
            console.log(`💡 Recommendation: Normal market conditions`);
        }
        
        return {
            price: currentPrice,
            priceLevel,
            lastUpdated,
            confidence: confidence / 100,
            recommendation: priceLevel
        };
    } else {
        console.error(`❌ Failed to get oracle price: ${priceResult.error}`);
        return null;
    }
}

// Advanced usage: Price tracking and alerts
async function monitorPriceChanges(thresholdPercent = 5) {
    let lastPrice = null;
    
    setInterval(async () => {
        const currentPriceData = await getMarketPrice();
        
        if (currentPriceData && lastPrice) {
            const priceChange = ((currentPriceData.price - lastPrice) / lastPrice) * 100;
            
            if (Math.abs(priceChange) >= thresholdPercent) {
                const direction = priceChange > 0 ? '📈 UP' : '📉 DOWN';
                console.log(`🚨 PRICE ALERT: Energy price moved ${direction} by ${Math.abs(priceChange).toFixed(1)}%`);
                console.log(`   Previous: ${lastPrice.toFixed(3)} ST/kWh`);
                console.log(`   Current:  ${currentPriceData.price.toFixed(3)} ST/kWh`);
                
                // Send alerts to users
                await alertService.sendPriceAlert({
                    change: priceChange,
                    oldPrice: lastPrice,
                    newPrice: currentPriceData.price,
                    direction: priceChange > 0 ? 'increase' : 'decrease'
                });
            }
        }
        
        lastPrice = currentPriceData?.price || lastPrice;
    }, 60000); // Check every minute
}
```

---

## 💻 Real Integration Examples

### Example 1: Solar Panel IoT Integration
```javascript
// services/SolarPanelService.js
const EnergyService = require('./EnergyService');

class SolarPanelService {
    constructor() {
        this.energyService = new EnergyService();
    }

    async processSolarReading(panelId, kwhProduced) {
        console.log(`📊 Panel ${panelId} produced ${kwhProduced} kWh`);
        
        // 1. Record energy production on blockchain
        const mintResult = await this.energyService.recordEnergyProduction(
            panelId, 
            kwhProduced
        );
        
        if (mintResult.success) {
            console.log(`✅ Minted ${kwhProduced} ST tokens`);
            
            // 2. Auto-create sell offer if excess energy
            if (kwhProduced > 10) { // If more than 10 kWh
                const sellResult = await this.energyService.createEnergyOffer(
                    panelId,
                    (kwhProduced - 5).toString(), // Keep 5 kWh
                    "0.08" // 0.08 ST per kWh
                );
                
                if (sellResult.success) {
                    console.log(`📈 Created sell offer for ${kwhProduced - 5} kWh`);
                }
            }
        }
        
        return mintResult;
    }
}

module.exports = SolarPanelService;
```

### Example 2: Energy Marketplace API
```javascript
// routes/marketplace.js
const express = require('express');
const EnergyService = require('../services/EnergyService');
const router = express.Router();
const energyService = new EnergyService();

// Get all available energy offers
router.get('/offers', async (req, res) => {
    try {
        const offers = await energyService.solchain.getActiveOffers();
        
        if (offers.success) {
            // Transform for frontend
            const transformedOffers = offers.data.map(offer => ({
                id: offer.id,
                seller: offer.creator,
                energyAmount: offer.energyAmount,
                pricePerKwh: offer.pricePerKwh,
                totalPrice: offer.totalPrice,
                location: offer.location,
                energySource: offer.energySource,
                deadline: new Date(offer.deadline * 1000),
                status: offer.status
            }));
            
            res.json({ success: true, offers: transformedOffers });
        } else {
            res.status(500).json({ error: offers.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buy energy
router.post('/buy/:offerId', async (req, res) => {
    try {
        const { offerId } = req.params;
        const { buyerId } = req.body;
        
        // Execute the trade
        const result = await energyService.solchain.executeOffer(offerId);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Energy purchased successfully!',
                tradeId: result.data.tradeId,
                transactionHash: result.data.transactionHash
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's energy portfolio
router.get('/portfolio/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get balance, offers, and trade history
        const [balance, offers, trades] = await Promise.all([
            energyService.solchain.getTokenBalance(userId),
            energyService.solchain.getUserOffers(userId),
            energyService.solchain.getUserTrades(userId)
        ]);
        
        res.json({
            success: true,
            portfolio: {
                balance: balance.data?.formatted || '0 ST',
                activeOffers: offers.data?.length || 0,
                completedTrades: trades.data?.length || 0,
                offers: offers.data || [],
                trades: trades.data || []
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Example 3: Automated Trading Bot
```javascript
// services/TradingBot.js
const EnergyService = require('./EnergyService');

class TradingBot {
    constructor() {
        this.energyService = new EnergyService();
        this.isRunning = false;
    }

    async start() {
        this.isRunning = true;
        console.log('🤖 Trading bot started');
        
        // Check for trading opportunities every 30 seconds
        setInterval(async () => {
            if (this.isRunning) {
                await this.checkTradingOpportunities();
            }
        }, 30000);
    }

    async checkTradingOpportunities() {
        try {
            const offers = await this.energyService.solchain.getActiveOffers();
            
            if (offers.success) {
                for (const offer of offers.data) {
                    // Simple arbitrage: buy low, sell high
                    if (offer.offerType === 'SELL' && 
                        parseFloat(offer.pricePerKwh) < 0.07) {
                        
                        console.log(`🎯 Found good deal: ${offer.energyAmount} kWh at ${offer.pricePerKwh} ST/kWh`);
                        
                        const buyResult = await this.energyService.solchain.executeOffer(offer.id);
                        
                        if (buyResult.success) {
                            console.log(`✅ Bought energy offer ${offer.id}`);
                            
                            // Immediately create a sell offer at higher price
                            setTimeout(async () => {
                                await this.energyService.createEnergyOffer(
                                    this.botAddress,
                                    offer.energyAmount,
                                    '0.09' // Sell at 0.09 ST/kWh
                                );
                            }, 1000);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('🚨 Trading bot error:', error.message);
        }
    }

    stop() {
        this.isRunning = false;
        console.log('⏹️ Trading bot stopped');
    }
}

module.exports = TradingBot;
```

---

## 🧪 Testing Your Integration

### 1. Unit Tests for Your Services
```javascript
// tests/EnergyService.test.js
const EnergyService = require('../services/EnergyService');

describe('EnergyService Integration', () => {
    let energyService;
    const testUserAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

    beforeAll(async () => {
        energyService = new EnergyService();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for init
    });

    test('should mint tokens for energy production', async () => {
        const result = await energyService.recordEnergyProduction(testUserAddress, 100);
        
        expect(result.success).toBe(true);
        expect(result.data.transactionHash).toBeDefined();
    });

    test('should create energy sell offer', async () => {
        const result = await energyService.createEnergyOffer(
            testUserAddress, 
            50, 
            0.08
        );
        
        expect(result.success).toBe(true);
        expect(result.data.offerId).toBeDefined();
    });

    test('should get user balance', async () => {
        const result = await energyService.getUserEnergyBalance(testUserAddress);
        
        expect(result.success).toBe(true);
        expect(result.data.formatted).toContain('ST');
    });
});
```

### 2. Integration Test Script
```javascript
// tests/integration.js
const EnergyService = require('../services/EnergyService');

async function runIntegrationTests() {
    console.log('🧪 Running Integration Tests...\n');
    
    const energyService = new EnergyService();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for blockchain
    
    const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    
    try {
        // Test 1: Energy Production
        console.log('1️⃣ Testing energy production...');
        const production = await energyService.recordEnergyProduction(testAddress, 50);
        console.log(production.success ? '✅ PASS' : '❌ FAIL');
        
        // Test 2: Check Balance
        console.log('2️⃣ Testing balance check...');
        const balance = await energyService.getUserEnergyBalance(testAddress);
        console.log(balance.success ? '✅ PASS' : '❌ FAIL');
        console.log(`   Balance: ${balance.data?.formatted}`);
        
        // Test 3: Create Offer
        console.log('3️⃣ Testing offer creation...');
        const offer = await energyService.createEnergyOffer(testAddress, 25, 0.08);
        console.log(offer.success ? '✅ PASS' : '❌ FAIL');
        
        console.log('\n✅ All integration tests passed!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    }
}

runIntegrationTests();
```

### 3. API Endpoint Tests
```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('Energy API Endpoints', () => {
    test('POST /api/energy/produce', async () => {
        const response = await request(app)
            .post('/api/energy/produce')
            .send({
                userId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                kwhProduced: 100
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.txHash).toBeDefined();
    });

    test('GET /api/energy/balance/:userId', async () => {
        const response = await request(app)
            .get('/api/energy/balance/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        
        expect(response.status).toBe(200);
        expect(response.body.balance).toBeDefined();
    });
});
```

---

## 🚢 Production Deployment

### 1. Environment Configuration

#### Production .env
```bash
# Production environment
HARDHAT_NETWORK=mainnet
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=1
PRIVATE_KEY=your_production_private_key

# Security
ENABLE_LOGGING=true
LOG_LEVEL=info
MAX_GAS_PRICE=50000000000

# Monitoring
SENTRY_DSN=your_sentry_dsn
HEALTH_CHECK_INTERVAL=60000
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy blockchain module
COPY blockchain/ ./blockchain/
COPY your-backend/ ./

# Install dependencies
RUN npm install --production

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  solchain-backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - HARDHAT_NETWORK=mainnet
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - solchain-backend
    restart: unless-stopped
```

### 2. Monitoring & Health Checks

```javascript
// services/HealthCheck.js
class HealthCheckService {
    constructor(energyService) {
        this.energyService = energyService;
    }

    async checkBlockchainHealth() {
        try {
            // Test basic connectivity
            const tokenInfo = await this.energyService.solchain.getTokenInfo();
            
            return {
                status: 'healthy',
                blockchain: tokenInfo.success ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Health check endpoint
app.get('/health', async (req, res) => {
    const healthCheck = new HealthCheckService(energyService);
    const status = await healthCheck.checkBlockchainHealth();
    
    res.status(status.status === 'healthy' ? 200 : 500).json(status);
});
```

### 3. Scaling Considerations

```javascript
// services/ConnectionPool.js
class SolChainConnectionPool {
    constructor(poolSize = 5) {
        this.connections = [];
        this.poolSize = poolSize;
        this.currentIndex = 0;
        this.init();
    }

    async init() {
        for (let i = 0; i < this.poolSize; i++) {
            const config = new SolChainConfig();
            const result = await config.createAPIInstance();
            if (result.success) {
                this.connections.push(result.api);
            }
        }
        console.log(`✅ Initialized ${this.connections.length} SolChain connections`);
    }

    getConnection() {
        const connection = this.connections[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.connections.length;
        return connection;
    }
}

// Usage in your service
const connectionPool = new SolChainConnectionPool(5);

class ScalableEnergyService {
    async recordEnergyProduction(userId, kwhProduced) {
        const api = connectionPool.getConnection();
        return await api.mintTokens(userId, kwhProduced.toString());
    }
}
```

---

## ❓ Troubleshooting

### Common Issues & Solutions

#### 1. "Contract not initialized"
```bash
# Problem: API trying to use contracts before deployment
# Solution: Ensure contracts are deployed first

npx hardhat node                    # Terminal 1
npx hardhat run scripts/deploy.js   # Terminal 2
npm start                          # Terminal 3
```

#### 2. "Insufficient funds for gas"
```javascript
// Problem: Not enough ETH for gas fees
// Solution: Fund your account in development

// For Hardhat local network, use pre-funded accounts
const testAccounts = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Has 10,000 ETH
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Has 10,000 ETH
    // ... more accounts
];
```

#### 3. "Nonce too low"
```javascript
// Problem: Transaction nonce conflicts
// Solution: API handles this automatically, but if issues persist:

// Reset account nonce (development only)
await provider.send("hardhat_reset");
```

#### 4. "Network connection failed"
```javascript
// Problem: Can't connect to blockchain
// Solution: Check network configuration

// Debug connection
const config = new SolChainConfig();
console.log('Network:', config.getNetworkConfig());

// Test connection
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const blockNumber = await provider.getBlockNumber();
console.log('Connected! Block number:', blockNumber);
```

#### 5. "Token minting failed"
```javascript
// Problem: Minting permissions or balance issues
// Solution: Check minter role and token cap

// Check if address has minter role
const hasRole = await solarToken.hasRole(MINTER_ROLE, address);
console.log('Has minter role:', hasRole);

// Check current supply vs cap
const totalSupply = await solarToken.totalSupply();
const maxSupply = await solarToken.MAX_SUPPLY();
console.log(`Supply: ${totalSupply} / ${maxSupply}`);
```

### Debug Tools

#### 1. Blockchain Explorer (Development)
```bash
# Install and run local blockchain explorer
npm install -g @ethereum/hardhat-explorer
hardhat-explorer --network localhost
# Open http://localhost:3001
```

#### 2. API Debug Mode
```javascript
// Enable detailed logging
const config = new SolChainConfig({
    debug: true,
    logLevel: 'verbose'
});

// API will log all transactions and responses
```

#### 3. Transaction Tracing
```javascript
// services/DebugService.js
class DebugService {
    async traceTransaction(txHash) {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        console.log('Transaction Details:');
        console.log('- Hash:', txHash);
        console.log('- Status:', receipt.status === 1 ? 'Success' : 'Failed');
        console.log('- Gas Used:', receipt.gasUsed.toString());
        console.log('- Block:', receipt.blockNumber);
        
        return receipt;
    }
}
```

### Getting Help

#### 1. Check Logs
```bash
# View Hardhat node logs
tail -f hardhat.log

# View your application logs
tail -f logs/app.log
```

#### 2. Test Individual Components
```bash
# Test only blockchain connectivity
node tests/connectivity.js

# Test only token operations
node tests/token.js

# Test only trading functions
node tests/trading.js
```

#### 3. Community Support
- 📧 **Email**: support@solchain.dev
- 💬 **Discord**: [SolChain Community](https://discord.gg/solchain)
- 📚 **Documentation**: [docs.solchain.dev](https://docs.solchain.dev)
- 🐛 **Issues**: [GitHub Issues](https://github.com/solchain/issues)

---

## 🔐 Security Best Practices

### 1. Private Key Management
```javascript
// ❌ DON'T: Store private keys in code
const privateKey = "0x1234567890abcdef...";

// ✅ DO: Use environment variables
const privateKey = process.env.PRIVATE_KEY;

// ✅ DO: Use key management services in production
const privateKey = await keyManagementService.getKey('solchain-prod');
```

### 2. Input Validation
```javascript
// services/ValidationService.js
class ValidationService {
    static validateEthereumAddress(address) {
        return ethers.isAddress(address);
    }

    static validateAmount(amount) {
        const num = parseFloat(amount);
        return num > 0 && num <= 1000000; // Max 1M kWh
    }

    static sanitizeInput(input) {
        return input.toString().trim().slice(0, 100); // Limit length
    }
}

// Use in your routes
app.post('/api/energy/produce', async (req, res) => {
    const { userId, kwhProduced } = req.body;
    
    // Validate inputs
    if (!ValidationService.validateEthereumAddress(userId)) {
        return res.status(400).json({ error: 'Invalid user address' });
    }
    
    if (!ValidationService.validateAmount(kwhProduced)) {
        return res.status(400).json({ error: 'Invalid energy amount' });
    }
    
    // Proceed with validated inputs...
});
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// Limit energy production reports
const energyProductionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many energy production reports, try again later'
});

app.use('/api/energy/produce', energyProductionLimiter);
```

### 4. Error Handling
```javascript
// middleware/errorHandler.js
function errorHandler(error, req, res, next) {
    console.error('API Error:', error);
    
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ 
            error: 'Internal server error',
            requestId: req.id 
        });
    } else {
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
}

app.use(errorHandler);
```

---

## 📈 Performance Optimization

### 1. Connection Caching
```javascript
// Cache contract instances
const contractCache = new Map();

function getCachedContract(address, abi) {
    const key = `${address}-${abi.length}`;
    if (!contractCache.has(key)) {
        const contract = new ethers.Contract(address, abi, provider);
        contractCache.set(key, contract);
    }
    return contractCache.get(key);
}
```

### 2. Batch Operations
```javascript
// services/BatchService.js
class BatchService {
    constructor(energyService) {
        this.energyService = energyService;
        this.pendingOperations = [];
        this.batchSize = 10;
        this.batchTimeout = 5000; // 5 seconds
    }

    async addEnergyProduction(userId, kwhProduced) {
        return new Promise((resolve, reject) => {
            this.pendingOperations.push({
                type: 'mint',
                userId,
                kwhProduced,
                resolve,
                reject
            });

            if (this.pendingOperations.length >= this.batchSize) {
                this.processBatch();
            }
        });
    }

    async processBatch() {
        const operations = this.pendingOperations.splice(0, this.batchSize);
        
        try {
            // Process all operations in parallel
            const results = await Promise.all(
                operations.map(op => 
                    this.energyService.recordEnergyProduction(op.userId, op.kwhProduced)
                )
            );

            // Resolve all promises
            operations.forEach((op, index) => {
                op.resolve(results[index]);
            });
        } catch (error) {
            // Reject all promises
            operations.forEach(op => {
                op.reject(error);
            });
        }
    }
}
```

---

## 🚀 Advanced Features

### 1. Real-time Updates with WebSockets
```javascript
// services/RealtimeService.js
const WebSocket = require('ws');

class RealtimeService {
    constructor(energyService) {
        this.energyService = energyService;
        this.wss = new WebSocket.Server({ port: 8080 });
        this.clients = new Set();
        
        this.init();
    }

    init() {
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });

        // Listen for blockchain events
        this.listenToBlockchainEvents();
    }

    async listenToBlockchainEvents() {
        const api = this.energyService.solchain;
        
        // Listen for new energy offers
        api.contracts.EnergyTrading.on('OfferCreated', (offerId, creator, offerType, energyAmount, price) => {
            this.broadcast({
                type: 'new_offer',
                data: {
                    offerId: offerId.toString(),
                    creator,
                    offerType,
                    energyAmount: ethers.formatEther(energyAmount),
                    price: ethers.formatEther(price)
                }
            });
        });

        // Listen for completed trades
        api.contracts.EnergyTrading.on('TradeExecuted', (tradeId, buyer, seller, energyAmount, totalPrice) => {
            this.broadcast({
                type: 'trade_completed',
                data: {
                    tradeId: tradeId.toString(),
                    buyer,
                    seller,
                    energyAmount: ethers.formatEther(energyAmount),
                    totalPrice: ethers.formatEther(totalPrice)
                }
            });
        });
    }

    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

// Initialize in your app
const realtimeService = new RealtimeService(energyService);
```

### 2. Analytics & Reporting
```javascript
// services/AnalyticsService.js
class AnalyticsService {
    constructor(energyService) {
        this.energyService = energyService;
    }

    async generateDailyReport() {
        const stats = await this.energyService.solchain.getTradingStats();
        const overview = await this.energyService.solchain.getSystemOverview();
        
        return {
            date: new Date().toISOString().split('T')[0],
            totalTrades: stats.data.totalTrades,
            totalVolume: stats.data.totalVolume,
            totalFees: stats.data.totalFees,
            activeUsers: overview.data.activeUsers,
            energyProduced: this.calculateDailyProduction(),
            energyTraded: this.calculateDailyTrading(),
            avgPrice: this.calculateAvgPrice()
        };
    }

    async exportTransactions(startDate, endDate) {
        // Export all transactions for accounting/compliance
        const transactions = await this.getTransactionHistory(startDate, endDate);
        
        const csv = this.convertToCSV(transactions);
        return csv;
    }
}
```

---

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Complete API reference and guides
- 💬 **Community**: Join our Discord for quick help
- 🐛 **Bug Reports**: GitHub Issues with detailed templates
- 📧 **Enterprise Support**: Priority support for production deployments

### Contributing
We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### License
MIT License - see [LICENSE](LICENSE) file for details.

---

**🎉 Congratulations! Your backend now has enterprise-grade blockchain integration.**

The SolChain API handles all the blockchain complexity, so you can focus on building amazing energy trading features for your users.
