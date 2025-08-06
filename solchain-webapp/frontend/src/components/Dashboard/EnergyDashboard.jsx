import React from 'react';
import { useEnergyData } from '../../hooks/useEnergyData';
import './EnergyDashboard.css';

const EnergyDashboard = () => {
    const { energyData, loading, error } = useEnergyData();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading energy data: {error.message}</div>;
    }

    return (
        <div className="energy-dashboard">
            <h2>Energy Dashboard</h2>
            <div className="energy-metrics">
                <div className="metric">
                    <h3>Energy Produced</h3>
                    <p>{energyData.produced} kWh</p>
                </div>
                <div className="metric">
                    <h3>Energy Consumed</h3>
                    <p>{energyData.consumed} kWh</p>
                </div>
                <div className="metric">
                    <h3>Net Energy</h3>
                    <p>{energyData.net} kWh</p>
                </div>
            </div>
        </div>
    );
};

export default EnergyDashboard;