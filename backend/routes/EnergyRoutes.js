const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const DUMMY_DATA = {
    realTimeMetrics: {
        production: 1.8, // kW
        consumption: 0.6, // kW
        gridFeedIn: 1.2, // kW (positive = selling, negative = buying)
        batteryCharge: 0.5, // kW (positive = charging, negative = discharging)
    },
    battery: {
        level: 85, // percentage
        status: 'Charging',
        health: 98, // percentage
        timeToFull: '1 hr 15 min',
    },
    grid: {
        status: 'Connected - Selling',
        voltage: 235.5, // V
        frequency: 50.1, // Hz
    },
    weather: {
        location: 'Dhaka',
        temperature: '33°C',
        condition: 'Sunny',
        solarIrradiance: 950, // W/m²
        prediction: 'High production expected until 4 PM.',
    },
    historical: {
        today: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8, 1.0], // Sample production data for 12 hours
        week: [25, 28, 22, 30, 27, 29, 31], // Daily production for a week
    },
    carbonFootprint: {
        savedToday: 2.5, // kg CO2
        totalSaved: 150.2, // kg CO2
        treesPlantedEquivalent: 7.5,
    },
    predictions: {
        nextHourProduction: '2.1 kWh',
        peakTime: '2:30 PM',
    }
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
  console.log("Authenticated user for energy screen:", user);

  res.json({
    success: true,
    data: DUMMY_DATA,
  });

});

module.exports = router;
