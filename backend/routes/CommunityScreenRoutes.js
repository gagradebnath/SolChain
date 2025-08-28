
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dummysecret");
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Haversine formula to calculate distance between two coordinates in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

router.get("/", authenticateToken, (req, res) => {
  const usersArr = getJsonData("users.json");
  const transactionsArr = getJsonData("transactions.json");

  const myUserId = req.user.id;
  const myUser = usersArr.find(u => u.id === myUserId);
  const MY_LOCATION = myUser ? { latitude: myUser.latitude, longitude: myUser.longitude } : { latitude: 23.8103, longitude: 90.4125 };

  const USERS = usersArr
    .filter(u => u.id !== myUserId)
    .map(u => {
      const distanceKm = getDistanceKm(MY_LOCATION.latitude, MY_LOCATION.longitude, u.latitude, u.longitude);
      return {
        id: u.id,
        name: u.username || u.name || "Unknown",
        distance: `${distanceKm.toFixed(2)} km away`,
        status: u.buying ? "Buying" : "Selling",
        rate: u.rate,
        trustScore: 80 + Math.floor(Math.random() * 20),
        avatar: `https://i.pravatar.cc/150?u=${u.id}`,
        coordinate: { latitude: u.latitude, longitude: u.longitude }
      };
    });

  const TRADE_HISTORY = {};
  usersArr.forEach(u => {
    const trades = transactionsArr
      .filter(tx => tx.from === u.id || tx.to === u.id)
      .map(tx => {
        const isSender = tx.from === u.id;
        return {
          id: tx.id,
          type: isSender ? "sell" : "buy",
          amount: `${tx.amount} ${tx.unit}`,
          value: isSender ? `+${tx.tokenValue} SOL` : `-${tx.tokenValue} SOL`,
          date: new Date(tx.timestamp).toISOString().split("T")[0]
        };
      });
    if (trades.length > 0) TRADE_HISTORY[u.id] = trades;
  });
  console.log("community data fetched by user: ", myUserId);
  res.json({
    success: true,
    users: USERS,
    tradeHistory: TRADE_HISTORY,
    myLocation: MY_LOCATION
  });
});

module.exports = router;
