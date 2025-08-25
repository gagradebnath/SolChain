// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");


// // --- DUMMY DATA (from backend) ---
// const DUMMY_TRANSACTIONS = [
//     {
//         id: '1',
//         type: 'sell',
//         description: 'Energy sale to Aarav Chowdhury',
//         amount: '+5.0 kWh',
//         value: '+1.10 SOL',
//         timestamp: '15m ago',
//     },
//     {
//         id: '2',
//         type: 'buy',
//         description: 'Energy purchase from Fahim Hasan',
//         amount: '-2.5 kWh',
//         value: '-0.55 SOL',
//         timestamp: '1h ago',
//     },
//     {
//         id: '3',
//         type: 'carbon_credit',
//         description: 'Carbon Credit Reward',
//         amount: '+10 CC',
//         value: '+0.05 SOL',
//         timestamp: '1d ago',
//     },
//     {
//         id: '4',
//         type: 'staking',
//         description: 'Staking reward',
//         amount: '+0.02 SOL',
//         value: '+0.02 SOL',
//         timestamp: '2d ago',
//     },
//     {
//         id: '5',
//         type: 'sell',
//         description: 'Energy sale to Bina Akter',
//         amount: '+3.0 kWh',
//         value: '+0.63 SOL',
//         timestamp: '3d ago',
//     },
// ];

// const DUMMY_BALANCE = {
//     solarToken: '10.45 SOL',
//     energyCredits: '250',
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
//   console.log("Authenticated user for wallet screen:", user);

//   res.json({
//     success: true,
//     transactions: DUMMY_TRANSACTIONS,
//     balance: DUMMY_BALANCE,
//   });

// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// --- AUTHENTICATION ---
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

// --- HELPER: Read JSON file ---
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

// --- ROUTE: GET /wallet ---
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Load JSONs
  const transactionsArr = getJsonData('transactions.json');
  const walletsArr = getJsonData('wallets.json');
  const usersArr = getJsonData('users.json');

  // Helper to get username by userId
  const getUsername = (id) => usersArr.find(u => u.id === id)?.username || id;

  // Filter transactions for this user
  const userTransactions = transactionsArr
    .filter(tx => tx.from === userId || tx.to === userId)
    .map(tx => {
      const isSender = tx.from === userId;
      const counterpartyName = getUsername(isSender ? tx.to : tx.from);
      return {
        id: tx.id,
        type: tx.from === userId ? "sell" : "buy",
        description: isSender
          ? `Sold ${tx.amount} ${tx.unit} to ${counterpartyName}`
          : `Bought ${tx.amount} ${tx.unit} from ${counterpartyName}`,
        timestamp: new Date(tx.timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
        value: isSender ? `+${tx.tokenValue} SOL` : `-${tx.tokenValue} SOL`
      };
    });

  // Get user wallet
  const userWallet = walletsArr.find(w => w.userId === userId) || { balance: 0, energyCredits: 0 };
  const balance = {
    solarToken: `${userWallet.balance} SOL`,
    energyCredits: `${userWallet.energyCredits}`
  };

  res.json({
    success: true,
    transactions: userTransactions,
    balance
  });
});

module.exports = router;
