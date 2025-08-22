/**
 * Settings Screen
 *
 * This screen provides options for user profile management,
 * wallet settings, language preferences, and notifications.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/SettingsStyles.js';

// Dummy user data
const USER_PROFILE = {
  name: 'John Doe',
  address: '123 Smart Grid St, EcoCity',
  meterId: 'EM-4573-A8',
  walletAddress: '0x1234...ef67',
};

// Translations
const translations = {
  en: {
    settings: "Settings",
    profile: "User Profile",
    name: "Name",
    address: "Address",
    meterId: "Meter ID",
    wallet: "Wallet Settings",
    walletAddress: "Wallet Address",
    disconnectWallet: "Disconnect Wallet",
    language: "Language",
    notifications: "Notifications",
    enablePush: "Enable Push Notifications",
    newsUpdates: "News & Updates",
    transactionAlerts: "Transaction Alerts",
    languageToggle: "EN → BN",
    alert: "Alert",
    comingSoon: "Feature Coming Soon!"
  },
  bn: {
    settings: "সেটিংস",
    profile: "ব্যবহারকারীর প্রোফাইল",
    name: "নাম",
    address: "ঠিকানা",
    meterId: "মিটার আইডি",
    wallet: "ওয়ালেট সেটিংস",
    walletAddress: "ওয়ালেট ঠিকানা",
    disconnectWallet: "ওয়ালেট সংযোগ বিচ্ছিন্ন করুন",
    language: "ভাষা",
    notifications: "বিজ্ঞপ্তি",
    enablePush: "পুশ বিজ্ঞপ্তি সক্রিয় করুন",
    newsUpdates: "খবর ও আপডেট",
    transactionAlerts: "লেনদেন সতর্কতা",
    languageToggle: "BN → EN",
    alert: "সতর্কতা",
    comingSoon: "বৈশিষ্ট্য শীঘ্রই আসছে!"
  },
};

export default function SettingsScreen() {
  const [language, setLanguage] = useState("en");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [newsEnabled, setNewsEnabled] = useState(true);
  const [transactionsEnabled, setTransactionsEnabled] = useState(false);

  const handleDisconnectWallet = () => {
    Alert.alert(
      translations[language].alert,
      `Are you sure you want to disconnect your wallet?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: translations[language].disconnectWallet,
          onPress: () => {
            // TODO: Implement actual wallet disconnection logic
            console.log("Wallet disconnected");
            Alert.alert(translations[language].alert, "Wallet disconnected successfully.");
          },
        },
      ]
    );
  };

  const handleConnectWallet = () => {
    Alert.alert(translations[language].alert, translations[language].comingSoon);
  };

  const togglePushNotifications = () => setPushEnabled(previousState => !previousState);
  const toggleNewsNotifications = () => setNewsEnabled(previousState => !previousState);
  const toggleTransactionsNotifications = () => setTransactionsEnabled(previousState => !previousState);

  return (
    <UniversalSafeArea style={styles.safeArea}>
      <StatusBar style="dark" />
      <UniversalScrollContainer 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{translations[language].settings}</Text>
          <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
            <Text style={styles.languageToggle}>{language === "en" ? "EN ↔ BN" : "BN ↔ EN"}</Text>
          </TouchableOpacity>
        </View>

        {/* User Profile Section */}
        <Text style={styles.sectionHeader}>{translations[language].profile}</Text>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER_PROFILE.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER_PROFILE.name}</Text>
            <Text style={styles.profileDetails}>{translations[language].address}: {USER_PROFILE.address}</Text>
            <Text style={styles.profileDetails}>{translations[language].meterId}: {USER_PROFILE.meterId}</Text>
          </View>
        </View>

        {/* Wallet Settings */}
        <Text style={styles.sectionHeader}>{translations[language].wallet}</Text>
        <View style={styles.listContainer}>
          <View style={[styles.row, styles.rowWithBorder]}>
            <Feather name="credit-card" size={20} color="#5D6D7E" style={{ marginRight: 15 }} />
            <Text style={styles.rowLabel}>{translations[language].walletAddress}</Text>
            <Text style={styles.rowValue}>{USER_PROFILE.walletAddress}</Text>
            <Feather name="copy" size={16} color="#2980B9" />
          </View>
          <TouchableOpacity style={styles.row} onPress={handleDisconnectWallet}>
            <Feather name="log-out" size={20} color="#E74C3C" style={{ marginRight: 15 }} />
            <Text style={[styles.rowLabel, { color: '#E74C3C' }]}>
              {translations[language].disconnectWallet}
            </Text>
            <Feather name="chevron-right" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <Text style={styles.sectionHeader}>{translations[language].language}</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.row} onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
            <Feather name="globe" size={20} color="#5D6D7E" style={{ marginRight: 15 }} />
            <Text style={styles.rowLabel}>{translations[language].language}</Text>
            <Text style={styles.rowValue}>{language === "en" ? "English" : "বাংলা"}</Text>
            <Feather name="chevron-right" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>{translations[language].notifications}</Text>
        <View style={styles.listContainer}>
          <View style={[styles.row, styles.rowWithBorder]}>
            <Feather name="bell" size={20} color="#5D6D7E" style={{ marginRight: 15 }} />
            <Text style={styles.rowLabel}>{translations[language].enablePush}</Text>
            <Switch
              onValueChange={togglePushNotifications}
              value={pushEnabled}
              thumbColor={pushEnabled ? "#2ECC71" : "#f4f3f4"}
              trackColor={{ false: "#ccc", true: "#A2E0C4" }}
            />
          </View>
          <View style={[styles.row, styles.rowWithBorder]}>
            <Feather name="mail" size={20} color="#5D6D7E" style={{ marginRight: 15 }} />
            <Text style={styles.rowLabel}>{translations[language].newsUpdates}</Text>
            <Switch
              onValueChange={toggleNewsNotifications}
              value={newsEnabled}
              thumbColor={newsEnabled ? "#2ECC71" : "#f4f3f4"}
              trackColor={{ false: "#ccc", true: "#A2E0C4" }}
            />
          </View>
          <View style={styles.row}>
            <Feather name="dollar-sign" size={20} color="#5D6D7E" style={{ marginRight: 15 }} />
            <Text style={styles.rowLabel}>{translations[language].transactionAlerts}</Text>
            <Switch
              onValueChange={toggleTransactionsNotifications}
              value={transactionsEnabled}
              thumbColor={transactionsEnabled ? "#2ECC71" : "#f4f3f4"}
              trackColor={{ false: "#ccc", true: "#A2E0C4" }}
            />
          </View>
        </View>
      </UniversalScrollContainer>
    </UniversalSafeArea>
  );
}