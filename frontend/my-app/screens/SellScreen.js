/**
 * Sell Energy Screen
 *
 * Screen for selling surplus energy to peers or the grid.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/BuySellScreenStyles.js';
import config from '../assets/config';

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
    oops: "Oops!",
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
    oops: "দুঃখিত!",
    languageToggle: "BN → EN"
  },
};

export default function SellEnergyScreen() {
  const [language, setLanguage] = useState("en");
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [useMarketRate, setUseMarketRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSellEnergy = async () => {
    const finalPrice = useMarketRate ? DUMMY_MARKET_RATE : price;

    if (!amount || (finalPrice === '' && !useMarketRate)) {
      Alert.alert(translations[language].oops, translations[language].enterDetails);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/energy/sell`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          energyAmount: amount,
          pricePerKwh: finalPrice,
          duration: 24, // Default 24 hours
          location: 'Grid-Zone-A', // Default location
          energySource: 'Solar' // Default energy source
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          translations[language].listingSuccessful, 
          `${translations[language].listingMessage}\n\nTransaction Hash: ${data.data.transactionHash?.substring(0, 10)}...`
        );

        // Reset fields after successful submission
        setPrice('');
        setAmount('');
        setUseMarketRate(false);
      } else {
        Alert.alert("Error", data.error || "Failed to create sell offer");
      }
    } catch (error) {
      console.error("Error creating sell offer:", error);
      Alert.alert("Error", "Failed to create sell offer. Check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UniversalSafeArea style={styles.safeArea}>
      <StatusBar style="dark" />
      <UniversalScrollContainer 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
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
          style={[styles.buySellButton, { opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSellEnergy}
          disabled={isSubmitting}
        >
          <Text style={styles.buySellButtonText}>
            {isSubmitting ? "Creating Offer..." : translations[language].sellNow}
          </Text>
        </TouchableOpacity>
      </UniversalScrollContainer>
    </UniversalSafeArea>
  );
}