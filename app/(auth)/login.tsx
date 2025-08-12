// File: app/(auth)/login.tsx

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <View style={styles.waveform}>
                {/* Simple waveform representation */}
                <View style={[styles.wave, { height: 4 }]} />
                <View style={[styles.wave, { height: 12 }]} />
                <View style={[styles.wave, { height: 8 }]} />
                <View style={[styles.wave, { height: 16 }]} />
                <View style={[styles.wave, { height: 6 }]} />
                <View style={[styles.wave, { height: 14 }]} />
                <View style={[styles.wave, { height: 10 }]} />
              </View>
            </View>
            <Text style={styles.logoText}>Suono</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Please enter your email ♩"
                placeholderTextColor="#8B8B8B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Please enter your password ♬"
                placeholderTextColor="#8B8B8B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => {
                // Handle forgot password
                Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => router.push('/(auth)/sign-up')}
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E26', // Dark blue background from the design
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    marginBottom: 15,
  },
  waveform: {
    flexDirection: 'row',
    gap: 3,
  },
  wave: {
    width: 3,
    backgroundColor: '#7416F9', // Purple color for waveform
    borderRadius: 1.5,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#F9E1CF',
    letterSpacing: 1,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#F9E1CF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#404463',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F9E1CF',
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#7416F9', // Purple button
    borderRadius: 25,
    paddingVertical: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#F9E1CF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#F9E1CF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  signUpButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  signUpText: {
    color: '#8B8B8B',
    fontSize: 16,
    fontWeight: '500',
  },
});