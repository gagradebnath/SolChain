/**
 * Notification Screen
 *
 * Displays a list of user notifications, categorized by unread and read.
 * This screen is designed to be clean, professional, and easy to use.
 *
 * @author Team GreyDevs
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/NotificationStyles'; // Ensure you have this file

// --- DUMMY DATA (from backend) ---
const DUMMY_NOTIFICATIONS = [
    {
        id: '1',
        title: 'New Trade Alert!',
        message: 'You have a new energy trade request from Aarav Chowdhury.',
        type: 'trade',
        timestamp: '2m ago',
        isRead: false,
    },
    {
        id: '2',
        title: 'Transaction Confirmed',
        message: 'Your sale of 2.5 kWh to Fahim H. was successful. +0.5 SOL added to your wallet.',
        type: 'transaction',
        timestamp: '15m ago',
        isRead: false,
    },
    {
        id: '3',
        title: 'Community News',
        message: 'A new policy on energy trading was just announced.',
        type: 'news',
        timestamp: '1h ago',
        isRead: false,
    },
    {
        id: '4',
        title: 'Network Update',
        message: 'Your solar generation data for August 2025 has been successfully synced.',
        type: 'update',
        timestamp: '3h ago',
        isRead: true,
    },
    {
        id: '5',
        title: 'Trade Completed',
        message: 'Your purchase of 1.2 kWh from Bina A. is now complete.',
        type: 'transaction',
        timestamp: '1d ago',
        isRead: true,
    },
    {
        id: '6',
        title: 'Welcome to SolChain!',
        message: 'Your account has been successfully created. Explore the app to get started.',
        type: 'info',
        timestamp: '2d ago',
        isRead: true,
    },
];

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
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
    const [language, setLanguage] = useState("en");
    const t = translations[language];

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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                    <Text style={styles.langToggle}>{language === "en" ? "EN/BN" : "BN/EN"}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
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
            </View>
        </SafeAreaView>
    );
}