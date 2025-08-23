/**
 * Community / P2P Network Screen
 *
 * Displays a list of nearby users for P2P energy trading,
 * an optional map view, and trading history with peers.
 *
 * @author Team GreyDevs
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/CommunityStyles';

let MapViewComponent = null;
let MarkerComponent = null;
let CalloutComponent = null;

// --- DUMMY DATA with Coordinates ---
const DUMMY_USERS = [
  { id: '1', name: 'Aarav Chowdhury', distance: '0.5 km away', status: 'Selling', rate: '0.22 SOL/kWh', trustScore: 95, avatar: 'https://i.pravatar.cc/150?u=aaron', coordinate: { latitude: 23.8153, longitude: 90.4105 } },
  { id: '2', name: 'Bina Akter', distance: '0.8 km away', status: 'Buying', rate: '0.24 SOL/kWh', trustScore: 88, avatar: 'https://i.pravatar.cc/150?u=bina', coordinate: { latitude: 23.8053, longitude: 90.4155 } },
  { id: '3', name: 'Fahim Hasan', distance: '1.2 km away', status: 'Selling', rate: '0.21 SOL/kWh', trustScore: 98, avatar: 'https://i.pravatar.cc/150?u=fahim', coordinate: { latitude: 23.8103, longitude: 90.4225 } },
];

const DUMMY_TRADE_HISTORY = {
  '1': [
    { id: 't1', type: 'buy', amount: '2.5 kWh', value: '-0.55 SOL', date: '2025-08-20' },
    { id: 't2', type: 'sell', amount: '5.0 kWh', value: '+1.10 SOL', date: '2025-08-18' },
  ],
  '3': [
    { id: 't3', type: 'sell', amount: '3.0 kWh', value: '+0.63 SOL', date: '2025-08-21' },
  ]
};

// --- TRANSLATIONS ---
const translations = {
  en: { title: "Community Network", nearby: "Nearby Users", history: "Trade History", mapView: "Switch to Map View", listView: "Switch to List View", selling: "Selling", buying: "Buying", rate: "Rate", trust: "Trust", trade: "Trade", noHistory: "No trade history with this user yet.", back: "Back to Users", myLocation: "You (My Location)" },
  bn: { title: "কমিউনিটি নেটওয়ার্ক", nearby: "কাছাকাছি ব্যবহারকারী", history: "ট্রেড ইতিহাস", mapView: "ম্যাপ ভিউতে যান", listView: "তালিকা ভিউতে যান", selling: "বিক্রি হচ্ছে", buying: "কেনা হচ্ছে", rate: "দর", trust: "বিশ্বাস", trade: "ট্রেড", noHistory: "এই ব্যবহারকারীর সাথে এখনো কোনো ট্রেড ইতিহাস নেই।", back: "ব্যবহারকারীদের কাছে ফিরে যান", myLocation: "আপনি (আমার অবস্থান)" }
};

// --- DUMMY USER LOCATION ---
const MY_LOCATION = { latitude: 23.8103, longitude: 90.4125 };

export default function CommunityScreen() {
  const [language, setLanguage] = useState("en");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMapView, setIsMapView] = useState(false);
  const t = translations[language];

  const scrollViewRef = useRef();
  
  // New state to manage map component loading
  const [mapLoaded, setMapLoaded] = useState(false);

  // Use useEffect to load the map components dynamically
  useEffect(() => {
    async function loadMaps() {
      if (Platform.OS !== 'web') {
        try {
          const maps = await import('react-native-maps');
          MapViewComponent = maps.default;
          MarkerComponent = maps.Marker;
          CalloutComponent = maps.Callout;
          setMapLoaded(true);
        } catch (error) {
          console.warn("react-native-maps failed to load", error);
        }
      }
    }
    loadMaps();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (scrollViewRef.current) {
      setTimeout(() => { scrollViewRef.current.scrollToEnd({ animated: true }); }, 100);
    }
  };
  
  const handleBack = () => setSelectedUser(null);

  const renderSelectedUserInfo = () => {
    if (!selectedUser) return null;
    return (
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={16} color="#007AFF" />
          <Text style={styles.backButtonText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.historyTitle}>User: {selectedUser.name}</Text>
        <View style={[styles.card, styles.cardShadow, { marginBottom: 15 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: selectedUser.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>{selectedUser.name}</Text>
              <Text style={styles.userDistance}>{selectedUser.distance}</Text>
            </View>
            <View style={[styles.statusBadge, selectedUser.status === 'Selling' ? styles.sellingBadge : styles.buyingBadge, { marginLeft: 'auto' }]}>
              <Text style={styles.statusText}>{selectedUser.status === 'Selling' ? t.selling : t.buying}</Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>{t.rate}</Text><Text style={styles.detailValue}>{selectedUser.rate}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>{t.trust}</Text><Text style={styles.detailValue}>{selectedUser.trustScore}%</Text></View>
            <TouchableOpacity style={styles.tradeButton}><Text style={styles.tradeButtonText}>{t.trade}</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.historyTitle}>{t.history}</Text>
        {DUMMY_TRADE_HISTORY[selectedUser.id]?.length > 0 ? (
          DUMMY_TRADE_HISTORY[selectedUser.id].map(trade => (
            <View key={trade.id} style={[styles.card, styles.cardShadow, styles.historyCard]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Feather name={trade.type === 'buy' ? 'arrow-down-left' : 'arrow-up-right'} size={24} color={trade.type === 'buy' ? '#F44336' : '#4CAF50'} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.historyAmount}>{trade.amount}</Text>
                  <Text style={styles.historyDate}>{trade.date}</Text>
                </View>
                <Text style={[styles.historyValue, { color: trade.type === 'buy' ? '#F44336' : '#4CAF50' }]}>{trade.value}</Text>
              </View>
            </View>
          ))
        ) : <Text style={styles.noHistoryText}>{t.noHistory}</Text>}
      </View>
    );
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity style={[styles.card, styles.cardShadow]} onPress={() => handleSelectUser(item)}>
      <View style={styles.userHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userDistance}>{item.distance}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'Selling' ? styles.sellingBadge : styles.buyingBadge]}>
          <Text style={styles.statusText}>{item.status === 'Selling' ? t.selling : t.buying}</Text>
        </View>
      </View>
      <View style={styles.userDetails}>
        <View style={styles.detailItem}><Text style={styles.detailLabel}>{t.rate}</Text><Text style={styles.detailValue}>{item.rate}</Text></View>
        <View style={styles.detailItem}><Text style={styles.detailLabel}>{t.trust}</Text><Text style={styles.detailValue}>{item.trustScore}%</Text></View>
        <TouchableOpacity style={styles.tradeButton}><Text style={styles.tradeButtonText}>{t.trade}</Text></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderMapView = () => {
    if (!mapLoaded) {
      return (
        <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Loading map...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.mapContainer}>
        <MapViewComponent
          style={styles.map}
          initialRegion={{
            latitude: MY_LOCATION.latitude,
            longitude: MY_LOCATION.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <MarkerComponent coordinate={MY_LOCATION}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=myself' }}
              style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#007AFF' }}
            />
            <CalloutComponent>
              <View style={[styles.calloutContainer, styles.cardShadow]}>
                <Text style={styles.calloutName}>{translations[language].myLocation}</Text>
              </View>
            </CalloutComponent>
          </MarkerComponent>

          {DUMMY_USERS.map(user => (
            <MarkerComponent
              key={user.id}
              coordinate={user.coordinate}
              onPress={() => handleSelectUser(user)}
            >
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: user.status === 'Selling' ? 'green' : 'red' }}
              />
            </MarkerComponent>
          ))}
        </MapViewComponent>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsMapView(false)}>
          <Feather name="list" size={20} color="#333" />
          <Text style={styles.toggleButtonText}>{translations[language].listView}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListView = () => (
    <>
      <TouchableOpacity style={[styles.card, styles.mapCard]} onPress={() => setIsMapView(true)}>
        <View style={styles.mapIconContainer}><Feather name="map" size={24} color="#fff" /></View>
        <View style={styles.mapTextContainer}><Text style={styles.mapTitle}>{t.mapView}</Text></View>
        <Feather name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.listHeader}>{t.nearby}</Text>
      {DUMMY_USERS.map((item) => renderUserCard({ item }))}
    </>
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
        ref={scrollViewRef} 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false} 
        scrollEnabled={!isMapView || !!selectedUser}
      >
        {isMapView ? renderMapView() : renderListView()}
        {isMapView && selectedUser && renderSelectedUserInfo()}
      </UniversalScrollContainer>
    </UniversalSafeArea>
  );
}