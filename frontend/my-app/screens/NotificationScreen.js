/**
 * Notification Screen
 *
 * Displays user notifications, categorized by date,
 * using a single FlatList to avoid nested VirtualizedLists warnings.
 *
 * @author Team GreyDevs
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../assets/config';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import UniversalSafeArea from '../components/UniversalSafeArea';
import styles from '../styles/NotificationStyles';

// ICON MAPPING
const getIconForType = (type) => {
    switch (type) {
        case 'trade': return 'refresh-ccw';
        case 'transaction': return 'dollar-sign';
        case 'news': return 'book-open';
        case 'update': return 'check-circle';
        default: return 'info';
    }
};

// TRANSLATIONS
const translations = {
    en: {
        title: 'Notifications',
        today: 'Today',
        yesterday: 'Yesterday',
        markAllAsRead: 'Mark All as Read',
    },
    bn: {
        title: 'নোটিফিকেশন',
        today: 'আজ',
        yesterday: 'গতকাল',
        markAllAsRead: 'সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন',
    },
};

export default function NotificationScreen() {
    const [language, setLanguage] = useState("en");
    const t = translations[language];
    const [notifications, setNotifications] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}/notifications`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch notifications');
            }
            // Sort by timestamp in descending order (most recent first)
            const sortedNotifications = data.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(sortedNotifications);
            setIsLoaded(data.success);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            Alert.alert("Error", "Failed to fetch notifications. Check your network connection.");
        }
    }

    const markAsRead = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${config.API_BASE_URL}/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            // Update local state only after successful API call
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Error marking notification as read:", err);
            Alert.alert("Error", "Failed to update notification status. Try again.");
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${config.API_BASE_URL}/notifications/read/all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            // Update local state after successful API call
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Error marking all as read:", err);
            Alert.alert("Error", "Failed to update all notifications. Try again.");
        }
    };

    const getFormattedDateLabel = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
    
        const notificationDate = new Date(date);
    
        if (notificationDate.toDateString() === today.toDateString()) {
            return t.today;
        }
        if (notificationDate.toDateString() === yesterday.toDateString()) {
            return t.yesterday;
        }
    
        return notificationDate.toLocaleDateString(language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const groupNotificationsByDate = (notifList) => {
        if (!notifList.length) return [];
        const grouped = {};
        notifList.forEach(notif => {
            const date = new Date(notif.timestamp).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(notif);
        });
    
        const flatListItems = [];
        const todayDate = new Date().toDateString();
        
        // Check for 'today' and add 'mark all as read' button if unread notifications exist
        if (grouped[todayDate] && grouped[todayDate].some(n => !n.isRead)) {
            flatListItems.push({
                type: 'header',
                label: getFormattedDateLabel(todayDate),
                id: `header-${todayDate}`,
                markAll: markAllAsRead,
            });
        } else if (grouped[todayDate]) {
            flatListItems.push({
                type: 'header',
                label: getFormattedDateLabel(todayDate),
                id: `header-${todayDate}`,
            });
        }
        if (grouped[todayDate]) {
            flatListItems.push(...grouped[todayDate]);
            delete grouped[todayDate];
        }

        // Add remaining dates in descending order
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        sortedDates.forEach(date => {
            flatListItems.push({
                type: 'header',
                label: getFormattedDateLabel(date),
                id: `header-${date}`,
            });
            flatListItems.push(...grouped[date]);
        });
    
        return flatListItems;
    };
    

    const flatListData = groupNotificationsByDate(notifications);

  
    if (!isLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading notifications...</Text>
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{item.label}</Text>
                    {item.markAll && (
                        <TouchableOpacity onPress={item.markAll}>
                            <Text style={styles.markAllText}>{t.markAllAsRead}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                onPress={() => markAsRead(item.id)}
                disabled={item.isRead}
            >
                <View style={[styles.iconContainer, !item.isRead && styles.unreadIcon]}>
                    <Feather name={getIconForType(item.type)} size={24} color={item.isRead ? '#999' : '#fff'} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                </View>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <UniversalSafeArea style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                    <Text style={styles.langToggle}>{language === "en" ? "EN/BN" : "BN/EN"}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={flatListData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
            />
        </UniversalSafeArea>
    );
}