/**
 * Buy Energy Screen
 *
 * Screen for buying energy from peers or the grid.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/BuySellScreenStyles.js';

// Dummy data for energy sellers
const DUMMY_SELLERS = [
  {
    id: '1',
    name: 'Peer-to-Peer Seller A',
    rate: '0.25',
    availableUnits: '15 kWh',
    trustScore: '95%',
    type: 'peer',
  },
  {
    id: '2',
    name: 'The Grid',
    rate: '0.30',
    availableUnits: '∞ kWh',
    trustScore: '100%',
    type: 'grid',
  },
  {
    id: '3',
    name: 'Peer-to-Peer Seller C',
    rate: '0.26',
    availableUnits: '8 kWh',
    trustScore: '88%',
    type: 'peer',
  },
  {
    id: '4',
    name: 'Peer-to-Peer Seller D',
    rate: '0.24',
    availableUnits: '12 kWh',
    trustScore: '92%',
    type: 'peer',
  },
  {
    id: '5',
    name: 'Peer-to-Peer Seller E',
    rate: '0.27',
    availableUnits: '6 kWh',
    trustScore: '91%',
    type: 'peer',
  },
];

// Translations
const translations = {
  en: {
    buyEnergy: "Buy Energy",
    rate: "Rate:",
    availableUnits: "Available:",
    trustScore: "Trust Score:",
    buyNow: "Buy Now",
    solPerKwh: "SOL/kWh",
    confirmPurchase: "Confirm Purchase",
    purchaseSuccessful: "Purchase Successful",
    purchaseMessage: "You have successfully purchased energy.",
    oops: "Oops",
    noSellers: "No sellers currently available.",
    languageToggle: "EN → BN"
  },
  bn: {
    buyEnergy: "শক্তি কিনুন",
    rate: "দর:",
    availableUnits: "উপলভ্য:",
    trustScore: "বিশ্বাস স্কোর:",
    buyNow: "এখন কিনুন",
    solPerKwh: "SOL/kWh",
    confirmPurchase: "ক্রয় নিশ্চিত করুন",
    purchaseSuccessful: "ক্রয় সফল হয়েছে",
    purchaseMessage: "আপনি সফলভাবে শক্তি কিনেছেন।",
    oops: "দুঃখিত",
    noSellers: "বর্তমানে কোন বিক্রেতা উপলব্ধ নেই।",
    languageToggle: "BN → EN"
  },
};

export default function BuyEnergyScreen() {
  const [language, setLanguage] = useState("en");

  const handleBuyEnergy = (seller) => {
    Alert.alert(
      translations[language].confirmPurchase,
      `Are you sure you want to buy energy from ${seller.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: translations[language].buyNow,
          onPress: () => {
            console.log(`Buying energy from ${seller.name}`);
            Alert.alert(translations[language].purchaseSuccessful, translations[language].purchaseMessage);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderSellerList = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather
          name={item.type === 'peer' ? 'user' : 'server'}
          size={24}
          color="#3498DB" // Use a vibrant icon color
        />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>
          <Text style={styles.cardLabel}>{translations[language].rate}</Text> {item.rate} {translations[language].solPerKwh}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.cardLabel}>{translations[language].availableUnits}</Text> {item.availableUnits}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.cardLabel}>{translations[language].trustScore}</Text> {item.trustScore}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.buySellButton}
        onPress={() => handleBuyEnergy(item)}
      >
        <Text style={styles.buySellButtonText}>{translations[language].buyNow}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{translations[language].buyEnergy}</Text>
        <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
          <Text style={styles.languageToggle}>{language === "en" ? "EN → BN" : "BN → EN"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={DUMMY_SELLERS}
        renderItem={renderSellerList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={DUMMY_SELLERS.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{translations[language].noSellers}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}