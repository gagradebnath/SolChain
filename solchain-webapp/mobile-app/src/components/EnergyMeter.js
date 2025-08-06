import React from 'react';

const EnergyMeter = ({ energyData }) => {
    return (
        <div className="energy-meter">
            <h2>Energy Meter</h2>
            <div className="energy-readings">
                <p>Current Energy Production: {energyData.production} kWh</p>
                <p>Current Energy Consumption: {energyData.consumption} kWh</p>
                <p>Net Energy: {energyData.net} kWh</p>
            </div>
        </div>
    );
};

export default EnergyMeter;