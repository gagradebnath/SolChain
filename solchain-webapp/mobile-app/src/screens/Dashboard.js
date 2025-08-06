import React from 'react';
import EnergyDashboard from '../components/Dashboard/EnergyDashboard';
import TradingDashboard from '../components/Dashboard/TradingDashboard';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <EnergyDashboard />
            <TradingDashboard />
        </div>
    );
};

export default Dashboard;