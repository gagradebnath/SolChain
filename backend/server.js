const app = require("./app");
const os = require("os");

const PORT = process.env.PORT || 5000;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface of Object.values(interfaces)) {
    for (let config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "127.0.0.1";
}

app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log(`\n✅ Server running!`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Network: http://${localIP}:${PORT}\n`);
});
