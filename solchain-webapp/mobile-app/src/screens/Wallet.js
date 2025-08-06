import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getSolarTokenBalance, getTransactionHistory } from '../services/api';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const tokenBalance = await getSolarTokenBalance();
            const transactionHistory = await getTransactionHistory();
            setBalance(tokenBalance);
            setTransactions(transactionHistory);
        };

        fetchData();
    }, []);

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Date: {item.date}</Text>
            <Text style={styles.transactionText}>Amount: {item.amount} ST</Text>
            <Text style={styles.transactionText}>Type: {item.type}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>SolarToken Wallet</Text>
            <Text style={styles.balance}>Balance: {balance} ST</Text>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    balance: {
        fontSize: 18,
        marginBottom: 20,
    },
    transactionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    transactionText: {
        fontSize: 16,
    },
});

export default Wallet;