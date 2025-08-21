/**
 * Energy Dashboard Screen
 *
 * A comprehensive dashboard for monitoring and analyzing energy metrics,
 * including production, consumption, battery status, and environmental impact.
 *
 * @author Team GreyDevs
 */

import {React, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/EnergyDashboardStyles'; // Assuming styles are in a separate file

// --- DUMMY DATA (Simulating Backend Response) ---
const DUMMY_DATA = {
    realTimeMetrics: {
        production: 1.8, // kW
        consumption: 0.6, // kW
        gridFeedIn: 1.2, // kW (positive = selling, negative = buying)
        batteryCharge: 0.5, // kW (positive = charging, negative = discharging)
    },
    battery: {
        level: 85, // percentage
        status: 'Charging',
        health: 98, // percentage
        timeToFull: '1 hr 15 min',
    },
    grid: {
        status: 'Connected - Selling',
        voltage: 235.5, // V
        frequency: 50.1, // Hz
    },
    weather: {
        location: 'Dhaka',
        temperature: '33°C',
        condition: 'Sunny',
        solarIrradiance: 950, // W/m²
        prediction: 'High production expected until 4 PM.',
    },
    historical: {
        today: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8, 1.0], // Sample production data for 12 hours
        week: [25, 28, 22, 30, 27, 29, 31], // Daily production for a week
    },
    carbonFootprint: {
        savedToday: 2.5, // kg CO2
        totalSaved: 150.2, // kg CO2
        treesPlantedEquivalent: 7.5,
    },
    predictions: {
        nextHourProduction: '2.1 kWh',
        peakTime: '2:30 PM',
    }
};

// --- TRANSLATIONS ---
const translations = {
    en: {
        title: "Energy Dashboard",
        realTime: "Real-Time Metrics",
        production: "Production",
        consumption: "Consumption",
        gridFeed: "Grid Feed-In",
        batteryCharge: "Battery Charge",
        batteryStatus: "Battery Status",
        level: "Level",
        health: "Health",
        timeToFull: "Time to Full",
        gridStatus: "Grid Status",
        voltage: "Voltage",
        frequency: "Frequency",
        energyFlow: "Energy Flow",
        solar: "Solar",
        home: "Home",
        battery: "Battery",
        grid: "Grid",
        weather: "Weather & Forecast",
        solarIrradiance: "Solar Irradiance",
        historicalData: "Historical Data",
        today: "Today",
        week: "Week",
        month: "Month",
        carbonFootprint: "Carbon Footprint",
        co2Saved: "CO₂ Saved Today",
        totalSaved: "Total Saved",
        equivalentTrees: "Equivalent Trees Planted",
        predictions: "Predictive Analytics",
        nextHour: "Next Hour Production",
        peakTime: "Est. Peak Time",
        export: "Export Summary",
    },
    bn: {
        title: "এনার্জি ড্যাশবোর্ড",
        realTime: "রিয়েল-টাইম মেট্রিক্স",
        production: "উৎপাদন",
        consumption: "খরচ",
        gridFeed: "গ্রিড ফিড-ইন",
        batteryCharge: "ব্যাটারি চার্জ",
        batteryStatus: "ব্যাটারির অবস্থা",
        level: "স্তর",
        health: "স্বাস্থ্য",
        timeToFull: "সম্পূর্ণ চার্জ হতে সময়",
        gridStatus: "গ্রিডের অবস্থা",
        voltage: "ভোল্টেজ",
        frequency: "ফ্রিকোয়েন্সি",
        energyFlow: "এনার্জি ফ্লো",
        solar: "সৌর",
        home: "বাসা",
        battery: "ব্যাটারি",
        grid: "গ্রিড",
        weather: "আবহাওয়া ও পূর্বাভাস",
        solarIrradiance: "সৌর বিকিরণ",
        historicalData: "ঐতিহাসিক ডেটা",
        today: "আজ",
        week: "সপ্তাহ",
        month: "মাস",
        carbonFootprint: "কার্বন ফুটপ্রিন্ট",
        co2Saved: "আজ CO₂ সংরক্ষিত",
        totalSaved: "মোট সংরক্ষিত",
        equivalentTrees: "সমতুল্য বৃক্ষরোপণ",
        predictions: " ভবিষ্যদ্বাণীমূলক বিশ্লেষণ",
        nextHour: "পরবর্তী ঘন্টার উৎপাদন",
        peakTime: "আনুমানিক পিক সময়",
        export: "সারাংশ এক্সপোর্ট করুন",
    }
};

