const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const USER_PROFILE = {
  name: 'John Doe',
  address: '123 Smart Grid St, EcoCity',
  meterId: 'EM-4573-A8',
  walletAddress: '0x1234ef67',
};

function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log("Authenticated user for Settings Screen:", userId);
  const users = getJsonData("users.json");
  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) return res.status(404).json({ error: "User not found" });
  const name = currentUser.username;
  const address = currentUser.address;
  const meterId = currentUser.meterId;
  const walletAddress = currentUser.walletId;
  res.json({
    success: true,
    userProfile: {
      name,
      address,
      meterId,
      walletAddress,
    }
  });

});

module.exports = router;