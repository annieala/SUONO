// File: app/(auth)/sign-up.tsx

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView 
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen(): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const handleSignUp = async (): Promise<void> => {
    if (!firstName || !lastName || !email || !password) {
        setError("Please fill out all fields.");
        return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await signUp(email, password, firstName, lastName);

      if (result?.error) {
        setError(result.error);
      } else {
        Alert.alert(
            "Sign Up Successful", 
            "Please check your email to verify your account before logging in."
        );
        router.replace('/(auth)/login');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSignIn = (): void => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Please enter your first name ↗"
                placeholderTextColor="#8B8B8B"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Please enter your last name ↗"
                placeholderTextColor="#8B8B8B"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Please enter your email ↗"
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
                placeholder="Please enter your password ↗"
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

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleNavigateToSignIn}
            disabled={loading}
          >
            <Text style={styles.signInText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e', // Same dark blue background as login
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    marginBottom: 15,
  },
  waveform: {
    flexDirection: 'row',
    //alignItems: 'end',
    gap: 3,
  },
  wave: {
    width: 3,
    backgroundColor: '#7c3aed', // Purple color for waveform
    borderRadius: 1.5,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8B8B8B',
    fontWeight: '400',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
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
    color: '#ffffff',
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#7c3aed', // Purple button
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  signInText: {
    color: '#8B8B8B',
    fontSize: 16,
    fontWeight: '500',
  },
});