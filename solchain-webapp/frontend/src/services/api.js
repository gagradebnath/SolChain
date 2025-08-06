import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Function to get energy data
export const getEnergyData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/energy`);
        return response.data;
    } catch (error) {
        console.error('Error fetching energy data:', error);
        throw error;
    }
};

// Function to get trading data
export const getTradingData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trading`);
        return response.data;
    } catch (error) {
        console.error('Error fetching trading data:', error);
        throw error;
    }
};

// Function to get user profile
export const getUserProfile = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Function to update user profile
export const updateUserProfile = async (userId, profileData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}`, profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Function to perform energy trade
export const performEnergyTrade = async (tradeData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/trading`, tradeData);
        return response.data;
    } catch (error) {
        console.error('Error performing energy trade:', error);
        throw error;
    }
};