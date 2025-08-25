
// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");

// // --- Helper to read JSON file ---
// function getJsonData(filename) {
//   const filePath = path.join(__dirname, '../../database/jsons', filename);
//   if (!fs.existsSync(filePath)) return [];
//   try {
//     return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   } catch (err) {
//     console.error("Error reading JSON file:", err);
//     return [];
//   }
// }

// // --- Token Authentication ---
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

// // --- GET /notifications ---
// router.get("/", authenticateToken, (req, res) => {
//   const userId = req.user.id;
//   console.log("Authenticated user for NotificationScreen:", userId);

//   const allNotifications = getJsonData("notifications.json"); // Array of users
//   const currentUserData = allNotifications.find(u => u.userId === userId);

//   if (!currentUserData) {
//     return res.status(404).json({ success: false, data: [], error: "No notifications found for this user" });
//   }

//   res.json({
//     success: true,
//     data: currentUserData.notifications,
//   });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// --- Helper to read JSON file ---
function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return [];
  }
}

// --- Token Authentication ---
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

// --- GET /notifications ---
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log("Authenticated user for NotificationScreen:", userId);

  const allNotifications = getJsonData("notifications.json"); // Array of users
  const currentUserData = allNotifications.find(u => u.userId === userId);

  if (!currentUserData) {
    return res.status(404).json({ success: false, data: [], error: "No notifications found for this user" });
  }

  res.json({
    success: true,
    data: currentUserData.notifications,
  });
});

// --- POST /notifications/:id/read ---
router.post("/:id/read", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const filePath = path.join(__dirname, '../../database/jsons', 'notifications.json');

    try {
        const allUsersNotifications = getJsonData("notifications.json");
        const userNotificationsIndex = allUsersNotifications.findIndex(u => u.userId === userId);

        if (userNotificationsIndex === -1) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const userNotifications = allUsersNotifications[userNotificationsIndex].notifications;
        const notificationToUpdate = userNotifications.find(n => n.id === notificationId);

        if (!notificationToUpdate) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        notificationToUpdate.isRead = true;

        fs.writeFileSync(filePath, JSON.stringify(allUsersNotifications, null, 2), 'utf-8');

        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// --- POST /notifications/read/all ---
router.post("/read/all", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const filePath = path.join(__dirname, '../../database/jsons', 'notifications.json');

    try {
        const allUsersNotifications = getJsonData("notifications.json");
        const userNotificationsIndex = allUsersNotifications.findIndex(u => u.userId === userId);

        if (userNotificationsIndex === -1) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        allUsersNotifications[userNotificationsIndex].notifications.forEach(notif => {
            notif.isRead = true;
        });

        fs.writeFileSync(filePath, JSON.stringify(allUsersNotifications, null, 2), 'utf-8');

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

module.exports = router;