const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// --- DUMMY DATA (from backend) ---
const DUMMY_NOTIFICATIONS = [
    {
        id: '1',
        title: 'New Trade Alert!',
        message: 'You have a new energy trade request from Aarav Chowdhury.',
        type: 'trade',
        timestamp: '2m ago',
        isRead: false,
    },
    {
        id: '2',
        title: 'Transaction Confirmed',
        message: 'Your sale of 2.5 kWh to Fahim H. was successful. +0.5 SOL added to your wallet.',
        type: 'transaction',
        timestamp: '15m ago',
        isRead: false,
    },
    {
        id: '3',
        title: 'Community News',
        message: 'A new policy on energy trading was just announced.',
        type: 'news',
        timestamp: '1h ago',
        isRead: false,
    },
    {
        id: '4',
        title: 'Network Update',
        message: 'Your solar generation data for August 2025 has been successfully synced.',
        type: 'update',
        timestamp: '3h ago',
        isRead: true,
    },
    {
        id: '5',
        title: 'Trade Completed',
        message: 'Your purchase of 1.2 kWh from Bina A. is now complete.',
        type: 'transaction',
        timestamp: '1d ago',
        isRead: true,
    },
    {
        id: '6',
        title: 'Welcome to SolChain!',
        message: 'Your account has been successfully created. Explore the app to get started.',
        type: 'info',
        timestamp: '2d ago',
        isRead: true,
    },
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
    data: DUMMY_NOTIFICATIONS,
  });

});

module.exports = router;