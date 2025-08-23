import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../assets/config';
import { useNavigation } from '@react-navigation/native';

const MailIcon = () => <Text style={styles.icon}>📧</Text>;
const LockIcon = () => <Text style={styles.icon}>🔒</Text>;
import UniversalSafeArea from '../components/UniversalSafeArea';

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

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const { token, user } = data;
      await AsyncStorage.setItem('token', token);
      console.log('JWT Token:', token);
      console.log('User Info:', user);
      setMessage(`Welcome ${user.email}`);
      navigation.navigate('HomeScreen');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <UniversalSafeArea>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.background}>
        <View style={styles.card}>
          <Text style={styles.title}>SolarChain</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </Text>

          <View style={styles.inputContainer}>
            <MailIcon />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#bbb"
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
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchButton}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </KeyboardAvoidingView>
    </UniversalSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.85)',
    backdropFilter: 'blur(20px)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 45,
  },
  icon: { fontSize: 20, color: '#bbb', marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  switchContainer: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
  switchText: { color: '#aaa' },
  switchButton: { color: '#3b82f6', marginLeft: 5, fontWeight: '600' },
  message: { marginTop: 15, color: '#4ade80', fontWeight: '500' },
});
