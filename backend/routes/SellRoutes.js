const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Dummy data for market demand
const DUMMY_DEMAND = {
  currentDemand: "250 kWh",
  activeBuyers: 12,
};

// Helper: read JSON file
function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

// Helper: write JSON file
function saveJsonData(filename, data) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// JWT authentication middleware
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

// GET sell info
router.get("/", authenticateToken, (req, res) => {
  const user = req.user;
  console.log("Authenticated user for Sell Screen:", user);

  const realtimeArr = getJsonData('realtime.json');
  const marketArr = getJsonData('market.json'); // get market rate
  const usersArr = getJsonData('users.json');
  const userIndex = usersArr.findIndex(u => u.id === user.id);
  const realtimeIndex = realtimeArr.findIndex(r => r.userId === user.id);
  if (realtimeIndex === -1) {
    return res.status(404).json({ success: false, error: "User real-time data not found" });
  }

  const marketRate = marketArr.length > 0 ? marketArr[0].sell : 0;

  res.json({
    success: true,
    demand: DUMMY_DEMAND,
    available: realtimeArr[realtimeIndex].available,
    onMarket: realtimeArr[realtimeIndex].onMarket || 0,
    marketRate,
    isBuying: usersArr[userIndex].buying || false,
  });
});

// POST energy to market
router.post("/onMarket", authenticateToken, (req, res) => {
  const user = req.user;
  const { amount, price } = req.body;

  const usersArr = getJsonData('users.json');
  const realtimeArr = getJsonData('realtime.json');

  const userIndex = usersArr.findIndex(u => u.id === user.id);
  const realtimeIndex = realtimeArr.findIndex(r => r.userId === user.id);

  if (userIndex === -1 || realtimeIndex === -1) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const available = realtimeArr[realtimeIndex].available;
  const currentOnMarket = realtimeArr[realtimeIndex].onMarket || 0;

  if (amount + currentOnMarket > available) {
    return res.status(400).json({
      success: false,
      message: `Cannot list ${amount} kWh. Available: ${available} kWh`,
    });
  }

  // Update onMarket
  realtimeArr[realtimeIndex].onMarket = currentOnMarket + amount;

  // Set buying = false in users.json
  usersArr[userIndex].buying = false;

  // Save changes
  saveJsonData('realtime.json', realtimeArr);
  saveJsonData('users.json', usersArr);

  res.json({
    success: true,
    message: "Energy listed for sale successfully!",
    data: {
      userId: user.id,
      onMarket: realtimeArr[realtimeIndex].onMarket,
      available: realtimeArr[realtimeIndex].available,
      attempted: amount,
      price,
    },
  });
});

router.post("/mode", authenticateToken, (req, res) => {
  const { sellMode } = req.body;
  const usersArr = getJsonData('users.json');
  const userIndex = usersArr.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  usersArr[userIndex].buying = !sellMode; // true if buy mode, false if selling
  saveJsonData('users.json', usersArr);

  res.json({ success: true, message: `Mode updated: ${sellMode ? "Selling" : "Buying"}` });
});


module.exports = router;
