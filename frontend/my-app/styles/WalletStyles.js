import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    langToggle: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    container: {
        flex: 1,
        padding: 15,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Balance Card
    balanceCard: {
        backgroundColor: '#007AFF',
        borderRadius: 15,
        padding: 25,
        marginBottom: 20,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    solBalance: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 5,
    },
    energyCredits: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    // Wallet Actions
    walletActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        width: '30%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        marginTop: 5,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    // Transaction History
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    transactionDetails: {
        flex: 1,
        marginLeft: 15,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionAmount: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    transactionValueContainer: {
        alignItems: 'flex-end',
    },
    transactionValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionTimestamp: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});

export default styles;