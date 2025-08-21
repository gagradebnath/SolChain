// styles/SettingsStyles.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F7', // A light, soft background color
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#34495E', // A deep charcoal color
  },
  languageToggle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2980B9', // A professional blue
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#BDC3C7', // A placeholder color for the avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E',
  },
  profileDetails: {
    fontSize: 14,
    color: '#7F8C8D', // A softer grey for details
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
    marginTop: 15,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  rowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rowLabel: {
    fontSize: 16,
    color: '#5D6D7E',
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#7F8C8D',
    marginRight: 10,
  },
  rowIcon: {
    marginLeft: 'auto',
  },
});

export default styles;