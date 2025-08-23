const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


// --- DUMMY DATA with Coordinates ---
const USERS = [
  { id: '1', name: 'Aarav Chowdhury', distance: '0.5 km away', status: 'Selling', rate: '0.22 SOL/kWh', trustScore: 95, avatar: 'https://i.pravatar.cc/150?u=aaron', coordinate: { latitude: 23.8153, longitude: 90.4105 } },
  { id: '2', name: 'Bina Akter', distance: '0.8 km away', status: 'Buying', rate: '0.24 SOL/kWh', trustScore: 88, avatar: 'https://i.pravatar.cc/150?u=bina', coordinate: { latitude: 23.8053, longitude: 90.4155 } },
  { id: '3', name: 'Fahim Hasan', distance: '1.2 km away', status: 'Selling', rate: '0.21 SOL/kWh', trustScore: 98, avatar: 'https://i.pravatar.cc/150?u=fahim', coordinate: { latitude: 23.8103, longitude: 90.4225 } },
];

const TRADE_HISTORY = {
  '1': [
    { id: 't1', type: 'buy', amount: '2.5 kWh', value: '-0.55 SOL', date: '2025-08-20' },
    { id: 't2', type: 'sell', amount: '5.0 kWh', value: '+1.10 SOL', date: '2025-08-18' },
  ],
  '3': [
    { id: 't3', type: 'sell', amount: '3.0 kWh', value: '+0.63 SOL', date: '2025-08-21' },
  ]
};

const MY_LOCATION = { latitude: 23.8103, longitude: 90.4125 };

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
  console.log("Authenticated user for community screen:", user);

  res.json({
    success: true,
    users: USERS,
    tradeHistory: TRADE_HISTORY,
    myLocation: MY_LOCATION,
  });

});

module.exports = router;
