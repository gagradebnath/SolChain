const IoTDevice = require('../models/SmartMeter');

// Function to get energy data from IoT devices
const getEnergyData = async (deviceId) => {
    try {
        const deviceData = await IoTDevice.findById(deviceId);
        if (!deviceData) {
            throw new Error('Device not found');
        }
        return deviceData;
    } catch (error) {
        throw new Error(`Error fetching energy data: ${error.message}`);
    }
};

// Function to update energy data from IoT devices
const updateEnergyData = async (deviceId, data) => {
    try {
        const updatedDevice = await IoTDevice.findByIdAndUpdate(deviceId, data, { new: true });
        if (!updatedDevice) {
            throw new Error('Device not found');
        }
        return updatedDevice;
    } catch (error) {
        throw new Error(`Error updating energy data: ${error.message}`);
    }
};

// Function to register a new IoT device
const registerDevice = async (deviceInfo) => {
    try {
        const newDevice = new IoTDevice(deviceInfo);
        await newDevice.save();
        return newDevice;
    } catch (error) {
        throw new Error(`Error registering device: ${error.message}`);
    }
};

module.exports = {
    getEnergyData,
    updateEnergyData,
    registerDevice,
};