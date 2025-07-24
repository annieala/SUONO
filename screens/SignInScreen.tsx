// File: components/SignInForm.tsx
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Define the types for the props this component will receive
type SignInFormProps = {
  email?: string;
  password?: string;
  error?: string;
  loading?: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSignIn: () => void;
  onNavigateToSignUp: () => void;
};

const SignInForm = ({
  email,
  password,
  error,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onNavigateToSignUp
}: SignInFormProps) => {
  return (
    <View style={styles.formContainer}>
      {/* Conditionally render the error message only if it exists */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry // Hides the password
      />
      <Button 
        title={loading ? "Signing In..." : "Sign In"} 
        onPress={onSignIn}
        disabled={loading}
      />
      
      {/* Navigation to Sign Up */}
      <TouchableOpacity 
        style={styles.signUpButton} 
        onPress={onNavigateToSignUp}
      >
        <Text style={styles.signUpText}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: 20,
    padding: 10,
  },
  signUpText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignInForm;