import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F4F8',
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
        marginBottom: 10,
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
        marginBottom: 15,
    },
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    listHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        marginLeft: 5,
    },
    // User Card Styles
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userDistance: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    sellingBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    buyingBadge: {
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12,
        color: '#333',
    },
    userDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    tradeButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
    },
    tradeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Map Card Styles
    map: {
        width: '100%',
        height: 400, // Must have fixed height
    },
    mapContainer: {
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden', // Important for rounded corners
    },


    mapCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6', // A nice blue
        padding: 20,
    },
    mapIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 25,
        marginRight: 15,
    },
    mapTextContainer: {
        flex: 1,
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    mapDesc: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    // Trade History Styles
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 5,
    },
    historyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyDetails: {
        flex: 1,
        marginLeft: 15,
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyDate: {
        fontSize: 12,
        color: '#666',
    },
    historyValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    noHistoryText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 30,
        fontSize: 16,
    },
});

export default styles;
