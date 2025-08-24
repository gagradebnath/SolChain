import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all your screens
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import BuyEnergyScreen from './screens/BuyScreen';
import SellEnergyScreen from './screens/SellScreen';
import WalletScreen from './screens/WalletScreen';
import StatsScreen from './screens/StatScreen';
import CommunityScreen from './screens/CommunityScreen';
import GoalsScreen from './screens/GoalScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationScreen';
import EnergyDashboardScreen from './screens/EnergyDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* The main dashboard screen */}
        <Stack.Screen 
          name="Home" 
          component={AuthScreen} 
          options={{ headerShown: false }} // Hide the default header for the home screen
        />

        {/* Other screens */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'My Wallet' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistics & Reports' }} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'My Goals' }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="BuyEnergy" component={BuyEnergyScreen} options={{ title: 'Buy Energy' }} />
        <Stack.Screen name="SellEnergy" component={SellEnergyScreen} options={{ title: 'Sell Energy' }} />
        <Stack.Screen name="EnergyDashboard" component={EnergyDashboardScreen} options={{ title: 'Energy Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}