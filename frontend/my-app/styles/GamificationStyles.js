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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 15,
    },
    // Goals
    goalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    goalProgressText: {
        fontSize: 14,
        color: '#666',
    },
    progressBar: {
        height: 10,
    },
    // Badges
    badgesContainer: {
        paddingVertical: 10,
    },
    badgeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginRight: 15,
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    badgeDescription: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 5,
    },
    // Leaderboard
    leaderboardCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },
    leaderboardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    userLeaderboardItem: {
        backgroundColor: '#E0F2F1',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    leaderboardRank: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        width: 40,
        textAlign: 'center',
    },
    leaderboardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginLeft: 15,
    },
    leaderboardPoints: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
});

export default styles;