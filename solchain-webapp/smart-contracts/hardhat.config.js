module.exports = {
  solidity: "0.8.0",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HERE"]
    },
    // Add other networks as needed
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY"
  },
  mocha: {
    timeout: 20000
  }
};