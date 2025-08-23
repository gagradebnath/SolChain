/**
 * Home Screen
 *
 * Main dashboard screen with overview of all SolChain activities
 *
 * Functions implemented:
 * - HomeScreen(): Main screen component
 * - renderQuickActions(): Quick action buttons
 * - renderEnergyOverview(): Energy summary cards
 * - renderRecentActivity(): Recent transactions/activities
 * - renderWeatherAndMarket(): Weather + Market widget
 * - renderGoals(): Energy and financial goals
 * - handleRefresh(): Pull-to-refresh functionality
 * - navigateToSection(): Navigate to specific sections
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';

// Dummy data for all components
const DUMMY_DATA = {
    energyOverview: {
        production: '5.2 kWh',
        consumption: '3.1 kWh',
        savings: '৳15.75',
    },
    recentActivity: [
        { id: '1', type: 'transaction', description: 'Sold 0.5 kWh to Grid', timestamp: '10:30 AM', value: '+0.5 SOL' },
        { id: '2', type: 'transaction', description: 'Bought 0.2 kWh from User B', timestamp: '09:45 AM', value: '-0.2 SOL' },
        { id: '3', type: 'notification', description: 'System maintenance scheduled', timestamp: '08:00 AM', value: null },
    ],
    weather: {
        location: 'Dhaka, Bangladesh',
        condition: 'Partly Cloudy',
        temperature: '32°C',
        icon: 'cloud',
    },
    marketPrices: {
        buy: '0.25 SOL/kWh',
        sell: '0.20 SOL/kWh',
    },
    goals: [
        { id: '1', title: 'Reduce Consumption', target: '20%', progress: 65 },
        { id: '2', title: 'Earn SOL', target: '100 SOL', progress: 40 },
    ],
};

// Translations
const translations = {
    en: {
        dashboard: "Dashboard",
        quickActions: "Quick Actions",
        buy: "Buy",
        sell: "Sell",
        stats: "Stats",
        settings: "Settings",
        community: "Community",
        energyOverview: "Energy Overview",
        production: "Production",
        consumption: "Consumption",
        savings: "Savings",
        recentActivity: "Recent Activity",
        myGoals: "My Goals",
        marketPrice: "Market Price",
        buyPrice: "Buy:",
        sellPrice: "Sell:",
        viewAll: "View All",
    },
    bn: {
        dashboard: "ড্যাশবোর্ড",
        quickActions: "দ্রুত কার্যকলাপ",
        buy: "কিনুন",
        sell: "বিক্রি করুন",
        stats: "পরিসংখ্যান",
        settings: "সেটিংস",
        community: "সম্প্রদায়",
        energyOverview: "শক্তি সংক্ষিপ্তসার",
        production: "উৎপাদন",
        consumption: "খরচ",
        savings: "সঞ্চয়",
        recentActivity: "সাম্প্রতিক কার্যকলাপ",
        myGoals: "আমার লক্ষ্য",
        marketPrice: "বাজার মূল্য",
        buyPrice: "কেনা:",
        sellPrice: "বিক্রি:",
        viewAll: "সব দেখুন",
    },
};

// Main screen component
export default function HomeScreen() {
    const [language, setLanguage] = useState("en");
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const navigateToSection = (section) => {
        navigation.navigate(section);
    };

    const renderQuickActions = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{translations[language].quickActions}</Text>
            <View style={styles.quickActionsContainer}>
                {[
                    { icon: 'shopping-cart', label: translations[language].buy, section: 'BuyEnergy' },
                    { icon: 'dollar-sign', label: translations[language].sell, section: 'SellEnergy' },
                    { icon: 'bar-chart-2', label: translations[language].stats, section: 'Stats' },
                    { icon: 'users', label: translations[language].community, section: 'Community' },
                    { icon: 'settings', label: translations[language].settings, section: 'Settings' },
                ].map((action) => (
                    <TouchableOpacity
                        key={action.label}
                        style={styles.actionButton}
                        onPress={() => navigateToSection(action.section)}
                    >
                        <Feather name={action.icon} size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEnergyOverview = () => (
        <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => navigateToSection('EnergyDashboard')}>
                <Text style={styles.sectionTitle}>{translations[language].energyOverview}</Text>
                <Text style={styles.viewAllText}>{translations[language].viewAll} →</Text>
            </TouchableOpacity>
            <View style={styles.energyCardContainer}>
                {Object.entries(DUMMY_DATA.energyOverview).map(([key, value]) => (
                    <View key={key} style={[styles.energyCard, styles.cardShadow]}>
                        <Feather
                            name={key === 'production' ? 'sunrise' : key === 'consumption' ? 'zap' : 'trending-up'}
                            size={24}
                            color={key === 'production' ? '#4CAF50' : key === 'consumption' ? '#FFC107' : '#2196F3'}
                        />
                        <Text style={styles.energyCardValue}>{value}</Text>
                        <Text style={styles.energyCardLabel}>{translations[language][key]}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderRecentActivity = () => (
        <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => navigateToSection('Wallet')}>
                <Text style={styles.sectionTitle}>{translations[language].recentActivity}</Text>
                <Text style={styles.viewAllText}>{translations[language].viewAll} →</Text>
            </TouchableOpacity>

            {DUMMY_DATA.recentActivity.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.activityItem}>
                    <Feather name={item.type === 'transaction' ? 'repeat' : 'info'} size={20} color="#666" />
                    <View style={styles.activityTextContainer}>
                        <Text style={styles.activityDescription}>{item.description}</Text>
                        <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
                    </View>
                    {item.value && (
                        <Text style={[styles.activityValue, { color: item.value.startsWith('+') ? '#4CAF50' : '#F44336' }]}>
                            {item.value}
                        </Text>
                    )}
                </View>
            ))}
        </View>
    );

    const renderWeatherAndMarket = () => (
        <View style={styles.twoColumnContainer}>
            <View style={[styles.weatherCard, styles.cardShadow]}>
                <Feather name={DUMMY_DATA.weather.icon} size={30} color="#2196F3" />
                <Text style={styles.weatherTemp}>{DUMMY_DATA.weather.temperature}</Text>
                <Text style={styles.weatherCondition}>{DUMMY_DATA.weather.condition}</Text>
                <Text style={styles.weatherLocation}>{DUMMY_DATA.weather.location}</Text>
            </View>
            <View style={[styles.marketCard, styles.cardShadow]}>
                <Text style={styles.marketTitle}>{translations[language].marketPrice}</Text>
                <View style={styles.marketRow}>
                    <Text style={styles.marketLabel}>{translations[language].buyPrice}</Text>
                    <Text style={styles.marketValue}>{DUMMY_DATA.marketPrices.buy}</Text>
                </View>
                <View style={styles.marketRow}>
                    <Text style={styles.marketLabel}>{translations[language].sellPrice}</Text>
                    <Text style={styles.marketValue}>{DUMMY_DATA.marketPrices.sell}</Text>
                </View>
            </View>
        </View>
    );

    const renderGoals = () => {
        const renderGoalItem = ({ item }) => (
            <View style={styles.goalItem}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalProgressText}>{item.progress}%</Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
                </View>
            </View>
        );

        return (
            <View style={styles.sectionContainer}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => navigateToSection('Goals')}>
                    <Text style={styles.sectionTitle}>{translations[language].myGoals}</Text>
                    <Text style={styles.viewAllText}>{translations[language].viewAll} →</Text>
                </TouchableOpacity>
                {DUMMY_DATA.goals.map((item) => renderGoalItem({ item }))}
            </View>
        );
    };

    return (
        <UniversalSafeArea style={styles.safeArea}>
            <StatusBar style="dark" />
            <UniversalScrollContainer
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={Platform.OS !== 'web' ? 
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> : 
                    undefined
                }
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{translations[language].dashboard}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                            <Text style={styles.languageToggle}>
                                {language === "en" ? "EN/BN" : "BN/EN"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToSection('Notifications')}>
                            <Feather name="bell" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                {renderQuickActions()}
                {renderEnergyOverview()}
                {renderRecentActivity()}
                {renderWeatherAndMarket()}
                {renderGoals()}
                
                {/* Add some bottom padding for better scrolling */}
                <View style={styles.bottomPadding} />
            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#f5f5f5',
    },
    container: { 
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerTitle: { 
        fontSize: 28, 
        fontWeight: 'bold' 
    },
    headerActions: {
        flexDirection: "row", 
        alignItems: "center"
    },
    languageToggle: {
        marginRight: 15, 
        fontWeight: "bold", 
        color: "#333", 
        fontSize: 16
    },
    sectionContainer: { 
        marginBottom: 25 
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: '600', 
        color: '#333' 
    },
    viewAllText: { 
        fontSize: 14, 
        color: '#007AFF', 
        fontWeight: '500' 
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    actionButton: {
        backgroundColor: '#06ad1fff',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 15,
        alignItems: 'center',
        width: '18%',
    },
    actionButtonText: { 
        color: '#fff', 
        marginTop: 5, 
        fontWeight: '500', 
        fontSize: 12, 
        textAlign: 'center' 
    },
    energyCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    energyCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '32%',
    },
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    energyCardValue: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginVertical: 8 
    },
    energyCardLabel: { 
        fontSize: 14, 
        color: '#666' 
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    activityTextContainer: { 
        flex: 1, 
        marginLeft: 15 
    },
    activityDescription: { 
        fontSize: 16, 
        color: '#333' 
    },
    activityTimestamp: { 
        fontSize: 12, 
        color: '#999', 
        marginTop: 2 
    },
    activityValue: { 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    twoColumnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    weatherCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '48%',
    },
    weatherTemp: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginVertical: 5 
    },
    weatherCondition: { 
        fontSize: 16, 
        color: '#666' 
    },
    weatherLocation: { 
        fontSize: 12, 
        color: '#999', 
        marginTop: 5 
    },
    marketCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        justifyContent: 'center',
        width: '48%',
    },
    marketTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        textAlign: 'center' 
    },
    marketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    marketLabel: { 
        fontSize: 14, 
        color: '#666' 
    },
    marketValue: { 
        fontSize: 14, 
        fontWeight: 'bold' 
    },
    goalItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    goalTitle: { 
        fontSize: 16, 
        fontWeight: '500' 
    },
    goalProgressText: { 
        alignSelf: 'flex-end', 
        fontSize: 12, 
        color: '#666', 
        marginBottom: 5 
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    bottomPadding: {
        height: 50,
    },
});