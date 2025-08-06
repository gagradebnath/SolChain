import React, { useState, useEffect } from 'react';
import { fetchAvailableEnergy, executeTrade } from '../../services/api';
import './P2PTrading.css';

const P2PTrading = () => {
    const [energyOffers, setEnergyOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [tradeAmount, setTradeAmount] = useState('');

    useEffect(() => {
        const loadEnergyOffers = async () => {
            const offers = await fetchAvailableEnergy();
            setEnergyOffers(offers);
        };

        loadEnergyOffers();
    }, []);

    const handleTrade = async () => {
        if (selectedOffer && tradeAmount) {
            const success = await executeTrade(selectedOffer.id, tradeAmount);
            if (success) {
                alert('Trade executed successfully!');
                setTradeAmount('');
                setSelectedOffer(null);
                // Reload offers after trade
                const offers = await fetchAvailableEnergy();
                setEnergyOffers(offers);
            } else {
                alert('Trade execution failed. Please try again.');
            }
        } else {
            alert('Please select an offer and enter a valid amount.');
        }
    };

    return (
        <div className="p2p-trading">
            <h2>P2P Energy Trading</h2>
            <div className="offers-list">
                {energyOffers.map((offer) => (
                    <div key={offer.id} className="offer-item">
                        <input
                            type="radio"
                            name="energyOffer"
                            value={offer.id}
                            onChange={() => setSelectedOffer(offer)}
                        />
                        <label>
                            {offer.prosumer} offers {offer.amount} kWh at {offer.price} SolarTokens
                        </label>
                    </div>
                ))}
            </div>
            <div className="trade-input">
                <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Enter amount to trade"
                />
                <button onClick={handleTrade}>Execute Trade</button>
            </div>
        </div>
    );
};

export default P2PTrading;