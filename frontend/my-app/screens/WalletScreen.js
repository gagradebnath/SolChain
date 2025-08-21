// WalletScreen.js

import React, { useState } from 'react';
import {ScrollView, View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/WalletStyles';

// --- DUMMY DATA (from backend) ---
const DUMMY_TRANSACTIONS = [
    {
        id: '1',
        type: 'sell',
        description: 'Energy sale to Aarav Chowdhury',
        amount: '+5.0 kWh',
        value: '+1.10 SOL',
        timestamp: '15m ago',
    },
    {
        id: '2',
        type: 'buy',
        description: 'Energy purchase from Fahim Hasan',
        amount: '-2.5 kWh',
        value: '-0.55 SOL',
        timestamp: '1h ago',
    },
    {
        id: '3',
        type: 'carbon_credit',
        description: 'Carbon Credit Reward',
        amount: '+10 CC',
        value: '+0.05 SOL',
        timestamp: '1d ago',
    },
    {
        id: '4',
        type: 'staking',
        description: 'Staking reward',
        amount: '+0.02 SOL',
        value: '+0.02 SOL',
        timestamp: '2d ago',
    },
    {
        id: '5',
        type: 'sell',
        description: 'Energy sale to Bina Akter',
        amount: '+3.0 kWh',
        value: '+0.63 SOL',
        timestamp: '3d ago',
    },
];

// --- TRANSLATIONS ---
const translations = {
    en: {
        title: 'Wallet',
        balance: 'Current Balance',
        solBalance: 'SOL Balance',
        energyCredits: 'Energy Credits',
        transactions: 'Transaction History',
        send: 'Send',
        receive: 'Receive',
        connectWallet: 'Connect Wallet',
    },
    bn: {
        title: 'ওয়ালেট',
        balance: 'বর্তমান ব্যালেন্স',
        solBalance: 'SOL ব্যালেন্স',
        energyCredits: 'এনার্জি ক্রেডিট',
        transactions: 'লেনদেনের ইতিহাস',
        send: 'পাঠান',
        receive: 'গ্রহণ করুন',
        connectWallet: 'ওয়ালেট সংযুক্ত করুন',
    },
};

// --- ICON MAPPING ---
const getIconForType = (type) => {
    switch (type) {
        case 'buy':
            return 'arrow-down-left';
        case 'sell':
            return 'arrow-up-right';
        case 'staking':
            return 'zap';
        case 'carbon_credit':
            return 'leaf';
        default:
            return 'info';
    }
};

const getTxColor = (type) => {
    switch (type) {
        case 'sell':
        case 'staking':
        case 'carbon_credit':
            return '#4CAF50'; // Green
        case 'buy':
            return '#F44336'; // Red
        default:
            return '#333';
    }
};

export default function WalletScreen() {
    const [language, setLanguage] = useState("en");
    const t = translations[language];

    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionCard}>
            <Feather
                name={getIconForType(item.type)}
                size={24}
                color={getTxColor(item.type)}
            />
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <Text style={styles.transactionAmount}>{item.amount}</Text>
            </View>
            <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValue, { color: getTxColor(item.type) }]}>{item.value}</Text>
                <Text style={styles.transactionTimestamp}>{item.timestamp}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                    <Text style={styles.langToggle}>{language === "en" ? "EN/BN" : "BN/EN"}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
                {/* Balance Card */}
                <View style={[styles.balanceCard, styles.cardShadow]}>
                    <Text style={styles.balanceLabel}>{t.balance}</Text>
                    <Text style={styles.solBalance}>10.45 SOL</Text>
                    <Text style={styles.energyCredits}>250 Energy Credits</Text>
                </View>

                {/* Wallet Actions */}
                <View style={styles.walletActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="arrow-up" size={24} color="#007AFF" />
                        <Text style={styles.actionText}>{t.send}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="arrow-down" size={24} color="#007AFF" />
                        <Text style={styles.actionText}>{t.receive}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="link" size={24} color="#007AFF" />
                        <Text style={styles.actionText}>{t.connectWallet}</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction History */}
                <Text style={styles.sectionTitle}>{t.transactions}</Text>
                <FlatList
                    data={DUMMY_TRANSACTIONS}
                    renderItem={renderTransactionItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
}