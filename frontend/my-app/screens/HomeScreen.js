/**
 * Home Screen
 *
 * Main dashboard screen with overview of all SolChain activities
 *
 * Functions to implement:
 * - HomeScreen(): Main screen component
 * - renderQuickActions(): Quick action buttons
 * - renderEnergyOverview(): Energy summary cards
 * - renderRecentActivity(): Recent transactions/activities
 * - renderNotifications(): Important notifications
 * - renderWeatherWidget(): Weather affecting solar production
 * - renderMarketPrices(): Current energy market prices
 * - renderGoals(): Energy and financial goals
 * - handleRefresh(): Pull-to-refresh functionality
 * - navigateToSection(): Navigate to specific sections
 *
 * @author Team GreyDevs
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/HomeScreenStyles.js';

// Dummy data for all components
const DUMMY_DATA = {
  energyOverview: {
    production: '5.2 kWh',
    consumption: '3.1 kWh',
    savings: '$15.75',
  },
  recentActivity: [
    { id: '1', type: 'transaction', description: 'Sold 0.5 kWh to Grid', timestamp: '10:30 AM', value: '+0.5 SOL' },
    { id: '2', type: 'transaction', description: 'Bought 0.2 kWh from User B', timestamp: '09:45 AM', value: '-0.2 SOL' },
    { id: '3', type: 'notification', description: 'System maintenance scheduled', timestamp: '08:00 AM', value: null },
  ],
  notifications: [
    { id: '1', title: 'Maintenance Alert', body: 'System maintenance scheduled for 11/15/25.' },
    { id: '2', title: 'Goal Reached!', body: 'You’ve reached 80% of your energy savings goal!' },
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

// Main screen component
export default function HomeScreen() {
  const handleRefresh = () => {
    console.log('Refreshing data...');
    // TODO: fetch backend data when backend is ready
  };

  const navigateToSection = (section) => {
    console.log(`Navigating to ${section}`);
    // TODO: integrate React Navigation
  };

  // ===== Render Functions =====

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        {[
          { icon: 'shopping-cart', label: 'Buy', section: 'BuyEnergy' },
          { icon: 'dollar-sign', label: 'Sell', section: 'SellEnergy' },
          { icon: 'bar-chart-2', label: 'Stats', section: 'ViewStats' },
          { icon: 'settings', label: 'Settings', section: 'Settings' },
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
      <Text style={styles.sectionTitle}>Energy Overview</Text>
      <View style={styles.energyCardContainer}>
        {Object.entries(DUMMY_DATA.energyOverview).map(([key, value]) => (
          <View key={key} style={[styles.energyCard, styles.cardShadow]}>
            <Feather
              name={key === 'production' ? 'sunrise' : key === 'consumption' ? 'zap' : 'trending-up'}
              size={24}
              color={key === 'production' ? '#4CAF50' : key === 'consumption' ? '#FFC107' : '#2196F3'}
            />
            <Text style={styles.energyCardValue}>{value}</Text>
            <Text style={styles.energyCardLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {DUMMY_DATA.recentActivity.map((item) => (
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
      {/* Weather Widget */}
      <View style={[styles.weatherCard, styles.cardShadow]}>
        <Feather name={DUMMY_DATA.weather.icon} size={30} color="#2196F3" />
        <Text style={styles.weatherTemp}>{DUMMY_DATA.weather.temperature}</Text>
        <Text style={styles.weatherCondition}>{DUMMY_DATA.weather.condition}</Text>
        <Text style={styles.weatherLocation}>{DUMMY_DATA.weather.location}</Text>
      </View>

      {/* Market Prices */}
      <View style={[styles.marketCard, styles.cardShadow]}>
        <Text style={styles.marketTitle}>Market Price</Text>
        <View style={styles.marketRow}>
          <Text style={styles.marketLabel}>Buy:</Text>
          <Text style={styles.marketValue}>{DUMMY_DATA.marketPrices.buy}</Text>
        </View>
        <View style={styles.marketRow}>
          <Text style={styles.marketLabel}>Sell:</Text>
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
        <Text style={styles.sectionTitle}>My Goals</Text>
        <FlatList
          data={DUMMY_DATA.goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  // ===== Render Main Component =====
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.container}
        onRefresh={handleRefresh}
        refreshing={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={() => navigateToSection('Notifications')}>
            <Feather name="bell" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {renderQuickActions()}
        {renderEnergyOverview()}
        {renderRecentActivity()}
        {renderWeatherAndMarket()}
        {renderGoals()}

      </ScrollView>
    </SafeAreaView>
  );
}


