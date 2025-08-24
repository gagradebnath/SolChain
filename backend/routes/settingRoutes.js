const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const USER_PROFILE = {
  name: 'John Doe',
  address: '123 Smart Grid St, EcoCity',
  meterId: 'EM-4573-A8',
  walletAddress: '0x1234ef67',
};

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
  console.log("Authenticated user for Settings Screen:", user);

  res.json({
    success: true,
    userProfile: USER_PROFILE,
  });

});

module.exports = router;