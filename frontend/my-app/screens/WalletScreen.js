import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/WalletStyles';
import config from '../assets/config';

// The provided translations and helper functions are correct as is.

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
        viewAll: 'View All'
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
        viewAll: 'সব দেখুন'
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
    const [showAll, setShowAll] = useState(false);

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
            // Sort transactions by date, newest first. The timestamps from the backend are already formatted,
            // so we'll need to sort them using a common key.
            // The logic to sort by date in descending order is already there.
            const sortedTx = [...data.transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setWalletData(data.success);
            setTransactionHistory(sortedTx);
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
                <Text style={styles.transactionSubtitle}>
  {new Date(item.timestamp).toLocaleString("en-US", {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
</Text>

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

    const handleStakingPress = () => {
        Alert.alert("Staking","This will navigate to the staking interface. Here, users can lock their tokens to earn rewards.",[{ text: "OK" }]);
    };

    const handleSecurityPress = () => {
        Alert.alert("Security Settings","This will navigate to the security settings. Features like biometric authentication (Face ID/Touch ID) and transaction signing will be managed here.",[{ text: "OK" }]);
    };

    const handleHardwareWalletPress = () => {
        Alert.alert("Hardware Wallet","This will navigate to a page for connecting a hardware wallet (e.g., Ledger, Trezor) via Bluetooth or USB. This requires native module integration.",[{ text: "OK" }]);
    };

    const handleRecoveryPhrasePress = () => {
        const dummyRecoveryPhrase = "dummy phrase for testing only do not use this in a real app";
        Alert.alert("Recovery Phrase",`Your 12-word recovery phrase is: \n\n"${dummyRecoveryPhrase}"\n\nWarning: Never share this with anyone. It is the master key to your wallet.`,[{ text: "OK" }]);
    };

    const handleExportWalletPress = () => {
        Alert.alert("Export Wallet","This will guide the user through exporting their wallet. This could involve generating a QR code or a file with the encrypted private key.",[{ text: "OK" }]);
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
                <View style={[styles.balanceCard, styles.cardShadow]}>
                    <Text style={styles.balanceLabel}>{t.balance}</Text>
                    <Text style={styles.solBalance}>{balance?.solarToken}</Text>
                    <Text style={styles.energyCredits}>{balance?.energyCredits} {t.energyCredits}</Text>
                </View>

                <View style={styles.walletActions}>
                    <ActionButton icon="arrow-up" text={t.send} onPress={() => Alert.alert("Send", "Navigate to Send screen")} />
                    <ActionButton icon="arrow-down" text={t.receive} onPress={() => Alert.alert("Receive", "Navigate to Receive screen")} />
                    <ActionButton icon="repeat" text={t.swap} onPress={() => Alert.alert("Swap", "Navigate to Swap screen")} />
                </View>

                <View style={[styles.paymentCard, styles.cardShadow]}>
                    <Feather name="shopping-bag" size={24} color="#007AFF" />
                    <View style={styles.paymentTextContainer}>
                        <Text style={styles.paymentTitle}>{t.buy}</Text>
                        <Text style={styles.paymentSubtitle}>Via bKash, Nagad, etc.</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#007AFF" />
                </View>

                <Text style={styles.sectionTitle}>{t.transactions}</Text>
                {transactionHistory.length > 0 ? (
                    <>
                        <FlatList
                            // Displays only the first 5 transactions unless showAll is true
                            data={showAll ? transactionHistory : transactionHistory.slice(0, 5)}
                            renderItem={renderTransactionItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                        {/* Only show "View All" button if there are more than 5 transactions */}
                        {!showAll && transactionHistory.length > 5 && (
                            <TouchableOpacity onPress={() => setShowAll(true)}>
                                <Text style={{ color: "#007AFF", marginTop: 10, textAlign: "center" }}>{t.viewAll}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <Text style={styles.noTransactionsText}>No transactions found.</Text>
                )}

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