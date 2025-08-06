import React, { useEffect, useState } from 'react';
import { fetchEnergyOffers, makeTransaction } from '../../services/api';
import './EnergyMarketplace.css';

const EnergyMarketplace = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const data = await fetchEnergyOffers();
                setOffers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    const handleTransaction = async (offerId) => {
        try {
            await makeTransaction(offerId);
            alert('Transaction successful!');
            // Optionally refresh offers after transaction
            const updatedOffers = await fetchEnergyOffers();
            setOffers(updatedOffers);
        } catch (err) {
            alert('Transaction failed: ' + err.message);
        }
    };

    if (loading) {
        return <div>Loading offers...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="energy-marketplace">
            <h2>Energy Marketplace</h2>
            <ul>
                {offers.map((offer) => (
                    <li key={offer.id}>
                        <span>{offer.description}</span>
                        <span>{offer.price} SolarTokens</span>
                        <button onClick={() => handleTransaction(offer.id)}>Buy</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EnergyMarketplace;