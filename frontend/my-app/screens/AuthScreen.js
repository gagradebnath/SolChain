import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import UniversalSafeArea from '../components/UniversalSafeArea';
import config from '../assets/config';

const logo = require('../assets/logo.png');

const MailIcon = () => <Text style={styles.icon}>📧</Text>;
const LockIcon = () => <Text style={styles.icon}>🔒</Text>;

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      const { token, user } = data;
      await AsyncStorage.setItem('token', token);
      setMessage(`Welcome ${user.email}`);
      navigation.navigate('HomeScreen');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <UniversalSafeArea>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={styles.titlePart}>S</Text>
            <Image source={logo} style={styles.titleLogo} />
            <Text style={styles.titlePart}>LChain</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <MailIcon />
            <TextInput
              style={styles.input}
              placeholder="Email / UserId"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <LockIcon />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isLogin ? 'Login' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              Sell the Sun, Make the future Greener
            </Text>
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </UniversalSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  card: {
    width: '90%',
    maxWidth: 420,
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titlePart: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  titleLogo: {
    width: 55,
    height: 55,
    marginHorizontal: -5,
    resizeMode: 'contain',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: { fontSize: 18, color: '#94a3b8', marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  button: {
    width: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    marginTop: 15,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  switchContainer: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  switchText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
  message: {
    marginTop: 20,
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
});