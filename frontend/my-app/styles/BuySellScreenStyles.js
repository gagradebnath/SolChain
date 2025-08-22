// styles/BuySellScreenStyles.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Light, soft background
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // White header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50', // Dark, classic blue
  },
  languageToggle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498DB', // A subtle blue for links
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5C6B7C',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2C3E50',
  },
  cardBody: {
    marginBottom: 15,
  },
  cardText: {
    fontSize: 16,
    color: '#7F8C9A',
    marginBottom: 5,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#5C6B7C',
  },
  buySellButton: {
    backgroundColor: '#27AE60', // A more professional green
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buySellButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Give it a more professional feel
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#AAB7B8',
    textAlign: 'center',
  },
  // Sell screen specific styles
  demandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
  },
  demandLabel: {
    fontSize: 16,
    color: '#5C6B7C',
  },
  demandValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C6B7C',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D8DC', // A subtle grey border
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FDFEFE',
    color: '#2C3E50',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    padding: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#5C6B7C',
  },
});

export default styles;