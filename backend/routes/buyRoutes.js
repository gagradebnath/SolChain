const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const blockchainService = require("../services/BlockchainService");


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
    console.log("Fetching active energy offers for user:", user.id);

    // Get active offers from blockchain
    const offersResult = await blockchainService.getActiveOffers(0, 20);
    
    if (offersResult.success) {
      res.json({
        success: true,
        data: offersResult.data,
      });
    } else {
      console.error("❌ Failed to fetch offers:", offersResult.error);
      // Fallback to empty array if blockchain is not available
      res.json({
        success: true,
        data: [],
        message: "No active offers available"
      });
    }
  } catch (error) {
    console.error("❌ Buy route error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch energy offers"
    });
  }
});

// Create buy offer endpoint
router.post("/offer", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { energyAmount, pricePerKwh, duration, location, energySource } = req.body;

    if (!energyAmount || !pricePerKwh) {
      return res.status(400).json({
        success: false,
        error: "energyAmount and pricePerKwh are required"
      });
    }

    console.log(`Creating buy offer for user ${user.id}: ${energyAmount} kWh at ${pricePerKwh} ST/kWh`);

    const offerResult = await blockchainService.createBuyOffer(user.id.toString(), {
      energyAmount,
      pricePerKwh,
      duration: duration || 24,
      location: location || "Grid-Zone-A",
      energySource: energySource || "Any"
    });
    
    if (offerResult.success) {
      res.json({
        success: true,
        offer: offerResult.data,
        message: "Buy offer created successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to create buy offer: " + offerResult.error
      });
    }
  } catch (error) {
    console.error("❌ Create buy offer error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Accept offer endpoint
router.post("/accept", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { offerId, energyAmount } = req.body;

    if (!offerId || !energyAmount) {
      return res.status(400).json({
        success: false,
        error: "offerId and energyAmount are required"
      });
    }

    console.log(`User ${user.id} accepting offer ${offerId} for ${energyAmount} kWh`);

    const acceptResult = await blockchainService.acceptOffer(
      user.id.toString(),
      offerId,
      energyAmount
    );
    
    if (acceptResult.success) {
      res.json({
        success: true,
        transaction: acceptResult.data,
        message: "Offer accepted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to accept offer: " + acceptResult.error
      });
    }
  } catch (error) {
    console.error("❌ Accept offer error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
