
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons/', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

router.get("/", authenticateToken, (req, res) => {
  const user = req.user;

  const users = getJsonData('users.json');
  const energyData = getJsonData('energydata.json');
  const marketData = getJsonData('market.json');
  const transactions = getJsonData('transactions.json');

  const currentUser = users.find(u => u.id === user.id);
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  // Energy Overview
  const todayEnergy = energyData.find(e => e.userId === user.id) || {};
  const energyOverview = {
    production: todayEnergy.production ? `${todayEnergy.production} ${todayEnergy.unit}` : "0 kWh",
    consumption: todayEnergy.consumption ? `${todayEnergy.consumption} ${todayEnergy.unit}` : "0 kWh",
    savings: todayEnergy.savings ? `৳${todayEnergy.savings}` : "৳0",
  };

  // Recent Activity (transactions + system notifications)
  const userTransactions = transactions
    .filter(tx => tx.from === user.id || tx.to === user.id)
    .map(tx => ({
      id: tx.id,
      type: "transaction",
      description: tx.from === user.id
        ? `Sold ${tx.amount} ${tx.unit} to ${tx.to}`
        : `Bought ${tx.amount} ${tx.unit} from ${tx.from}`,
      timestamp: new Date(tx.timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
      value: tx.from === user.id ? `+${tx.tokenValue} SOL` : `-${tx.tokenValue} SOL`
    }));

  const recentActivity = [
    ...userTransactions,
    { id: "notif1", type: "notification", description: "System maintenance scheduled", timestamp: "08:00 AM", value: null }
  ];

  // Goals
  const goals = currentUser.goals || [];

  // Market Prices (latest)
  const latestMarket = marketData[marketData.length - 1] || {};
  const marketPrices = {
    buy: latestMarket.buy ? `${latestMarket.buy} ${latestMarket.unit}` : "0 SOL/kWh",
    sell: latestMarket.sell ? `${latestMarket.sell} ${latestMarket.unit}` : "0 SOL/kWh",
  };

  const data = {
    energyOverview,
    recentActivity,
    weather: { location: "Dhaka, Bangladesh", condition: "Partly Cloudy", temperature: "32°C", icon: "cloud" },
    marketPrices,
    goals,
  };

  res.json(data);
});

module.exports = router;
