/**
 * Statistics Screen with Charts
 *
 * Displays a dashboard of personal energy stats,
 * including usage, generation, savings, and P2P trading metrics
 * using various chart types for better visualization.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
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

// --- DUMMY DATA (from backend) ---
const DUMMY_STATS = {
    overview: {
        totalSavings: '12.50 SOL',
        energySaved: '55 kWh',
        carbonOffset: '25 kg CO2',
    },
    daily: {
        currentUsage: '2.5 kWh',
        solarGeneration: '4.8 kWh',
        netFlow: '+2.3 kWh (Exporting)',
    },
    trading: {
        totalTrades: 15,
        energyTraded: '32 kWh',
        p2pEarnings: '+7.20 SOL',
    },
    recentTransactions: [
        { id: '1', type: 'sell', amount: '1.2 kWh', value: '+0.25 SOL', peer: 'Aarav C.', date: 'Aug 21' },
        { id: '2', type: 'buy', amount: '0.8 kWh', value: '-0.18 SOL', peer: 'Bina A.', date: 'Aug 20' },
        { id: '3', type: 'sell', amount: '2.1 kWh', value: '+0.45 SOL', peer: 'Fahim H.', date: 'Aug 19' },
    ],
    // Dummy data for charts
    usageGenerationData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [4.5, 5.2, 4.8, 6.1, 5.5, 6.8, 7.5], // Usage in kWh
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                strokeWidth: 2,
            },
            {
                data: [3.2, 4.1, 4.9, 5.5, 4.8, 6.2, 7.1], // Generation in kWh
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ["Usage", "Generation"]
    },
    tradingBreakdownData: [
        { name: "Sold", population: 22, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 15 },
        { name: "Bought", population: 10, color: "#F44336", legendFontColor: "#7F7F7F", legendFontSize: 15 },
    ],
    savingsEarningsData: {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
            {
                data: [3.2, 4.5, 2.1, 2.7], // P2P Earnings in SOL
            },
        ],
    }
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
                        {renderStatCard(t.totalSavings, DUMMY_STATS.overview.totalSavings, 'trending-up')}
                        {renderStatCard(t.energySaved, DUMMY_STATS.overview.energySaved, 'zap')}
                        {renderStatCard(t.carbonOffset, DUMMY_STATS.overview.carbonOffset, 'cloud')}
                    </View>
                </View>

                {/* Usage & Generation Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.usageGenerationChart}</Text>
                    <LineChart
                        data={DUMMY_STATS.usageGenerationData}
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
                        data={DUMMY_STATS.tradingBreakdownData}
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
                        data={DUMMY_STATS.savingsEarningsData}
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
                        {renderStatCard(t.totalTrades, DUMMY_STATS.trading.totalTrades, 'refresh-ccw')}
                        {renderStatCard(t.energyTraded, DUMMY_STATS.trading.energyTraded, 'activity')}
                        {renderStatCard(t.p2pEarnings, DUMMY_STATS.trading.p2pEarnings, 'dollar-sign')}
                    </View>
                </View>

                {/* Recent Transactions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.recentTransactions}</Text>
                    <FlatList
                        data={DUMMY_STATS.recentTransactions}
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