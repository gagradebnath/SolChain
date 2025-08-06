import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import P2PTrading from '../components/Trading/P2PTrading';
import EnergyMarketplace from '../components/Trading/EnergyMarketplace';

const Trading = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trading</Text>
            <P2PTrading />
            <EnergyMarketplace />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default Trading;