import { useState, useEffect } from 'react';
import { fetchEnergyData } from '../services/api';

const useEnergyData = () => {
    const [energyData, setEnergyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getEnergyData = async () => {
            try {
                const data = await fetchEnergyData();
                setEnergyData(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        getEnergyData();
    }, []);

    return { energyData, loading, error };
};

export default useEnergyData;