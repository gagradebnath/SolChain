const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// --- DUMMY DATA (from backend) ---
const DUMMY_STATS = {
    overview: {
        totalSavings: '12.50 SOL',
        energySaved: '55 kWh',
        carbonOffset: '25 kg CO2',
    },
    daily: {
        currentUsage: '2.5 kWh',
        solarGeneration: '4.8 kWh',
        netFlow: '+2.3 kWh (Exporting)',
    },
    trading: {
        totalTrades: 15,
        energyTraded: '32 kWh',
        p2pEarnings: '+7.20 SOL',
    },
    recentTransactions: [
        { id: '1', type: 'sell', amount: '1.2 kWh', value: '+0.25 SOL', peer: 'Aarav C.', date: 'Aug 21' },
        { id: '2', type: 'buy', amount: '0.8 kWh', value: '-0.18 SOL', peer: 'Bina A.', date: 'Aug 20' },
        { id: '3', type: 'sell', amount: '2.1 kWh', value: '+0.45 SOL', peer: 'Fahim H.', date: 'Aug 19' },
    ],
    // Dummy data for charts
    usageGenerationData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [4.5, 5.2, 4.8, 6.1, 5.5, 6.8, 7.5], // Usage in kWh
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                strokeWidth: 2,
            },
            {
                data: [3.2, 4.1, 4.9, 5.5, 4.8, 6.2, 7.1], // Generation in kWh
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ["Usage", "Generation"]
    },
    tradingBreakdownData: [
        { name: "Sold", population: 22, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 15 },
        { name: "Bought", population: 10, color: "#F44336", legendFontColor: "#7F7F7F", legendFontSize: 15 },
    ],
    savingsEarningsData: {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
            {
                data: [3.2, 4.5, 2.1, 2.7], // P2P Earnings in SOL
            },
        ],
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
  console.log("Authenticated user for Stat screen:", user);

  res.json({
    success: true,
    data: DUMMY_STATS,
  });

});

module.exports = router;
