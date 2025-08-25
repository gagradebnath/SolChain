# SolChain Backend JSON Database Documentation

This document explains how the backend uses JSON files in `database/jsons/`, what data each file contains, and how to use them in your backend routes.

---

## Overview

The backend stores and retrieves persistent data using JSON files located in `database/jsons/`. Each file represents a specific data entity or feature of the platform. Backend routes read from and write to these files to serve API requests.

---

## JSON Files and Their Data

### 1. `energyOverview.json`
- **Purpose:** Stores daily or current energy production, consumption, and savings for each user.
- **Sample Data:**
  ```json
  [
    {
      "userId": "user1",
      "production": "5.2 kWh",
      "consumption": "3.1 kWh",
      "savings": "৳15.75"
    }
  ]
  ```
- **Usage:**  
  - Read to display energy metrics on the dashboard.
  - Update when new energy data is recorded.

---

### 2. `recentActivity.json`
- **Purpose:** Logs recent activities for each user, such as transactions and notifications.
- **Sample Data:**
  ```json
  [
    {
      "id": "1",
      "userId": "user1",
      "type": "transaction",
      "description": "Sold 0.5 kWh to Grid",
      "timestamp": "10:30 AM",
      "value": "+0.5 SOL"
    }
  ]
  ```
- **Usage:**  
  - Read to show recent activity on the dashboard.
  - Append new activities after transactions or system events.

---

### 3. `weather.json`
- **Purpose:** Stores weather information for locations relevant to users.
- **Sample Data:**
  ```json
  [
    {
      "location": "Dhaka, Bangladesh",
      "condition": "Partly Cloudy",
      "temperature": "32°C",
      "icon": "cloud"
    }
  ]
  ```
- **Usage:**  
  - Read to display weather on the dashboard.
  - Update periodically from a weather API.

---

### 4. `marketPrices.json` (or `market.json`)
- **Purpose:** Stores current buy and sell prices for energy tokens.
- **Sample Data:**
  ```json
  [
    {
      "date": "2024-08-25",
      "buy": "0.25 SOL/kWh",
      "sell": "0.20 SOL/kWh"
    }
  ]
  ```
- **Usage:**  
  - Read to show market prices on the dashboard.
  - Update when market rates change.

---

### 5. `goals.json`
- **Purpose:** Stores user goals and their progress.
- **Sample Data:**
  ```json
  [
    {
      "userId": "user1",
      "goals": [
        { "id": "1", "title": "Reduce Consumption", "target": "20%", "progress": 65 },
        { "id": "2", "title": "Earn SOL", "target": "100 SOL", "progress": 40 }
      ]
    }
  ]
  ```
- **Usage:**  
  - Read to display user goals on the dashboard.
  - Update as users make progress or set new goals.

---

## How Backend Uses These JSON Files

- **Reading Data:**  
  Use Node.js `fs` module to read JSON files and parse them into JavaScript objects for use in route handlers.
  ```js
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('database/jsons/energyOverview.json'));
  ```

- **Writing Data:**  
  Update or append data, then write back to the file.
  ```js
  fs.writeFileSync('database/jsons/energyOverview.json', JSON.stringify(data, null, 2));
  ```

- **Example in a Route:**  
  In `routes/HomeScreen.js`, you might aggregate data from all these JSONs to build the dashboard response.

---

## Best Practices

- Always read the latest data from the file before responding to API requests.
- When writing, ensure you do not overwrite concurrent updates (consider using file locks or a database for production).
- Validate data before saving to maintain consistency.

---

## Extending

To add new features:
- Create a new JSON file for the data entity.
- Update your route handlers to read/write this file as needed.

---

**This approach is suitable for prototyping and small-scale deployments. For production, consider migrating to