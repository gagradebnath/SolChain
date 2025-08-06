import React from 'react';

const TradeButton = ({ onTrade }) => {
    return (
        <button onClick={onTrade} className="trade-button">
            Initiate Trade
        </button>
    );
};

export default TradeButton;