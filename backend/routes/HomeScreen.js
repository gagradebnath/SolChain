const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

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
  console.log("Authenticated user for homescreen:", user);
  
  const data = {
    energyOverview: {
      production: "5.2 kWh",
      consumption: "3.1 kWh",
      savings: "৳15.75",
    },
    recentActivity: [
      { id: "1", type: "transaction", description: "Sold 0.5 kWh to Grid", timestamp: "10:30 AM", value: "+0.5 SOL" },
      { id: "2", type: "transaction", description: "Bought 0.2 kWh from User B", timestamp: "09:45 AM", value: "-0.2 SOL" },
      { id: "3", type: "notification", description: "System maintenance scheduled", timestamp: "08:00 AM", value: null },
    ],
    weather: {
      location: "Dhaka, Bangladesh",
      condition: "Partly Cloudy",
      temperature: "32°C",
      icon: "cloud",
    },
    marketPrices: {
      buy: "0.25 SOL/kWh",
      sell: "0.20 SOL/kWh",
    },
    goals: [
      { id: "1", title: "Reduce Consumption", target: "20%", progress: 65 },
      { id: "2", title: "Earn SOL", target: "100 SOL", progress: 40 },
    ],
  };

  res.json(data);
});

module.exports = router;
