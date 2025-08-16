/**
 * SolChain API Usage Examples
 * 
 * This file demonstrates how to use the SolChain API for various operations.
 * Copy and modify these examples for your backend integration.
 */

const SolChainAPI = require('./solchain-api');

// Example: Initialize the API
async function initializeAPI() {
    const config = {
        rpcUrl: "http://127.0.0.1:8545", // Local Hardhat node
        chainId: 1337,
        privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat account #0
        contractAddresses: {
            SolarToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            EnergyTrading: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
            Oracle: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            Staking: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            Governance: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        }
    };

    const api = new SolChainAPI(config);
    await api.initializeContracts(config.contractAddresses);
    
    console.log("✅ SolChain API initialized successfully");
    return api;
}

// Example: Token Operations
async function tokenOperations() {
    const api = await initializeAPI();
    
    try {
        // Get token information
        const tokenInfo = await api.getTokenInfo();
        console.log("📄 Token Info:", tokenInfo);

        // Get balance
        const balance = await api.getTokenBalance("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        console.log("💰 Token Balance:", balance);

        // Transfer tokens
        const transfer = await api.transferTokens(
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // to address
            "100" // amount in ST
        );
        console.log("🔄 Transfer Result:", transfer);

        // Approve tokens
        const approval = await api.approveTokens(
            "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", // EnergyTrading contract
            "1000" // amount
        );
        console.log("✅ Approval Result:", approval);

    } catch (error) {
        console.error("❌ Token operations failed:", error);
    }
}

// Example: Energy Trading Operations
async function energyTradingOperations() {
    const api = await initializeAPI();
    
    try {
        // Create a sell offer
        const sellOffer = await api.createSellOffer(
            "50", // 50 kWh
            "8", // 8 ST per kWh
            new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            "Dhaka Solar Farm", // location
            "Solar" // energy source
        );
        console.log("🔋 Sell Offer Created:", sellOffer);

        // Create a buy offer
        const buyOffer = await api.createBuyOffer(
            "30", // 30 kWh
            "9", // 9 ST per kWh
            new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
            "Residential Area", // location
            "Any" // energy source
        );
        console.log("⚡ Buy Offer Created:", buyOffer);

        // Get active offers
        const activeOffers = await api.getActiveOffers(0, 5);
        console.log("📋 Active Offers:", activeOffers);

        // Get trading statistics
        const tradingStats = await api.getTradingStats();
        console.log("📊 Trading Stats:", tradingStats);

    } catch (error) {
        console.error("❌ Energy trading operations failed:", error);
    }
}

// Example: Oracle Operations
async function oracleOperations() {
    const api = await initializeAPI();
    
    try {
        // Get current energy price
        const energyPrice = await api.getEnergyPrice();
        console.log("💲 Current Energy Price:", energyPrice);

        // Update energy price (requires data feed role)
        const priceUpdate = await api.updateEnergyPrice("0.009", 95);
        console.log("📈 Price Update:", priceUpdate);

        // Get grid status
        const gridStatus = await api.getGridStatus("Dhaka");
        console.log("🔌 Grid Status:", gridStatus);

        // Update grid status (requires data feed role)
        const gridUpdate = await api.updateGridStatus(
            "Chittagong", // region
            true, // is online
            "2000", // capacity in kWh
            "1500" // current load in kWh
        );
        console.log("🔌 Grid Update:", gridUpdate);

    } catch (error) {
        console.error("❌ Oracle operations failed:", error);
    }
}

// Example: Staking Operations
async function stakingOperations() {
    const api = await initializeAPI();
    
    try {
        // Stake tokens
        const stake = await api.stakeTokens("1000");
        console.log("🥩 Staking Result:", stake);

        // Get validator info
        const validatorInfo = await api.getValidatorInfo("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        console.log("👤 Validator Info:", validatorInfo);

        // Get staking statistics
        const stakingStats = await api.getStakingStats();
        console.log("📊 Staking Stats:", stakingStats);

        // Get active validators
        const activeValidators = await api.getActiveValidators();
        console.log("👥 Active Validators:", activeValidators);

        // Claim rewards
        const claimRewards = await api.claimRewards();
        console.log("💰 Claim Rewards:", claimRewards);

    } catch (error) {
        console.error("❌ Staking operations failed:", error);
    }
}

// Example: Account Overview
async function getAccountOverview() {
    const api = await initializeAPI();
    
    try {
        const overview = await api.getAccountOverview("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        console.log("👤 Account Overview:", JSON.stringify(overview, null, 2));

    } catch (error) {
        console.error("❌ Account overview failed:", error);
    }
}

// Example: System Overview
async function getSystemOverview() {
    const api = await initializeAPI();
    
    try {
        const overview = await api.getSystemOverview();
        console.log("🏛️ System Overview:", JSON.stringify(overview, null, 2));

    } catch (error) {
        console.error("❌ System overview failed:", error);
    }
}

// Example: Event Listening
async function startEventListening() {
    const api = await initializeAPI();
    
    const eventHandlers = {
        tokenTransfer: (from, to, amount) => {
            console.log(`🔄 Token Transfer: ${from} → ${to} (${amount} ST)`);
        },
        offerCreated: (offerId, creator, offerType, energyAmount, price) => {
            console.log(`🔋 Offer Created: ID ${offerId} by ${creator}`);
        },
        tradeExecuted: (tradeId, buyer, seller, amount, price) => {
            console.log(`⚡ Trade Executed: ${buyer} ↔ ${seller} (${amount} kWh)`);
        },
        priceUpdated: (newPrice, confidence, timestamp) => {
            console.log(`💲 Price Updated: ${newPrice} (${confidence}% confidence)`);
        },
        tokenStaked: (validator, amount) => {
            console.log(`🥩 Tokens Staked: ${validator} staked ${amount} ST`);
        }
    };

    const result = api.startEventListening(eventHandlers);
    console.log("👂 Event Listening:", result);
    
    // Stop listening after 60 seconds for demo
    setTimeout(() => {
        api.stopEventListening();
        console.log("🔇 Event listening stopped");
    }, 60000);
}

// Express.js Backend Integration Example
function createExpressRoutes(app) {
    const api = new SolChainAPI({
        rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
        privateKey: process.env.PRIVATE_KEY
    });

    // Initialize contracts on startup
    app.get('/api/init', async (req, res) => {
        try {
            const addresses = req.body.contractAddresses;
            const result = await api.initializeContracts(addresses);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Token routes
    app.get('/api/token/balance/:address', async (req, res) => {
        try {
            const result = await api.getTokenBalance(req.params.address);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/token/transfer', async (req, res) => {
        try {
            const { to, amount } = req.body;
            const result = await api.transferTokens(to, amount);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Energy trading routes
    app.post('/api/trading/sell-offer', async (req, res) => {
        try {
            const { energyAmount, pricePerKwh, deadline, location, energySource } = req.body;
            const result = await api.createSellOffer(energyAmount, pricePerKwh, deadline, location, energySource);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/trading/buy-offer', async (req, res) => {
        try {
            const { energyAmount, pricePerKwh, deadline, location, energySource } = req.body;
            const result = await api.createBuyOffer(energyAmount, pricePerKwh, deadline, location, energySource);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/trading/offers', async (req, res) => {
        try {
            const { offset = 0, limit = 10 } = req.query;
            const result = await api.getActiveOffers(parseInt(offset), parseInt(limit));
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Oracle routes
    app.get('/api/oracle/price', async (req, res) => {
        try {
            const result = await api.getEnergyPrice();
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/oracle/grid/:region', async (req, res) => {
        try {
            const result = await api.getGridStatus(req.params.region);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Staking routes
    app.post('/api/staking/stake', async (req, res) => {
        try {
            const { amount } = req.body;
            const result = await api.stakeTokens(amount);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/staking/validator/:address', async (req, res) => {
        try {
            const result = await api.getValidatorInfo(req.params.address);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // System overview routes
    app.get('/api/account/:address', async (req, res) => {
        try {
            const result = await api.getAccountOverview(req.params.address);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/system/overview', async (req, res) => {
        try {
            const result = await api.getSystemOverview();
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    console.log("🚀 SolChain API routes registered");
}

// Export functions for use
module.exports = {
    initializeAPI,
    tokenOperations,
    energyTradingOperations,
    oracleOperations,
    stakingOperations,
    getAccountOverview,
    getSystemOverview,
    startEventListening,
    createExpressRoutes
};

// Run examples if called directly
if (require.main === module) {
    async function runExamples() {
        console.log("🧪 Running SolChain API Examples...\n");
        
        try {
            await tokenOperations();
            console.log("\n" + "=".repeat(50) + "\n");
            
            await energyTradingOperations();
            console.log("\n" + "=".repeat(50) + "\n");
            
            await oracleOperations();
            console.log("\n" + "=".repeat(50) + "\n");
            
            await stakingOperations();
            console.log("\n" + "=".repeat(50) + "\n");
            
            await getAccountOverview();
            console.log("\n" + "=".repeat(50) + "\n");
            
            await getSystemOverview();
            console.log("\n" + "=".repeat(50) + "\n");
            
            console.log("✅ All examples completed successfully!");
            
        } catch (error) {
            console.error("❌ Examples failed:", error);
        }
    }
    
    runExamples();
}
