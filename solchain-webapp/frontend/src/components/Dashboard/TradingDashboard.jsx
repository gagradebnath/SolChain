import React from 'react';
import { useEffect, useState } from 'react';
import { fetchTradingData } from '../../services/api';
import './TradingDashboard.css';

const TradingDashboard = () => {
    const [tradingData, setTradingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getTradingData = async () => {
            try {
                const data = await fetchTradingData();
                setTradingData(data);
            } catch (error) {
                console.error("Error fetching trading data:", error);
            } finally {
                setLoading(false);
            }
        };

        getTradingData();
    }, []);

    if (loading) {
        return <div>Loading trading data...</div>;
    }

    return (
        <div className="trading-dashboard">
            <h2>Trading Dashboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Trade ID</th>
                        <th>Prosumers</th>
                        <th>Energy Amount (kWh)</th>
                        <th>Price (ST)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tradingData.map(trade => (
                        <tr key={trade.id}>
                            <td>{trade.id}</td>
                            <td>{trade.prosumers.join(', ')}</td>
                            <td>{trade.energyAmount}</td>
                            <td>{trade.price}</td>
                            <td>{trade.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TradingDashboard;