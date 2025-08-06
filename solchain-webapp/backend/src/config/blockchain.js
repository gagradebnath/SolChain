const Web3 = require('web3');
const { abi: SolarTokenABI } = require('../contracts/SolarToken.json');
const { abi: EnergyTradingABI } = require('../contracts/EnergyTrading.json');
const { abi: SmartGridABI } = require('../contracts/SmartGrid.json');

const web3 = new Web3(process.env.BLOCKCHAIN_URL);

const SolarTokenAddress = process.env.SOLAR_TOKEN_ADDRESS;
const EnergyTradingAddress = process.env.ENERGY_TRADING_ADDRESS;
const SmartGridAddress = process.env.SMART_GRID_ADDRESS;

const SolarTokenContract = new web3.eth.Contract(SolarTokenABI, SolarTokenAddress);
const EnergyTradingContract = new web3.eth.Contract(EnergyTradingABI, EnergyTradingAddress);
const SmartGridContract = new web3.eth.Contract(SmartGridABI, SmartGridAddress);

module.exports = {
    web3,
    SolarTokenContract,
    EnergyTradingContract,
    SmartGridContract,
};