export default function EnergyDashboardScreen() {
    const [language, setLanguage] = useState("en");
    const [timeframe, setTimeframe] = useState('today');
    const t = translations[language]; // Shortcut for translations

    // --- RENDER FUNCTIONS FOR EACH SECTION ---

    const renderMetricCard = (icon, label, value, unit, color) => (
        <View style={styles.metricCard}>
            <Feather name={icon} size={24} color={color || '#333'} />
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value} <Text style={styles.metricUnit}>{unit}</Text></Text>
        </View>
    );
    
    // Placeholder for a chart component
    const renderProductionChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t.production} ({timeframe})</Text>
            <View style={styles.chartPlaceholder}>
                {/* In a real app, you would use a library like react-native-svg-charts here */}
                <Text style={styles.chartPlaceholderText}>[Production Chart Placeholder]</Text>
            </View>
        </View>
    );
    
    const renderEnergyFlowDiagram = () => (
        <View style={[styles.card, styles.cardShadow]}>
            <Text style={styles.sectionTitle}>{t.energyFlow}</Text>
            <View style={styles.flowDiagram}>
                {/* Nodes */}
                <View style={styles.flowNodeContainer}>
                    <View style={styles.flowNode}><Feather name="sun" size={24} color="#FFC107" /><Text style={styles.nodeText}>{t.solar}</Text></View>
                    <View style={styles.flowNode}><Feather name="home" size={24} color="#2196F3" /><Text style={styles.nodeText}>{t.home}</Text></View>
                    <View style={styles.flowNode}><Feather name="battery-charging" size={24} color="#4CAF50" /><Text style={styles.nodeText}>{t.battery}</Text></View>
                    <View style={styles.flowNode}><MaterialCommunityIcons name="transmission-tower" size={24} color="#F44336" /><Text style={styles.nodeText}>{t.grid}</Text></View>
                </View>
                {/* Arrows (simplified representation) */}
                <Text style={styles.flowArrow}>➔</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t.title}</Text>
                    <TouchableOpacity onPress={() => setLanguage(language === "en" ? "bn" : "en")}>
                        <Text style={styles.langToggle}>{language === "en" ? "EN/BN" : "BN/EN"}</Text>
                    </TouchableOpacity>
                </View>

                {/* --- REAL-TIME METRICS --- */}
                <View style={[styles.card, styles.cardShadow]}>
                    <Text style={styles.sectionTitle}>{t.realTime}</Text>
                    <View style={styles.metricsGrid}>
                        {renderMetricCard("sunrise", t.production, DUMMY_DATA.realTimeMetrics.production, "kW", "#4CAF50")}
                        {renderMetricCard("zap", t.consumption, DUMMY_DATA.realTimeMetrics.consumption, "kW", "#FFC107")}
                        {renderMetricCard("chevrons-up", t.gridFeed, DUMMY_DATA.realTimeMetrics.gridFeedIn, "kW", "#2196F3")}
                        {renderMetricCard("battery-charging", t.batteryCharge, DUMMY_DATA.realTimeMetrics.batteryCharge, "kW", "#9C27B0")}
                    </View>
                </View>

                {/* --- BATTERY & GRID STATUS --- */}
                <View style={styles.twoColumnContainer}>
                    <View style={[styles.card, styles.cardShadow, styles.columnCard]}>
                        <Text style={styles.sectionTitle}>{t.batteryStatus}</Text>
                        <Text style={styles.batteryLevel}>{DUMMY_DATA.battery.level}%</Text>
                        <Text style={styles.batteryStatusText}>{DUMMY_DATA.battery.status}</Text>
                        <View style={styles.detailRow}><Text>{t.health}: {DUMMY_DATA.battery.health}%</Text></View>
                        <View style={styles.detailRow}><Text>{t.timeToFull}: {DUMMY_DATA.battery.timeToFull}</Text></View>
                    </View>
                    <View style={[styles.card, styles.cardShadow, styles.columnCard]}>
                        <Text style={styles.sectionTitle}>{t.gridStatus}</Text>
                        <Text style={styles.gridStatusText}>{DUMMY_DATA.grid.status}</Text>
                        <View style={styles.detailRow}><Text>{t.voltage}: {DUMMY_DATA.grid.voltage} V</Text></View>
                        <View style={styles.detailRow}><Text>{t.frequency}: {DUMMY_DATA.grid.frequency} Hz</Text></View>
                    </View>
                </View>

                {/* --- ENERGY FLOW DIAGRAM --- */}
                {renderEnergyFlowDiagram()}

                {/* --- HISTORICAL DATA CHART --- */}
                <View style={[styles.card, styles.cardShadow]}>
                    <Text style={styles.sectionTitle}>{t.historicalData}</Text>
                     <View style={styles.timeframeSelector}>
                        <TouchableOpacity onPress={() => setTimeframe('today')} style={[styles.timeframeButton, timeframe === 'today' && styles.timeframeActive]}>
                            <Text style={[styles.timeframeText, timeframe === 'today' && styles.timeframeActiveText]}>{t.today}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTimeframe('week')} style={[styles.timeframeButton, timeframe === 'week' && styles.timeframeActive]}>
                            <Text style={[styles.timeframeText, timeframe === 'week' && styles.timeframeActiveText]}>{t.week}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTimeframe('month')} style={[styles.timeframeButton, timeframe === 'month' && styles.timeframeActive]}>
                            <Text style={[styles.timeframeText, timeframe === 'month' && styles.timeframeActiveText]}>{t.month}</Text>
                        </TouchableOpacity>
                    </View>
                    {renderProductionChart()}
                </View>

                {/* --- WEATHER WIDGET --- */}
                <View style={[styles.card, styles.cardShadow]}>
                    <Text style={styles.sectionTitle}>{t.weather}</Text>
                    <View style={styles.weatherInfo}>
                        <Feather name="sun" size={40} color="#FFC107" />
                        <View>
                            <Text style={styles.weatherTemp}>{DUMMY_DATA.weather.temperature}</Text>
                            <Text style={styles.weatherLocation}>{DUMMY_DATA.weather.location}</Text>
                        </View>
                    </View>
                    <Text style={styles.weatherPrediction}>{DUMMY_DATA.weather.prediction}</Text>
                </View>
                
                {/* --- CARBON FOOTPRINT --- */}
                <View style={[styles.card, styles.cardShadow]}>
                    <Text style={styles.sectionTitle}>{t.carbonFootprint}</Text>
                     <View style={styles.metricsGrid}>
                        {renderMetricCard("activity", t.co2Saved, DUMMY_DATA.carbonFootprint.savedToday, "kg", "#4CAF50")}
                        {renderMetricCard("bar-chart", t.totalSaved, DUMMY_DATA.carbonFootprint.totalSaved, "kg", "#2196F3")}
                        {renderMetricCard("git-merge", t.equivalentTrees, DUMMY_DATA.carbonFootprint.treesPlantedEquivalent, "", "#9C27B0")}
                    </View>
                </View>

                {/* --- PREDICTIVE ANALYTICS --- */}
                <View style={[styles.card, styles.cardShadow]}>
                    <Text style={styles.sectionTitle}>{t.predictions}</Text>
                     <View style={styles.detailRow}><Text>{t.nextHour}: {DUMMY_DATA.predictions.nextHourProduction}</Text></View>
                     <View style={styles.detailRow}><Text>{t.peakTime}: {DUMMY_DATA.predictions.peakTime}</Text></View>
                </View>

                {/* --- EXPORT BUTTON --- */}
                <TouchableOpacity style={styles.exportButton}>
                    <Feather name="download" size={20} color="#fff" />
                    <Text style={styles.exportButtonText}>{t.export}</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
