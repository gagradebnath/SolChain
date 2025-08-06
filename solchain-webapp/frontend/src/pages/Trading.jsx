import React from 'react';
import P2PTrading from '../components/Trading/P2PTrading';
import EnergyMarketplace from '../components/Trading/EnergyMarketplace';

const Trading = () => {
    return (
        <div>
            <h1>Trading Page</h1>
            <P2PTrading />
            <EnergyMarketplace />
        </div>
    );
};

export default Trading;