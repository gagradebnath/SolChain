import { useEffect, useState } from 'react';
import Web3 from 'web3';

const useWeb3 = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [networkId, setNetworkId] = useState(null);

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {
                    // Request account access
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);

                    const networkId = await web3Instance.eth.net.getId();
                    setNetworkId(networkId);
                } catch (error) {
                    console.error("User denied account access or error occurred:", error);
                }
            } else {
                console.error("Ethereum wallet not detected. Please install MetaMask or another wallet.");
            }
        };

        initWeb3();
    }, []);

    return { web3, account, networkId };
};

export default useWeb3;