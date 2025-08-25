const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const blockchainService = require("../services/blockchainService");


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
    console.log("Fetching blockchain wallet for user:", user.id);

    // Get wallet data from blockchain
    const walletResult = await blockchainService.getUserWallet(user.id.toString());
    
    if (walletResult.success) {
      res.json({
        success: true,
        transactions: walletResult.data.transactions,
        balance: walletResult.data.balance,
        address: walletResult.data.address
      });
    } else {
      console.error("❌ Failed to fetch wallet data:", walletResult.error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch wallet data: " + walletResult.error
      });
    }
  } catch (error) {
    console.error("❌ Wallet route error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Create wallet endpoint
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    console.log("Creating blockchain wallet for user:", user.id);

    const walletResult = await blockchainService.createUserWallet(user.id.toString());
    
    if (walletResult.success) {
      res.json({
        success: true,
        wallet: walletResult.data,
        message: "Wallet created successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create wallet: " + walletResult.error
      });
    }
  } catch (error) {
    console.error("❌ Wallet creation error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Transfer tokens endpoint
router.post("/transfer", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { toAddress, amount } = req.body;

    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "toAddress and amount are required"
      });
    }

    console.log(`Transferring ${amount} ST from user ${user.id} to ${toAddress}`);

    const transferResult = await blockchainService.transferTokens(
      user.id.toString(),
      toAddress,
      amount
    );
    
    if (transferResult.success) {
      res.json({
        success: true,
        transaction: transferResult.data,
        message: `Successfully transferred ${amount} ST`
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Transfer failed: " + transferResult.error
      });
    }
  } catch (error) {
    console.error("❌ Transfer error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
