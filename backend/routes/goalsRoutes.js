const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const GOALS = [
    { id: '1', title: 'Monthly Savings Target', current: 150, target: 200, unit: 'SOL', color: '#4CAF50' },
    { id: '2', title: 'Weekly Earnings Target', current: 80, target: 100, unit: 'SOL', color: '#007AFF' },
    { id: '3', title: 'Carbon Offset Goal', current: 75, target: 100, unit: 'CC', color: '#9E9D24' },
];

const BADGES = [
    { id: '1', name: 'Green Contributor', description: 'Offset 100 kg of carbon.', icon: 'gift' },
    { id: '2', name: 'Top Seller', description: 'Sold over 500 kWh of energy.', icon: 'award' },
    { id: '3', name: 'First Trade', description: 'Completed your first peer-to-peer trade.', icon: 'zap' },
];

const LEADERBOARD = [
    { id: '1', name: 'You', rank: 1, points: 520, isUser: true },
    { id: '2', name: 'Aarav Chowdhury', rank: 2, points: 480 },
    { id: '3', name: 'Bina Akter', rank: 3, points: 455 },
    { id: '4', name: 'Fahim Hasan', rank: 4, points: 410 },
    { id: '5', name: 'Rahim Khan', rank: 5, points: 390 },
];


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
  console.log("Authenticated user for NotificationScreen:", user);

  res.json({
    success: true,
    goals: GOALS,
    badges: BADGES,
    leaderboard: LEADERBOARD,
  });

});

module.exports = router;