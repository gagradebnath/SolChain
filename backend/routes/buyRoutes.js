const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Helper to read JSON files
function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
function saveJsonData(filename, data) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
// Authenticate JWT token
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
  const usersArr = getJsonData('users.json');       // All users
  const realtimeArr = getJsonData('realtime.json'); // Real-time available energy

  const sellers = usersArr
  .filter(u => !u.buying && u.id !== req.user.id) // selling users
  .map(u => {
    const realtime = realtimeArr.find(r => r.userId === u.id);
    const availableUnits = realtime?.available || 0;
    const attemptedOnMarket = realtime?.onMarket || 0;
    const onMarket = attemptedOnMarket > availableUnits ? availableUnits : attemptedOnMarket;

    return {
      id: u.id,
      name: u.username,
      rate: u.rate,
      availableUnits: `${availableUnits} kWh`,
      trustScore: '90%',
      type: 'peer',
      onMarket: `${onMarket} kWh (attempted ${attemptedOnMarket} kWh)`,
      coordinate: { latitude: u.latitude, longitude: u.longitude }
    };
  });


  res.json({
    success: true,
    data: sellers,
  });
});

router.post("/buyNow", authenticateToken, (req, res) => {
  const buyer = req.user;
  const { sellerId, amount, rate } = req.body;

  if (!sellerId || !amount || amount <= 0 || !rate || rate <= 0) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  const usersArr = getJsonData('users.json');
  const realtimeArr = getJsonData('realtime.json');
  const walletsArr = getJsonData('wallets.json');
  const transactionsArr = getJsonData('transactions.json');

  const sellerIndex = usersArr.findIndex(u => u.id === sellerId);
  const sellerRealtimeIndex = realtimeArr.findIndex(r => r.userId === sellerId);
  const buyerWalletIndex = walletsArr.findIndex(w => w.userId === buyer.id);
  const sellerWalletIndex = walletsArr.findIndex(w => w.userId === sellerId);

  if (sellerIndex === -1 || sellerRealtimeIndex === -1 || buyerWalletIndex === -1 || sellerWalletIndex === -1) {
    return res.status(404).json({ success: false, error: "Buyer or seller not found" });
  }

  const available = realtimeArr[sellerRealtimeIndex].available || 0;
  if (amount > available) {
    return res.status(400).json({
      success: false,
      error: `Cannot buy ${amount} kWh. Seller has only ${available} kWh available.`,
    });
  }

  // Reduce seller's available energy
  realtimeArr[sellerRealtimeIndex].available = +(available - amount).toFixed(3);
  // update buyer's available energy
  realtimeArr[buyerWalletIndex].available = +(realtimeArr[buyerWalletIndex].available + amount).toFixed(3);

  // Reduce onMarket if needed
  const onMarket = realtimeArr[sellerRealtimeIndex].onMarket || 0;
  realtimeArr[sellerRealtimeIndex].onMarket = +(Math.max(onMarket - amount, 0)).toFixed(3);

  // Update wallets
  const totalCost = +(amount * rate).toFixed(3);
  walletsArr[buyerWalletIndex].balance = +(walletsArr[buyerWalletIndex].balance - totalCost).toFixed(3);
  walletsArr[buyerWalletIndex].energyCredits = +(walletsArr[buyerWalletIndex].energyCredits + amount).toFixed(3);

  walletsArr[sellerWalletIndex].balance = +(walletsArr[sellerWalletIndex].balance + totalCost).toFixed(3);
  walletsArr[sellerWalletIndex].energyCredits = +(walletsArr[sellerWalletIndex].energyCredits - amount).toFixed(3);

  // Generate unique transaction ID
  let maxId = transactionsArr
    .map(t => parseInt(t.id.replace(/^tx/, '')))
    .reduce((acc, val) => Math.max(acc, val), 0);
  const newTxId = `tx${maxId + 1}`;

  const newTx = {
    id: newTxId,
    from: sellerId,
    to: buyer.id,
    amount: +amount,
    unit: "kWh",
    tokenValue: totalCost,
    timestamp: new Date().toISOString(),
    type: "sell",
  };

  transactionsArr.push(newTx);

  saveJsonData('realtime.json', realtimeArr);
  saveJsonData('wallets.json', walletsArr);
  saveJsonData('transactions.json', transactionsArr);

  res.json({
    success: true,
    message: `Successfully purchased ${amount} kWh from user ${sellerId}`,
    transaction: newTx,
    sellerAvailable: realtimeArr[sellerRealtimeIndex].available,
    sellerOnMarket: realtimeArr[sellerRealtimeIndex].onMarket,
    buyerWallet: walletsArr[buyerWalletIndex],
    sellerWallet: walletsArr[sellerWalletIndex],
  });
});

module.exports = router;