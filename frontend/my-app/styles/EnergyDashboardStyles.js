import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F4F8', // Light background color
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1C2A3A',
    },
    langToggle: {
        fontWeight: 'bold',
        color: '#007AFF',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
    },
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    metricValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    metricUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666',
    },
    twoColumnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    columnCard: {
        width: '48%',
    },
    batteryLevel: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
    },
    batteryStatusText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#4CAF50',
        marginBottom: 10,
    },
    gridStatusText: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        color: '#2196F3',
        marginVertical: 10,
    },
    detailRow: {
        marginTop: 8,
    },
    flowDiagram: {
        alignItems: 'center',
    },
    flowNodeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    flowNode: {
        alignItems: 'center',
    },
    nodeText: {
        marginTop: 5,
        fontSize: 12,
    },
    flowArrow: {
        fontSize: 30,
        color: '#ccc',
        marginVertical: -10,
    },
    chartContainer: {
        marginTop: 10,
    },
    chartTitle: {
        textAlign: 'center',
        marginBottom: 10,
        color: '#666',
    },
    chartPlaceholder: {
        flexDirection: 'row', // <--- This is the key change
        justifyContent: 'space-between', // Or 'space-around', 'flex-start'
        alignItems: 'flex-end', // <--- Align the whole set of bars to the bottom
        height: 150, // Match the MAX_CHART_HEIGHT used in the component
        width: '100%',
        paddingHorizontal: 10,
    },
    chartPlaceholderText: {
        color: '#ADB5BD',
    },
    timeframeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        padding: 4,
        marginBottom: 15,
    },
    timeframeButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    timeframeActive: {
        backgroundColor: '#FFFFFF',
    },
    timeframeText: {
        fontWeight: '600',
        color: '#333',
    },
    timeframeActiveText: {
        color: '#007AFF',
    },
    weatherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherTemp: {
        fontSize: 36,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    weatherLocation: {
        marginLeft: 15,
        color: '#666',
    },
    weatherPrediction: {
        textAlign: 'center',
        marginTop: 15,
        fontStyle: 'italic',
        color: '#333',
    },
    exportButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default styles;
