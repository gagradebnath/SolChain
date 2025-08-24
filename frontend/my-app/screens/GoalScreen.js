

import React, { useState , useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../assets/config';
import { SafeAreaView } from 'react-native';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/GamificationStyles';



// --- TRANSLATIONS ---
const translations = {
    en: {
        title: 'Goals & Rewards',
        goals: 'My Goals',
        badges: 'My Badges',
        leaderboard: 'Community Leaderboard',
        rank: 'Rank',
        points: 'Points',
    },
    bn: {
        title: 'লক্ষ্য ও পুরস্কার',
        goals: 'আমার লক্ষ্য',
        badges: 'আমার ব্যাজ',
        leaderboard: 'কমিউনিটি লিডারবোর্ড',
        rank: 'র‍্যাঙ্ক',
        points: 'পয়েন্ট',
    },
};

export default function GamificationScreen() {
    const [language, setLanguage] = useState("en");
    const t = translations[language];
    const [BADGES, setBADGES] = useState([]);
    const [LEADERBOARD, setLEADERBOARD] = useState([]);
    const [GOALS, setGOALS] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}/goals`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch notifications');
            }

            setGOALS(data.goals);
            setBADGES(data.badges);
            setLEADERBOARD(data.leaderboard);
            setIsLoaded(data.success);
        } catch (err) {
            console.error("Error fetching goals:", err);
            Alert.alert("Error", "Failed to fetch goals. Check your network connection.");
        }
    }

    if (!isLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading goals...</Text>
            </SafeAreaView>
        );
    }

    const renderGoalItem = ({ item }) => (
        <View style={[styles.goalCard, styles.cardShadow]}>
            <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalProgressText}>{item.current}/{item.target} {item.unit}</Text>
            </View>
            <Progress.Bar
                progress={item.current / item.target}
                width={null}
                color={item.color}
                unfilledColor="#E0E0E0"
                borderWidth={0}
                borderRadius={10}
                style={styles.progressBar}
            />
        </View>
    );

    const renderBadgeItem = ({ item }) => (
        <View style={styles.badgeCard}>
            <Feather name={item.icon} size={32} color="#007AFF" />
            <Text style={styles.badgeName}>{item.name}</Text>
            <Text style={styles.badgeDescription}>{item.description}</Text>
        </View>
    );

    const renderLeaderboardItem = ({ item }) => (
        <View style={[styles.leaderboardItem, item.isUser && styles.userLeaderboardItem]}>
            <Text style={styles.leaderboardRank}>{item.rank}</Text>
            <Text style={styles.leaderboardName}>{item.name}</Text>
            <Text style={styles.leaderboardPoints}>{item.points} {t.points}</Text>
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
            >
                {/* Goals Section */}
                <Text style={styles.sectionTitle}>{t.goals}</Text>
                <FlatList
                    data={GOALS}
                    renderItem={renderGoalItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                />

                {/* Badges Section */}
                <Text style={styles.sectionTitle}>{t.badges}</Text>
                <FlatList
                    data={BADGES}
                    renderItem={renderBadgeItem}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.badgesContainer}
                />

                {/* Leaderboard Section */}
                <Text style={styles.sectionTitle}>{t.leaderboard}</Text>
                <View style={[styles.leaderboardCard, styles.cardShadow]}>
                    <FlatList
                        data={LEADERBOARD}
                        renderItem={renderLeaderboardItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                </View>
            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}