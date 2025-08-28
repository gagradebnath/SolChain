
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
  const userId = req.user.id;

  const realtimeArr = getJsonData('realtime.json');
  const batteryArr = getJsonData('battery.json');
  const carbonArr = getJsonData('carbon.json');
  const predictionsArr = getJsonData('predictions.json');
  const gridArr = getJsonData('grid.json');        // global
  const weatherArr = getJsonData('weather.json');  // global
  const historicalArr = getJsonData('historical.json'); 

  const realTimeMetrics = realtimeArr.find(d => d.userId === userId);

  const battery = batteryArr.find(d => d.userId === userId);

  const carbonFootprint = carbonArr.find(d => d.userId === userId);

  const predictions = predictionsArr.find(d => d.userId === userId);

  const grid = gridArr[0];

  const weather = weatherArr.length > 0 ? weatherArr[0] : {
    location: 'Dhaka',
    temperature: '34°C',
    condition: 'Sunny',
    solarIrradiance: 950,
    prediction: 'High production expected until 4 PM.'
  };

  const historical = historicalArr.find(d => d.userId === userId) || {
    today: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8, 1.0],
    week: [25, 28, 22, 30, 27, 29, 31],
    month: [100, 120, 110, 130, 125, 115, 140]
  };
  console.log("Energy Data fetched by user: ", userId);
  res.json({
    success: true,
    data: {
      realTimeMetrics,
      battery,
      carbonFootprint,
      predictions,
      grid,
      weather,
      historical
    }
  });
});

module.exports = router;
