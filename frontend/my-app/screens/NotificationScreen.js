/**
 * Notification Screen
 *
 * Displays a list of user notifications, categorized by unread and read.
 * This screen is designed to be clean, professional, and easy to use.
 *
 * @author Team GreyDevs
 */

import React, { useState , useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../assets/config';
import { SafeAreaView } from 'react-native';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import UniversalSafeArea from '../components/UniversalSafeArea';
import UniversalScrollContainer from '../components/UniversalScrollContainer';
import styles from '../styles/NotificationStyles'; // Ensure you have this file


// --- ICON MAPPING ---
const getIconForType = (type) => {
    switch (type) {
        case 'trade':
            return 'refresh-ccw';
        case 'transaction':
            return 'dollar-sign';
        case 'news':
            return 'book-open';
        case 'update':
            return 'check-circle';
        default:
            return 'info';
    }
};

// --- TRANSLATIONS ---
const translations = {
    en: {
        title: 'Notifications',
        unread: 'Unread',
        read: 'Read',
        markAllAsRead: 'Mark All as Read',
    },
    bn: {
        title: 'নোটিফিকেশন',
        unread: 'অপাঠিত',
        read: 'পঠিত',
        markAllAsRead: 'সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন',
    },
};

export default function NotificationScreen() {
    const [language, setLanguage] = useState("en");
    const t = translations[language];
    const [notifications, setNotifications] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${config.API_BASE_URL}/notifications`, {
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

            setNotifications(data.data);
            setIsLoaded(data.success);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            Alert.alert("Error", "Failed to fetch notifications. Check your network connection.");
        }
    }

    if (!isLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading notifications...</Text>
            </SafeAreaView>
        );
    }


    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
            disabled={item.isRead}
        >
            <View style={[styles.iconContainer, !item.isRead && styles.unreadIcon]}>
                <Feather
                    name={getIconForType(item.type)}
                    size={24}
                    color={item.isRead ? '#999' : '#fff'}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
        </TouchableOpacity>
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
                {unreadNotifications.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t.unread}</Text>
                            <TouchableOpacity onPress={markAllAsRead}>
                                <Text style={styles.markAllText}>{t.markAllAsRead}</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={unreadNotifications}
                            renderItem={renderNotificationItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {readNotifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.read}</Text>
                        <FlatList
                            data={readNotifications}
                            renderItem={renderNotificationItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </UniversalScrollContainer>
        </UniversalSafeArea>
    );
}