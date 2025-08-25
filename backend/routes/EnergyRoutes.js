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

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    console.log("Fetching energy data for user:", user.id);

    // Get current energy price from blockchain oracle
    const priceResult = await blockchainService.getCurrentEnergyPrice();
    const currentPrice = priceResult.success ? priceResult.data.price : "0.25";

    // Combine real blockchain data with mock sensor data
    const energyData = {
      ...DUMMY_DATA,
      blockchain: {
        currentEnergyPrice: currentPrice,
        userAddress: blockchainService.getUserAddress(user.id.toString()),
        isConnected: blockchainService.isInitialized
      }
    };

    res.json({
      success: true,
      data: energyData,
    });
  } catch (error) {
    console.error("❌ Energy route error:", error.message);
    res.json({
      success: true,
      data: DUMMY_DATA, // Fallback to dummy data
    });
  }
});

// Record energy production endpoint
router.post("/production", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { energyProduced, timestamp } = req.body;

    if (!energyProduced) {
      return res.status(400).json({
        success: false,
        error: "energyProduced is required"
      });
    }

    console.log(`Recording energy production for user ${user.id}: ${energyProduced} kWh`);

    // Mint tokens for energy production
    const mintResult = await blockchainService.mintTokensForProduction(
      user.id.toString(),
      energyProduced.toString()
    );
    
    if (mintResult.success) {
      res.json({
        success: true,
        transaction: mintResult.data,
        message: `Successfully recorded ${energyProduced} kWh production and minted ${energyProduced} ST`
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to record production: " + mintResult.error
      });
    }
  } catch (error) {
    console.error("❌ Production recording error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Create sell offer endpoint
router.post("/sell", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { energyAmount, pricePerKwh, duration, location, energySource } = req.body;

    if (!energyAmount || !pricePerKwh) {
      return res.status(400).json({
        success: false,
        error: "energyAmount and pricePerKwh are required"
      });
    }

    console.log(`Creating sell offer for user ${user.id}: ${energyAmount} kWh at ${pricePerKwh} ST/kWh`);

    const offerResult = await blockchainService.createSellOffer(user.id.toString(), {
      energyAmount,
      pricePerKwh,
      duration: duration || 24,
      location: location || "Grid-Zone-A",
      energySource: energySource || "Solar"
    });
    
    if (offerResult.success) {
      res.json({
        success: true,
        offer: offerResult.data,
        message: "Sell offer created successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to create sell offer: " + offerResult.error
      });
    }
  } catch (error) {
    console.error("❌ Create sell offer error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Create sell energy offer endpoint
router.post("/sell", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { energyAmount, pricePerKwh, duration, location, energySource } = req.body;

    console.log(`Creating sell offer for user ${user.id}:`, {
      energyAmount,
      pricePerKwh,
      duration,
      location,
      energySource
    });

    // Validate input
    if (!energyAmount || !pricePerKwh) {
      return res.status(400).json({
        success: false,
        error: "Energy amount and price per kWh are required"
      });
    }

    // Create sell offer on blockchain
    const offerResult = await blockchainService.createSellOffer(user.id.toString(), {
      energyAmount: energyAmount.toString(),
      pricePerKwh: pricePerKwh.toString(),
      duration: duration || 24,
      location: location || "Grid-Zone-A",
      energySource: energySource || "Solar"
    });

    if (offerResult.success) {
      res.json({
        success: true,
        data: {
          message: "Energy offer created successfully",
          transactionHash: offerResult.data.transactionHash,
          blockNumber: offerResult.data.blockNumber,
          energyAmount,
          pricePerKwh,
          location: location || "Grid-Zone-A",
          energySource: energySource || "Solar"
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create sell offer: " + offerResult.error
      });
    }
  } catch (error) {
    console.error("❌ Sell energy error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get system statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching system statistics from blockchain");

    const statsResult = await blockchainService.getSystemStats();
    
    if (statsResult.success) {
      res.json({
        success: true,
        data: statsResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch stats: " + statsResult.error
      });
    }
  } catch (error) {
    console.error("❌ Stats error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
