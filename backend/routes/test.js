// test.js
const path = require("path");
const fs = require("fs");

// Helper to read JSON files
function getJsonData(filename) {
  const filePath = path.join(__dirname, '../../database/jsons', filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Simulate your route logic
function getSellers() {
  const usersArr = getJsonData('users.json');
  const realtimeArr = getJsonData('realtime.json');

  const sellers = usersArr
    .filter(u => !u.buying) // selling users
    .map(u => {
      const realtime = realtimeArr.find(r => r.userId === u.id);
      const availableUnits = realtime?.available || 0;
      const onMarket = realtime?.onMarket - availableUnits > 0 ? availableUnits : realtime?.onMarket;

      return {
        id: u.id,
        name: u.username,
        rate: u.rate,
        availableUnits: `${availableUnits} kWh`,
        trustScore: '90%',
        type: 'peer',
        onMarket: `${onMarket} kWh`,
        coordinate: { latitude: u.latitude, longitude: u.longitude }
      };
    });

  return sellers;
}

// Run test
const sellers = getSellers();
console.log("Sellers data:");
console.log(JSON.stringify(sellers, null, 2));
