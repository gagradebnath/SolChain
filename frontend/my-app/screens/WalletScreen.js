/**
 * Wallet Components
 *
 * SolarToken wallet management and transactions
 *
 * @author Team GreyDevs
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/WalletStyles';
import config from '../assets/config';

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
        case 'carbon_credit': return 'award';
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
    const [walletData, setWalletData] = useState(null);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        fetchWalletData();
    }, []);

    async function fetchWalletData() {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}/wallet`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch wallet data');
            }
            setWalletData(data.success);
            setTransactionHistory(data.transactions);
            setBalance(data.balance);


        } catch (err) {
            console.error("Error fetching wallet data:", err);
            Alert.alert("Error", "Failed to fetch wallet data. Check your network connection.");
        }
    }

    if (!walletData) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading wallet data...</Text>
            </SafeAreaView>
        );
    }
    
    // --- CORRECTED renderTransactionItem ---
    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionItem}>
            <Feather 
                name={getIconForType(item.type)} 
                size={20} 
                color={getTxColor(item.type)} 
                style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.transactionTitle}>{item.description}</Text>
                <Text style={styles.transactionSubtitle}>{item.timestamp}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: getTxColor(item.type) }]}>
                {item.value}
            </Text>
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

    // --- Dummy Handlers for Navigation ---
    const handleStakingPress = () => {
        Alert.alert(
            "Staking",
            "This will navigate to the staking interface. Here, users can lock their tokens to earn rewards.",
            [{ text: "OK" }]
        );
    };

    const handleSecurityPress = () => {
        Alert.alert(
            "Security Settings",
            "This will navigate to the security settings. Features like biometric authentication (Face ID/Touch ID) and transaction signing will be managed here.",
            [{ text: "OK" }]
        );
    };

    const handleHardwareWalletPress = () => {
        Alert.alert(
            "Hardware Wallet",
            "This will navigate to a page for connecting a hardware wallet (e.g., Ledger, Trezor) via Bluetooth or USB. This requires native module integration.",
            [{ text: "OK" }]
        );
    };

    const handleRecoveryPhrasePress = () => {
        const dummyRecoveryPhrase = "dummy phrase for testing only do not use this in a real app";
        Alert.alert(
            "Recovery Phrase",
            `Your 12-word recovery phrase is: \n\n"${dummyRecoveryPhrase}"\n\nWarning: Never share this with anyone. It is the master key to your wallet.`,
            [{ text: "OK" }]
        );
    };

    const handleExportWalletPress = () => {
        Alert.alert(
            "Export Wallet",
            "This will guide the user through exporting their wallet. This could involve generating a QR code or a file with the encrypted private key.",
            [{ text: "OK" }]
        );
    };


    return (
        <UniversalSafeArea style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                    <Text style={styles.langToggle}>{language === "en" ? "EN/BN" : "BN/EN"}</Text>
                </TouchableOpacity>
            </View>

            <UniversalScrollContainer
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* WalletOverview - Main Balance Display */}
                <View style={[styles.balanceCard, styles.cardShadow]}>
                    <Text style={styles.balanceLabel}>{t.balance}</Text>
                    <Text style={styles.solBalance}>{balance?.solarToken}</Text>
                    <Text style={styles.energyCredits}>{balance?.energyCredits} {t.energyCredits}</Text>
                </View>

                {/* Send, Receive, Swap Actions */}
                <View style={styles.walletActions}>
                    <ActionButton icon="arrow-up" text={t.send} onPress={() => Alert.alert("Send", "Navigate to Send screen")} />
                    <ActionButton icon="arrow-down" text={t.receive} onPress={() => Alert.alert("Receive", "Navigate to Receive screen")} />
                    <ActionButton icon="repeat" text={t.swap} onPress={() => Alert.alert("Swap", "Navigate to Swap screen")} />
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
                {transactionHistory.length > 0 ? (
                    <FlatList
                        data={transactionHistory}
                        renderItem={renderTransactionItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                ) : (
                    <Text style={styles.noTransactionsText}>No transactions found.</Text>
                )}


                {/* Additional Functions as a separate settings section */}
                <Text style={styles.sectionTitle}>More Options</Text>
                <View style={[styles.settingsCard, styles.cardShadow]}>
                    <SettingsButton icon="zap" text={t.staking} onPress={handleStakingPress} />
                    <SettingsButton icon="lock" text={t.security} onPress={handleSecurityPress} />
                    <SettingsButton icon="hard-drive" text={t.hardwareWallet} onPress={handleHardwareWalletPress} />
                    <SettingsButton icon="refresh-ccw" text={t.recovery} onPress={handleRecoveryPhrasePress} />
                    <SettingsButton icon="download" text={t.export} onPress={handleExportWalletPress} />
                </View>
            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}