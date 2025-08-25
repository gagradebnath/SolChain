// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");

// // --- DUMMY DATA (from backend) ---
// const DUMMY_STATS = {
//     overview: {
//         totalSavings: '12.50 SOL',
//         energySaved: '55 kWh',
//         carbonOffset: '25 kg CO2',
//     },
//     daily: {
//         currentUsage: '2.5 kWh',
//         solarGeneration: '4.8 kWh',
//         netFlow: '+2.3 kWh (Exporting)',
//     },
//     trading: {
//         totalTrades: 15,
//         energyTraded: '32 kWh',
//         p2pEarnings: '+7.20 SOL',
//     },
//     recentTransactions: [
//         { id: '1', type: 'sell', amount: '1.2 kWh', value: '+0.25 SOL', peer: 'Aarav C.', date: 'Aug 21' },
//         { id: '2', type: 'buy', amount: '0.8 kWh', value: '-0.18 SOL', peer: 'Bina A.', date: 'Aug 20' },
//         { id: '3', type: 'sell', amount: '2.1 kWh', value: '+0.45 SOL', peer: 'Fahim H.', date: 'Aug 19' },
//     ],
//     // Dummy data for charts
//     usageGenerationData: {
//         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//         datasets: [
//             {
//                 data: [4.5, 5.2, 4.8, 6.1, 5.5, 6.8, 7.5], // Usage in kWh
//                 color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
//                 strokeWidth: 2,
//             },
//             {
//                 data: [3.2, 4.1, 4.9, 5.5, 4.8, 6.2, 7.1], // Generation in kWh
//                 color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
//                 strokeWidth: 2,
//             },
//         ],
//         legend: ["Usage", "Generation"]
//     },
//     tradingBreakdownData: [
//         { name: "Sold", population: 22, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 15 },
//         { name: "Bought", population: 10, color: "#F44336", legendFontColor: "#7F7F7F", legendFontSize: 15 },
//     ],
//     savingsEarningsData: {
//         labels: ["W1", "W2", "W3", "W4"],
//         datasets: [
//             {
//                 data: [3.2, 4.5, 2.1, 2.7], // P2P Earnings in SOL
//             },
//         ],
//     }
// };

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid token" });
//   }
// }

// router.get("/", authenticateToken, (req, res) => {
//   const user = req.user;
//   console.log("Authenticated user for Stat screen:", user);

//   res.json({
//     success: true,
//     data: DUMMY_STATS,
//   });

// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

function getJsonData(filename) {
    const filePath = path.join(__dirname, '../../database/jsons/', filename);
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: "Invalid token" });
    }
}

router.get("/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const usersArr = getJsonData('users.json');
    const walletsArr = getJsonData('wallets.json');
    const transactionsArr = getJsonData('transactions.json');
    const usageArr = getJsonData('usage.json');

    const user = usersArr.find(u => u.id === userId);
    const wallet = walletsArr.find(w => w.userId === userId);

    let usageData = usageArr.find(u => u.userId === userId)?.weeklyData;
    if (!usageData || usageData.length < 7) {
        usageData = [
            { day: "Mon", usage: 0, generation: 0 },
            { day: "Tue", usage: 0, generation: 0 },
            { day: "Wed", usage: 0, generation: 0 },
            { day: "Thu", usage: 0, generation: 0 },
            { day: "Fri", usage: 0, generation: 0 },
            { day: "Sat", usage: 0, generation: 0 },
            { day: "Sun", usage: 0, generation: 0 },
        ];
    }

    const recentTransactions = transactionsArr
        .filter(tx => tx.from === userId || tx.to === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(tx => {
            const isSender = tx.from === userId;
            const counterparty = usersArr.find(u => u.id === (isSender ? tx.to : tx.from))?.username || "Unknown";
            return {
                id: tx.id,
                type: tx.from === userId ? 'sell' : 'buy',
                amount: `${tx.amount} ${tx.unit}`,
                value: isSender ? `+${tx.tokenValue} SOL` : `-${tx.tokenValue} SOL`,
                peer: counterparty,
                date: new Date(tx.timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })
            };
        });

    const totalSavings = `${wallet?.balance || 0} SOL`;
    const energySaved = `${wallet?.energyCredits || 0} kWh`;
    const carbonOffset = `${(wallet?.energyCredits || 0) * 0.5} kg CO2`;

    const todayData = usageData[usageData.length - 1] || { usage: 0, generation: 0 };
    const dailyCurrentUsage = `${todayData.usage} kWh`;
    const dailySolarGeneration = `${todayData.generation} kWh`;
    const dailyNetFlow = `+${(todayData.generation - todayData.usage).toFixed(1)} kWh (${todayData.generation >= todayData.usage ? 'Exporting' : 'Importing'})`;

    const totalTrades = recentTransactions.length;
    const energyTraded = `${recentTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toFixed(2)} kWh`;
    const p2pEarnings = `+${recentTransactions.reduce((sum, tx) => tx.type === 'sell' && tx.from === userId ? sum + tx.tokenValue : sum, 0).toFixed(2)} SOL`;

    const usageGenerationData = {
        labels: usageData.map(d => d.day),
        datasets: [
            { data: usageData.map(d => d.usage), color: (opacity = 1) => `rgba(255,99,132,${opacity})`, strokeWidth: 2 },
            { data: usageData.map(d => d.generation), color: (opacity = 1) => `rgba(54,162,235,${opacity})`, strokeWidth: 2 }
        ],
        legend: ["Usage", "Generation"]
    };

    const tradingBreakdownData = [
        {
            name: "Sold",
            population: transactionsArr.filter(tx => tx.from === userId).length,
            color: "#4CAF50",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "Bought",
            population: transactionsArr.filter(tx => tx.to === userId).length,
            color: "#F44336",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        }
    ];


    const savingsEarningsData = {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
            {
                data: [0.5, 0.8, 0.3, 0.7]
            }
        ]
    };


    const data = {
        overview: { totalSavings, energySaved, carbonOffset },
        daily: { currentUsage: dailyCurrentUsage, solarGeneration: dailySolarGeneration, netFlow: dailyNetFlow },
        trading: { totalTrades, energyTraded, p2pEarnings },
        recentTransactions,
        usageGenerationData,
        tradingBreakdownData,
        savingsEarningsData
    };

    res.json({ success: true, data });
});

module.exports = router;


