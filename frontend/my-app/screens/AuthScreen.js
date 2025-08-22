import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UniversalSafeArea from '../components/UniversalSafeArea';

export default function AuthScreen() {
  return (
    <UniversalSafeArea style={styles.container}>
      <Text style={styles.title}>Authentication & Setup</Text>
      <Text>Login / Register screens will go here.</Text>
    </UniversalSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});