const Web3 = require('web3');
const { SolarToken, EnergyTrading, SmartGrid } = require('../contracts');
const blockchainConfig = require('../config/blockchain');

class BlockchainService {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(blockchainConfig.providerUrl));
        this.solarTokenContract = new this.web3.eth.Contract(SolarToken.abi, SolarToken.address);
        this.energyTradingContract = new this.web3.eth.Contract(EnergyTrading.abi, EnergyTrading.address);
        this.smartGridContract = new this.web3.eth.Contract(SmartGrid.abi, SmartGrid.address);
    }

    async deployContract(contractData, fromAddress) {
        const contract = new this.web3.eth.Contract(contractData.abi);
        const deployTx = contract.deploy({ data: contractData.bytecode });
        const gasEstimate = await deployTx.estimateGas();
        const result = await deployTx.send({ from: fromAddress, gas: gasEstimate });
        return result;
    }

    async executeTrade(tradeData, fromAddress) {
        const gasEstimate = await this.energyTradingContract.methods.executeTrade(tradeData).estimateGas({ from: fromAddress });
        const result = await this.energyTradingContract.methods.executeTrade(tradeData).send({ from: fromAddress, gas: gasEstimate });
        return result;
    }

    async getSolarTokenBalance(address) {
        const balance = await this.solarTokenContract.methods.balanceOf(address).call();
        return this.web3.utils.fromWei(balance, 'ether');
    }

    async getEnergyMarketOffers() {
        const offers = await this.energyTradingContract.methods.getMarketOffers().call();
        return offers;
    }

    async getSmartMeterData(meterId) {
        const data = await this.smartGridContract.methods.getMeterData(meterId).call();
        return data;
    }
}

module.exports = new BlockchainService();