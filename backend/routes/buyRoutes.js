const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Dummy data for energy sellers
const DUMMY_SELLERS = [
  {
    id: '1',
    name: 'Peer-to-Peer Seller A',
    rate: '0.25',
    availableUnits: '15 kWh',
    trustScore: '95%',
    type: 'peer',
  },
  {
    id: '2',
    name: 'The Grid',
    rate: '0.30',
    availableUnits: '∞ kWh',
    trustScore: '100%',
    type: 'grid',
  },
  {
    id: '3',
    name: 'Peer-to-Peer Seller C',
    rate: '0.26',
    availableUnits: '8 kWh',
    trustScore: '88%',
    type: 'peer',
  },
  {
    id: '4',
    name: 'Peer-to-Peer Seller D',
    rate: '0.24',
    availableUnits: '12 kWh',
    trustScore: '92%',
    type: 'peer',
  },
  {
    id: '5',
    name: 'Peer-to-Peer Seller E',
    rate: '0.27',
    availableUnits: '6 kWh',
    trustScore: '91%',
    type: 'peer',
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
  console.log("Authenticated user for BuyScreen screen:", user);

  res.json({
    success: true,
    data: DUMMY_SELLERS,
  });

});

module.exports = router;
