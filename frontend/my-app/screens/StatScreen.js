/**
 * Statistics Screen with Charts
 *
 * Displays a dashboard of personal energy stats,
 * including usage, generation, savings, and P2P trading metrics
 * using various chart types for better visualization.
 *
 * @author Team GreyDevs
 */

import React, { useState , useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../assets/config';
import { SafeAreaView } from 'react-native';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/StatStyle';

const { width } = Dimensions.get('window');
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
};



// --- TRANSLATIONS ---
const translations = {
    en: {
        title: "Energy Stats",
        overview: "Overview",
        totalSavings: "Total Savings",
        energySaved: "Energy Saved (P2P)",
        carbonOffset: "Carbon Offset",
        dailySummary: "Daily Summary",
        currentUsage: "Current Usage",
        solarGeneration: "Solar Generation",
        netFlow: "Net Energy Flow",
        p2pStats: "P2P Trading Stats",
        totalTrades: "Total Trades",
        energyTraded: "Energy Traded",
        p2pEarnings: "P2P Earnings",
        recentTransactions: "Recent P2P Transactions",
        usageGenerationChart: "Weekly Usage & Generation",
        tradingBreakdown: "P2P Trading Breakdown",
        p2pEarningsChart: "Monthly P2P Earnings (SOL)",
        type: "Type",
        peer: "Peer",
        amount: "Amount",
        value: "Value",
        date: "Date",
    },
    bn: {
        title: "এনার্জি পরিসংখ্যান",
        overview: "সারসংক্ষেপ",
        totalSavings: "মোট সঞ্চয়",
        energySaved: "সংরক্ষিত শক্তি (P2P)",
        carbonOffset: "কার্বন হ্রাস",
        dailySummary: "দৈনিক সারসংক্ষেপ",
        currentUsage: "বর্তমান ব্যবহার",
        solarGeneration: "সৌর উৎপাদন",
        netFlow: "নেট শক্তির প্রবাহ",
        p2pStats: "P2P ট্রেডিং পরিসংখ্যান",
        totalTrades: "মোট ট্রেড",
        energyTraded: "ট্রেডকৃত শক্তি",
        p2pEarnings: "P2P উপার্জন",
        recentTransactions: "সাম্প্রতিক P2P লেনদেন",
        usageGenerationChart: "সাপ্তাহিক ব্যবহার ও উৎপাদন",
        tradingBreakdown: "P2P ট্রেডিং ভাঙ্গন",
        p2pEarningsChart: "মাসিক P2P উপার্জন (SOL)",
        type: "ধরন",
        peer: "সঙ্গী",
        amount: "পরিমাণ",
        value: "মূল্য",
        date: "তারিখ",
    }
};

export default function StatScreen() {
    const [language, setLanguage] = useState("en");
    const t = translations[language];
    const [DATA_STATS, setDataStats] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        fetchStatsData();
    }, []);

    async function fetchStatsData() {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch stats data');
            }

            setDataStats(data.data);

        } catch (err) {
            console.error("Error fetching stats data:", err);
            Alert.alert("Error", "Failed to fetch stats data. Check your network connection.");
        }
    }

    if (!DATA_STATS) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading stats data...</Text>
            </SafeAreaView>
        );
    }

    const renderStatCard = (label, value, iconName) => (
        <View style={styles.statCard}>
            <Feather name={iconName} size={24} color="#007AFF" />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );

    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionItem}>
            <Feather name={item.type === 'buy' ? 'arrow-down-left' : 'arrow-up-right'} size={20} color={item.type === 'buy' ? '#F44336' : '#4CAF50'} />
            <Text style={[styles.transactionText, { flex: 1 }]}>{item.peer}</Text>
            <Text style={styles.transactionText}>{item.amount}</Text>
            <Text style={[styles.transactionValue, { color: item.type === 'buy' ? '#F44336' : '#4CAF50' }]}>{item.value}</Text>
        </View>
    );

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
                showsVerticalScrollIndicator={false}
            >

                {/* Overview Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.overview}</Text>
                    <View style={styles.cardContainer}>
                        {renderStatCard(t.totalSavings, DATA_STATS.overview.totalSavings, 'trending-up')}
                        {renderStatCard(t.energySaved, DATA_STATS.overview.energySaved, 'zap')}
                        {renderStatCard(t.carbonOffset, DATA_STATS.overview.carbonOffset, 'cloud')}
                    </View>
                </View>

                {/* Usage & Generation Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.usageGenerationChart}</Text>
                    <LineChart
                        data={DATA_STATS.usageGenerationData}
                        width={width - 30}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </View>

                {/* P2P Trading Breakdown Pie Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.tradingBreakdown}</Text>
                    <PieChart
                        data={DATA_STATS.tradingBreakdownData}
                        width={width - 30}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                        style={styles.chart}
                    />
                </View>

                {/* P2P Earnings Bar Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.p2pEarningsChart}</Text>
                    <BarChart
                        data={DATA_STATS.savingsEarningsData}
                        width={width - 30}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={chartConfig}
                        verticalLabelRotation={30}
                        style={styles.chart}
                    />
                </View>

                {/* P2P Trading Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.p2pStats}</Text>
                    <View style={styles.cardContainer}>
                        {renderStatCard(t.totalTrades, DATA_STATS.trading.totalTrades, 'refresh-ccw')}
                        {renderStatCard(t.energyTraded, DATA_STATS.trading.energyTraded, 'activity')}
                        {renderStatCard(t.p2pEarnings, DATA_STATS.trading.p2pEarnings, 'dollar-sign')}
                    </View>
                </View>

                {/* Recent Transactions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.recentTransactions}</Text>
                    <FlatList
                        data={DATA_STATS.recentTransactions}
                        renderItem={renderTransactionItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.transactionList}
                    />
                </View>

            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}