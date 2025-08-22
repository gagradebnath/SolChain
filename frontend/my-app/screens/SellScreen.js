/**
 * Sell Energy Screen
 *
 * Screen for selling surplus energy to peers or the grid.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/BuySellScreenStyles.js';

// Dummy data for market demand
const DUMMY_DEMAND = {
  currentDemand: "250 kWh",
  activeBuyers: 12,
};

const DUMMY_MARKET_RATE = "0.20"; // in SOL/kWh

const translations = {
  en: {
    sellEnergy: "Sell Energy",
    yourListing: "Your Listing",
    setPrice: "Set Price (SOL/kWh):",
    availableKwh: "Available kWh:",
    acceptMarketRate: "Accept Market Rate?",
    liveDemand: "Live Demand",
    currentDemand: "Current Demand:",
    activeBuyers: "Active Buyers:",
    sellNow: "Sell Now",
    listingSuccessful: "Listing Successful",
    listingMessage: "Your energy is now listed for sale!",
    enterDetails: "Please enter a valid amount and price.",
    languageToggle: "EN → BN"
  },
  bn: {
    sellEnergy: "শক্তি বিক্রি করুন",
    yourListing: "আপনার তালিকা",
    setPrice: "মূল্য নির্ধারণ করুন (SOL/kWh):",
    availableKwh: "উপলভ্য kWh:",
    acceptMarketRate: "বাজারের হার গ্রহণ করবেন?",
    liveDemand: "লাইভ চাহিদা",
    currentDemand: "বর্তমান চাহিদা:",
    activeBuyers: "সক্রিয় ক্রেতা:",
    sellNow: "এখন বিক্রি করুন",
    listingSuccessful: "তালিকা সফল হয়েছে",
    listingMessage: "আপনার শক্তি এখন বিক্রির জন্য তালিকাভুক্ত করা হয়েছে!",
    enterDetails: "অনুগ্রহ করে একটি বৈধ পরিমাণ এবং মূল্য লিখুন।",
    languageToggle: "BN → EN"
  },
};

export default function SellEnergyScreen() {
  const [language, setLanguage] = useState("en");
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [useMarketRate, setUseMarketRate] = useState(false);

  const handleSellEnergy = () => {
    const finalPrice = useMarketRate ? DUMMY_MARKET_RATE : price;

    if (!amount || (finalPrice === '' && !useMarketRate)) {
      Alert.alert(translations[language].oops, translations[language].enterDetails);
      return;
    }

    console.log(`Listing ${amount} kWh at ${finalPrice} SOL/kWh`);

    Alert.alert(translations[language].listingSuccessful, translations[language].listingMessage);

    // Reset fields after submission
    setPrice('');
    setAmount('');
    setUseMarketRate(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{translations[language].sellEnergy}</Text>
          <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
            <Text style={styles.languageToggle}>{language === "en" ? "EN → BN" : "BN → EN"}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Demand Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{translations[language].liveDemand}</Text>
          <View style={styles.card}>
            <View style={styles.demandRow}>
              <Text style={styles.demandLabel}>{translations[language].currentDemand}</Text>
              <Text style={styles.demandValue}>{DUMMY_DEMAND.currentDemand}</Text>
            </View>
            <View style={styles.demandRow}>
              <Text style={styles.demandLabel}>{translations[language].activeBuyers}</Text>
              <Text style={styles.demandValue}>{DUMMY_DEMAND.activeBuyers}</Text>
            </View>
          </View>
        </View>

        {/* Your Listing Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{translations[language].yourListing}</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>{translations[language].availableKwh}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.0"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{translations[language].acceptMarketRate}</Text>
              <Switch
                onValueChange={setUseMarketRate}
                value={useMarketRate}
                thumbColor={useMarketRate ? "#27AE60" : "#FDFEFE"}
                trackColor={{ false: "#D5D8DC", true: "#85C1E9" }}
              />
            </View>

            <Text style={styles.inputLabel}>{translations[language].setPrice}</Text>
            <TextInput
              style={styles.input}
              placeholder={useMarketRate ? DUMMY_MARKET_RATE : "e.g., 0.20"}
              keyboardType="numeric"
              value={useMarketRate ? DUMMY_MARKET_RATE : price}
              onChangeText={setPrice}
              editable={!useMarketRate}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.buySellButton}
          onPress={handleSellEnergy}
        >
          <Text style={styles.buySellButtonText}>{translations[language].sellNow}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}