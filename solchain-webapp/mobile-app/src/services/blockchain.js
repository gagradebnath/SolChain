import Web3 from 'web3';
import { SolarTokenContract, EnergyTradingContract } from '../utils/constants';

let web3;
let solarToken;
let energyTrading;

const initWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        solarToken = new web3.eth.Contract(SolarTokenContract.abi, SolarTokenContract.address);
        energyTrading = new web3.eth.Contract(EnergyTradingContract.abi, EnergyTradingContract.address);
    } else {
        console.error('Please install MetaMask or another Ethereum wallet.');
    }
};

const getBalance = async (address) => {
    if (!solarToken) {
        await initWeb3();
    }
    return await solarToken.methods.balanceOf(address).call();
};

const transferTokens = async (to, amount) => {
    if (!solarToken) {
        await initWeb3();
    }
    const accounts = await web3.eth.getAccounts();
    return await solarToken.methods.transfer(to, amount).send({ from: accounts[0] });
};

const createTrade = async (amount, price) => {
    if (!energyTrading) {
        await initWeb3();
    }
    const accounts = await web3.eth.getAccounts();
    return await energyTrading.methods.createTrade(amount, price).send({ from: accounts[0] });
};

const getTrades = async () => {
    if (!energyTrading) {
        await initWeb3();
    }
    return await energyTrading.methods.getTrades().call();
};

export { initWeb3, getBalance, transferTokens, createTrade, getTrades };