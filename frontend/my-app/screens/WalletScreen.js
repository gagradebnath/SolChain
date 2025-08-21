/**
 * Wallet Components
 *
 * SolarToken wallet management and transactions
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, TouchableOpacity } from 'react-native';
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

const DUMMY_BALANCE = {
    solarToken: '10.45 SOL',
    energyCredits: '250',
};

// --- TRANSLATIONS ---
const translations = {
    en: {
        title: 'My Wallet',
        balance: 'Current Balance',
        solBalance: 'SolarToken Balance',
        energyCredits: 'Energy Credits',
        transactions: 'Recent Transactions',
        send: 'Send',
        receive: 'Receive',
        swap: 'Swap',
        buy: 'Buy with bKash',
        staking: 'Staking',
        security: 'Security',
        hardwareWallet: 'Hardware Wallet',
        recovery: 'Recovery Phrase',
        export: 'Export Wallet',
    },
    bn: {
        title: 'আমার ওয়ালেট',
        balance: 'বর্তমান ব্যালেন্স',
        solBalance: 'সোলারটোকেন ব্যালেন্স',
        energyCredits: 'এনার্জি ক্রেডিট',
        transactions: 'সাম্প্রতিক লেনদেন',
        send: 'পাঠান',
        receive: 'গ্রহণ করুন',
        swap: 'অদল-বদল',
        buy: 'বিকাশ দিয়ে কিনুন',
        staking: 'স্টেকিং',
        security: 'নিরাপত্তা',
        hardwareWallet: 'হার্ডওয়্যার ওয়ালেট',
        recovery: 'রিকভারি ফ্রেজ',
        export: 'ওয়ালেট এক্সপোর্ট',
    },
};

const getIconForType = (type) => {
    switch (type) {
        case 'buy': return 'arrow-down-left';
        case 'sell': return 'arrow-up-right';
        case 'staking': return 'zap';
        case 'carbon_credit': return 'leaf';
        default: return 'info';
    }
};

const getTxColor = (type) => {
    switch (type) {
        case 'sell':
        case 'staking':
        case 'carbon_credit':
            return '#4CAF50';
        case 'buy':
            return '#F44336';
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

    const ActionButton = ({ icon, text, onPress }) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Feather name={icon} size={24} color="#007AFF" />
            <Text style={styles.actionText}>{text}</Text>
        </TouchableOpacity>
    );

    const SettingsButton = ({ icon, text, onPress }) => (
        <TouchableOpacity style={styles.settingsButton} onPress={onPress}>
            <Feather name={icon} size={20} color="#333" />
            <Text style={styles.settingsText}>{text}</Text>
            <Feather name="chevron-right" size={20} color="#999" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
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
                {/* WalletOverview - Main Balance Display */}
                <View style={[styles.balanceCard, styles.cardShadow]}>
                    <Text style={styles.balanceLabel}>{t.balance}</Text>
                    <Text style={styles.solBalance}>{DUMMY_BALANCE.solarToken}</Text>
                    <Text style={styles.energyCredits}>{DUMMY_BALANCE.energyCredits} {t.energyCredits}</Text>
                </View>

                {/* Send, Receive, Swap Actions */}
                <View style={styles.walletActions}>
                    <ActionButton icon="arrow-up" text={t.send} onPress={() => { /* Navigate to SendTokens screen */ }} />
                    <ActionButton icon="arrow-down" text={t.receive} onPress={() => { /* Navigate to ReceiveTokens screen */ }} />
                    <ActionButton icon="repeat" text={t.swap} onPress={() => { /* Navigate to TokenSwap screen */ }} />
                </View>

                {/* Fiat Payment Gateway (bKash) */}
                <View style={[styles.paymentCard, styles.cardShadow]}>
                    <Feather name="shopping-bag" size={24} color="#007AFF" />
                    <View style={styles.paymentTextContainer}>
                        <Text style={styles.paymentTitle}>{t.buy}</Text>
                        <Text style={styles.paymentSubtitle}>Via bKash, Nagad, etc.</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#007AFF" />
                </View>

                {/* TransactionHistory */}
                <Text style={styles.sectionTitle}>{t.transactions}</Text>
                <FlatList
                    data={DUMMY_TRANSACTIONS}
                    renderItem={renderTransactionItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                />

                {/* Additional Functions as a separate settings section */}
                <Text style={styles.sectionTitle}>More Options</Text>
                <View style={[styles.settingsCard, styles.cardShadow]}>
                    <SettingsButton icon="zap" text={t.staking} onPress={() => { /* Navigate to StakingInterface */ }} />
                    <SettingsButton icon="lock" text={t.security} onPress={() => { /* Navigate to WalletSecurity */ }} />
                    <SettingsButton icon="hard-drive" text={t.hardwareWallet} onPress={() => { /* Navigate to HardwareWallet */ }} />
                    <SettingsButton icon="refresh-ccw" text={t.recovery} onPress={() => { /* Navigate to RecoveryPhrase */ }} />
                    <SettingsButton icon="download" text={t.export} onPress={() => { /* Navigate to WalletExport */ }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}