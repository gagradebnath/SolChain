const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const blockchainService = require("../services/BlockchainService");

const DUMMY_DATA = {
    realTimeMetrics: {
        production: 1.8, // kW
        consumption: 0.6, // kW
        gridFeedIn: 1.2, // kW (positive = selling, negative = buying)
        batteryCharge: 0.5, // kW (positive = charging, negative = discharging)
    },
    battery: {
        level: 85, // percentage
        status: 'Charging',
        health: 98, // percentage
        timeToFull: '1 hr 15 min',
    },
    grid: {
        status: 'Connected - Selling',
        voltage: 235.5, // V
        frequency: 50.1, // Hz
    },
    weather: {
        location: 'Dhaka',
        temperature: '33°C',
        condition: 'Sunny',
        solarIrradiance: 950, // W/m²
        prediction: 'High production expected until 4 PM.',
    },
    historical: {
        today: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8, 1.0], // Sample production data for 12 hours
        week: [25, 28, 22, 30, 27, 29, 31], // Daily production for a week
    },
    carbonFootprint: {
        savedToday: 2.5, // kg CO2
        totalSaved: 150.2, // kg CO2
        treesPlantedEquivalent: 7.5,
    },
    predictions: {
        nextHourProduction: '2.1 kWh',
        peakTime: '2:30 PM',
    }
};


function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

router.get("/", authenticateToken, (req, res) => {
  const user = req.user;
  console.log("Authenticated user for energy screen:", user);

  res.json({
    success: true,
    data: DUMMY_DATA,
  });
});

// ========================================
// BLOCKCHAIN INTEGRATED ROUTES
// ========================================

// Create blockchain wallet for user
router.post("/wallet/create", authenticateToken, async (req, res) => {
  try {
    const result = await blockchainService.createUserWallet();
    
    if (result.success) {
      res.json({
        success: true,
        message: "Blockchain wallet created successfully",
        data: {
          address: result.data.address,
          // Don't send private key to frontend for security
          publicKey: result.data.address
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create wallet: " + error.message
    });
  }
});

// Get user's energy token balance
router.get("/balance/:walletAddress", authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await blockchainService.getUserBalance(walletAddress);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          balance: result.data.balance,
          balanceFormatted: result.data.formatted,
          walletAddress: walletAddress
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get balance: " + error.message
    });
  }
});

// Record energy production (mint tokens)
router.post("/production/record", authenticateToken, async (req, res) => {
  try {
    const { walletAddress, energyProduced } = req.body;
    
    if (!walletAddress || !energyProduced) {
      return res.status(400).json({
        success: false,
        error: "Wallet address and energy amount are required"
      });
    }

    const result = await blockchainService.mintTokensForEnergyProduction(
      walletAddress, 
      energyProduced, 
      "Solar Energy Production"
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: `Successfully recorded ${energyProduced} kWh production`,
        data: {
          txHash: result.data.txHash,
          tokensEarned: energyProduced,
          walletAddress: walletAddress
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to record production: " + error.message
    });
  }
});

// Create energy sell offer
router.post("/trading/sell", authenticateToken, async (req, res) => {
  try {
    const { sellerPrivateKey, energyAmount, pricePerKwh, expiryHours, location, energyType } = req.body;
    
    if (!sellerPrivateKey || !energyAmount || !pricePerKwh) {
      return res.status(400).json({
        success: false,
        error: "Seller private key, energy amount, and price are required"
      });
    }

    const result = await blockchainService.createSellOffer(
      sellerPrivateKey,
      energyAmount,
      pricePerKwh,
      expiryHours || 24,
      location || "Unknown",
      energyType || "Solar"
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: "Sell offer created successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create sell offer: " + error.message
    });
  }
});

// Create energy buy offer
router.post("/trading/buy", authenticateToken, async (req, res) => {
  try {
    const { buyerPrivateKey, energyAmount, pricePerKwh, expiryHours, location, energyType } = req.body;
    
    if (!buyerPrivateKey || !energyAmount || !pricePerKwh) {
      return res.status(400).json({
        success: false,
        error: "Buyer private key, energy amount, and price are required"
      });
    }

    const result = await blockchainService.createBuyOffer(
      buyerPrivateKey,
      energyAmount,
      pricePerKwh,
      expiryHours || 24,
      location || "Unknown",
      energyType || "Any"
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: "Buy offer created successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create buy offer: " + error.message
    });
  }
});

// Accept a trading offer
router.post("/trading/accept/:offerId", authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const { acceptorPrivateKey } = req.body;
    
    if (!acceptorPrivateKey) {
      return res.status(400).json({
        success: false,
        error: "Acceptor private key is required"
      });
    }

    const result = await blockchainService.acceptOffer(acceptorPrivateKey, parseInt(offerId));
    
    if (result.success) {
      res.json({
        success: true,
        message: "Offer accepted successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to accept offer: " + error.message
    });
  }
});

// Get all active trading offers
router.get("/trading/offers", authenticateToken, async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;
    
    const result = await blockchainService.getActiveOffers(parseInt(offset), parseInt(limit));
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get offers: " + error.message
    });
  }
});

// Get trading statistics
router.get("/trading/stats", authenticateToken, async (req, res) => {
  try {
    const result = await blockchainService.getTradingStats();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get trading stats: " + error.message
    });
  }
});

// Get account overview
router.get("/account/:walletAddress", authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const result = await blockchainService.getAccountOverview(walletAddress);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get account overview: " + error.message
    });
  }
});

// Get blockchain system status
router.get("/blockchain/status", authenticateToken, async (req, res) => {
  try {
    const result = await blockchainService.getSystemOverview();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        blockchainConnected: blockchainService.isReady()
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        blockchainConnected: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get blockchain status: " + error.message,
      blockchainConnected: false
    });
  }
});

module.exports = router;
