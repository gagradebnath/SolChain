

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/GamificationStyles';

const DUMMY_GOALS = [
    { id: '1', title: 'Monthly Savings Target', current: 150, target: 200, unit: 'SOL', color: '#4CAF50' },
    { id: '2', title: 'Weekly Earnings Target', current: 80, target: 100, unit: 'SOL', color: '#007AFF' },
    { id: '3', title: 'Carbon Offset Goal', current: 75, target: 100, unit: 'CC', color: '#9E9D24' },
];

const DUMMY_BADGES = [
    { id: '1', name: 'Green Contributor', description: 'Offset 100 kg of carbon.', icon: 'gift' },
    { id: '2', name: 'Top Seller', description: 'Sold over 500 kWh of energy.', icon: 'award' },
    { id: '3', name: 'First Trade', description: 'Completed your first peer-to-peer trade.', icon: 'zap' },
];

const DUMMY_LEADERBOARD = [
    { id: '1', name: 'You', rank: 1, points: 520, isUser: true },
    { id: '2', name: 'Aarav Chowdhury', rank: 2, points: 480 },
    { id: '3', name: 'Bina Akter', rank: 3, points: 455 },
    { id: '4', name: 'Fahim Hasan', rank: 4, points: 410 },
    { id: '5', name: 'Rahim Khan', rank: 5, points: 390 },
];

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
                    data={DUMMY_GOALS}
                    renderItem={renderGoalItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                />

                {/* Badges Section */}
                <Text style={styles.sectionTitle}>{t.badges}</Text>
                <FlatList
                    data={DUMMY_BADGES}
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
                        data={DUMMY_LEADERBOARD}
                        renderItem={renderLeaderboardItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                </View>
            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}