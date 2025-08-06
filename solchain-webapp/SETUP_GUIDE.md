# 🚀 SolChain - Quick Start Guide
## BCOLBD 2025 - Team GreyDevs

This guide will help you run the complete SolChain blockchain-based solar energy trading platform.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Python** 3.8+ ([Download](https://python.org/))
- **MetaMask Browser Extension** ([Install](https://metamask.io/))

**✅ Database**: Uses SQLite (no additional installation required!)

### Optional Tools
- **Visual Studio Code** (Recommended IDE)
- **SQLite Browser** (Database GUI - optional)
- **Postman** (API testing)

---

## 🏗️ Quick Setup (5 Minutes)

### Step 1: Clone and Install
```bash
# Navigate to your projects directory
cd /path/to/your/projects

# If the project is already cloned
cd SolChain/solchain-webapp

# Install all dependencies
npm run install:all
```

### Step 2: Environment Setup
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your settings (see configuration section below)
```

### Step 3: Start the Complete System
```bash
# Start everything with one command
npm run dev:all
```

This will start:
- 🔗 Local Blockchain (Hardhat) on `http://localhost:8545`
- 🗄️ Backend API on `http://localhost:5000`
- 🎨 Frontend React App on `http://localhost:3000`
- 🤖 AI Services on `http://localhost:8000`

---

## 🔧 Detailed Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/solchain

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Blockchain (Local Hardhat)
ETHEREUM_NETWORK=development
HARDHAT_RPC_URL=http://127.0.0.1:8545

# Smart Contract Addresses (will be set after deployment)
SOLAR_TOKEN_ADDRESS=
ENERGY_TRADING_ADDRESS=

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 2. Smart Contracts Setup

```bash
cd smart-contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Start local blockchain
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```env
# React App Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NETWORK=development

# Blockchain Configuration
REACT_APP_SOLAR_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_ENERGY_TRADING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# AI Service
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

### 4. AI Services Setup

```bash
cd ai-services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🏃‍♂️ Running the Application

### Option 1: Run Everything at Once (Recommended)
```bash
# From the root directory (solchain-webapp)
npm run dev:all
```

### Option 2: Run Services Individually

#### Terminal 1: Local Blockchain
```bash
cd smart-contracts
npx hardhat node
```

#### Terminal 2: Deploy Smart Contracts
```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```

#### Terminal 3: Backend API
```bash
cd backend
npm run dev
```

#### Terminal 4: Frontend React App
```bash
cd frontend
npm start
```

#### Terminal 5: AI Services
```bash
cd ai-services
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

python src/api/ml_api.py
```

---

## 🌐 Access URLs

Once everything is running:

- **Frontend (Main App)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Local Blockchain**: http://localhost:8545
- **AI Services**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017

---

## 🔗 MetaMask Setup

### 1. Add Local Network
1. Open MetaMask
2. Click on Network dropdown → "Add Network"
3. Enter these details:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```

### 2. Import Test Account
1. Copy a private key from Hardhat node output
2. MetaMask → Import Account → Paste private key
3. You should see 10,000 ETH balance

### 3. Add SolarToken to MetaMask
1. MetaMask → Import tokens
2. Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
3. Token Symbol: `ST`
4. Decimals: `18`

---

## 🧪 Testing the System

### 1. Frontend Testing
1. Open http://localhost:3000
2. Connect MetaMask wallet
3. Check energy dashboard
4. Try P2P trading features

### 2. API Testing
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test blockchain connection
curl http://localhost:5000/api/blockchain/stats
```

### 3. Smart Contract Testing
```bash
cd smart-contracts
npx hardhat test
```

---

## 📦 Project Scripts

Create these in the root `package.json`:

```json
{
  "scripts": {
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install && cd ../smart-contracts && npm install && cd ../ai-services && pip install -r requirements.txt",
    "dev:all": "concurrently \"npm run blockchain\" \"npm run backend\" \"npm run frontend\" \"npm run ai\"",
    "blockchain": "cd smart-contracts && npx hardhat node",
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm start",
    "ai": "cd ai-services && python src/api/ml_api.py",
    "deploy": "cd smart-contracts && npx hardhat run scripts/deploy.js --network localhost",
    "test:all": "npm run test:contracts && npm run test:backend && npm run test:frontend",
    "test:contracts": "cd smart-contracts && npx hardhat test",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test"
  }
}
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on specific ports
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

#### 2. MetaMask Connection Issues
- Make sure you're on the Hardhat Local network
- Try resetting MetaMask account (Settings → Advanced → Reset Account)
- Check that Hardhat node is running

#### 3. Smart Contract Not Found
- Ensure contracts are deployed: `npm run deploy`
- Check contract addresses in environment variables
- Verify Hardhat node is running

#### 4. Database Connection Error
- Start MongoDB service
- Check connection string in `.env`
- Ensure database permissions

### Reset Everything
```bash
# Stop all processes (Ctrl+C in all terminals)
# Reset Hardhat
cd smart-contracts
npx hardhat clean

# Clear node_modules (if needed)
rm -rf node_modules frontend/node_modules backend/node_modules smart-contracts/node_modules

# Reinstall everything
npm run install:all
```

---

## 🎯 Demo Workflow

### 1. Basic Demo Flow
1. **Start System**: `npm run dev:all`
2. **Connect Wallet**: Open frontend, connect MetaMask
3. **Check Dashboard**: View energy statistics
4. **List Energy**: Create energy listing for sale
5. **Purchase Energy**: Buy energy from another user
6. **View History**: Check transaction history

### 2. BCOLBD Demo Scenario
```bash
# 1. Start the system
npm run dev:all

# 2. Open browser to http://localhost:3000
# 3. Connect MetaMask (use Hardhat account)
# 4. Navigate through the app:
#    - Dashboard: View energy stats
#    - Trading: List/buy energy
#    - Profile: User information
```

---

## 📱 Mobile App (Optional)

```bash
cd mobile-app

# Install dependencies
npm install

# For iOS (requires Xcode)
npx react-native run-ios

# For Android (requires Android Studio)
npx react-native run-android
```

---

## 🏗️ Production Deployment

### Environment Setup
```bash
# Build frontend
cd frontend
npm run build

# Setup production environment
export NODE_ENV=production
export MONGODB_URI=your_production_mongodb_uri
export SOLAR_TOKEN_ADDRESS=your_deployed_contract_address
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

---

## 📞 Support

### Quick Help
- **Frontend Issues**: Check browser console and MetaMask
- **Backend Issues**: Check terminal logs and MongoDB connection
- **Blockchain Issues**: Ensure Hardhat node is running and contracts deployed

### Team Contact
**Team GreyDevs - BCOLBD 2025**
- Team ID: 68923e7908f3d
- For technical support: Check logs first, then contact team

---

## 🎉 Success!

If everything is working, you should see:
- ✅ Frontend loading at http://localhost:3000
- ✅ MetaMask connected to local network
- ✅ SolarTokens visible in wallet
- ✅ Energy trading functionality working
- ✅ Real-time updates in dashboard

**You're ready to demo SolChain! 🌟**
