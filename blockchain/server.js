const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

// Import contract ABIs
const SolarTokenABI = require('./artifacts/contracts/SolarToken.sol/SolarToken.json');
const EnergyTradingABI = require('./artifacts/contracts/EnergyTrading.sol/EnergyTrading.json');
const GovernanceABI = require('./artifacts/contracts/Governance.sol/SolChainGovernance.json');
const StakingABI = require('./artifacts/contracts/Staking.sol/Staking.json');
const OracleABI = require('./artifacts/contracts/Oracle.sol/SolChainOracle.json');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Blockchain connection
let provider;
let signer;
let contracts = {};

// Initialize blockchain connection
async function initializeBlockchain() {
    try {
        // Connect to local Hardhat network or specified RPC
        const rpcUrl = process.env.NETWORK === 'localhost' 
            ? 'http://127.0.0.1:8545' 
            : process.env.RPC_URL;
            
        provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Set up signer
        if (process.env.PRIVATE_KEY) {
            signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        } else {
            // Use first account from local node
            const accounts = await provider.listAccounts();
            signer = await provider.getSigner(accounts[0]);
        }

        console.log('✅ Connected to blockchain network');
        console.log('📊 Signer address:', await signer.getAddress());
        
        // Load deployed contracts (you'll need to update these addresses after deployment)
        // For now, we'll initialize without contract addresses
        
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to blockchain:', error.message);
        console.log('🔄 Running in simulation mode...');
        return false;
    }
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SolChain Blockchain Backend is running',
        timestamp: new Date().toISOString(),
        network: process.env.NETWORK || 'localhost',
        signerAddress: signer ? signer.address : 'Not connected'
    });
});

// Get blockchain info
app.get('/api/blockchain/info', async (req, res) => {
    try {
        if (!provider) {
            return res.status(500).json({ error: 'Blockchain not connected' });
        }

        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        const gasPrice = await provider.getFeeData();

        res.json({
            network: {
                name: network.name,
                chainId: Number(network.chainId)
            },
            blockNumber,
            gasPrice: gasPrice.gasPrice?.toString(),
            maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deploy contracts endpoint
app.post('/api/deploy', async (req, res) => {
    try {
        if (!signer) {
            return res.status(500).json({ error: 'Signer not available' });
        }

        // This will deploy contracts using the deployment script
        const { exec } = require('child_process');
        
        exec('npx hardhat run scripts/deploy.js --network localhost', (error, stdout, stderr) => {
            if (error) {
                console.error('Deployment error:', error);
                return res.status(500).json({ error: 'Deployment failed', details: error.message });
            }
            
            console.log('Deployment output:', stdout);
            res.json({ 
                message: 'Deployment initiated', 
                output: stdout,
                timestamp: new Date().toISOString()
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Token operations
app.get('/api/tokens/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!contracts.solarToken) {
            return res.status(400).json({ error: 'SolarToken contract not loaded' });
        }

        const balance = await contracts.solarToken.balanceOf(address);
        res.json({ 
            address,
            balance: ethers.formatUnits(balance, 18),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Energy trading operations
app.post('/api/trading/create-offer', async (req, res) => {
    try {
        const { energyAmount, pricePerKWh } = req.body;
        
        if (!contracts.energyTrading) {
            return res.status(400).json({ error: 'EnergyTrading contract not loaded' });
        }

        // Convert to appropriate units
        const energyAmountWei = ethers.parseUnits(energyAmount.toString(), 18);
        const priceWei = ethers.parseUnits(pricePerKWh.toString(), 18);

        const tx = await contracts.energyTrading.createEnergyOffer(energyAmountWei, priceWei);
        await tx.wait();

        res.json({
            message: 'Energy offer created successfully',
            transactionHash: tx.hash,
            energyAmount,
            pricePerKWh,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get trading offers
app.get('/api/trading/offers', async (req, res) => {
    try {
        if (!contracts.energyTrading) {
            return res.status(400).json({ error: 'EnergyTrading contract not loaded' });
        }

        // This would need to be implemented based on your contract's event system
        // For now, return a placeholder
        res.json({
            offers: [],
            message: 'Offer retrieval not yet implemented',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
async function startServer() {
    const blockchainConnected = await initializeBlockchain();
    
    app.listen(PORT, () => {
        console.log(`🚀 SolChain Blockchain Backend running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 Blockchain API: http://localhost:${PORT}/api/blockchain/info`);
        
        if (blockchainConnected) {
            console.log('✅ Blockchain connection established');
        } else {
            console.log('⚠️  Running without blockchain connection');
        }
    });
}

startServer();

module.exports = app;
