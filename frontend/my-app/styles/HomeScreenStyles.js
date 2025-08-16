import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  // Section layout
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: (width - 60) / 4, // 60 for padding, 4 for items
    height: (width - 60) / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    marginTop: 5,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Energy Overview
  energyCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 3,
    alignItems: 'center',
  },
  energyCardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    color: '#333',
  },
  energyCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  // Recent Activity
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  activityDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Weather & Market
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 5,
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666',
  },
  weatherLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  marketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    justifyContent: 'center',
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  marketLabel: {
    fontSize: 14,
    color: '#666',
  },
  marketValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Goals Section
  goalItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalProgressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
});

export default styles;