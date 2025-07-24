// File: components/SignUpForm.tsx

import React from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

// Define the types for the props this component will receive
type SignUpFormProps = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  error?: string;
  loading?: boolean;
  onFirstNameChange: (text: string) => void;
  onLastNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSignUp: () => void;
  onNavigateToSignIn: () => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({
  firstName,
  lastName,
  email,
  password,
  error,
  loading = false,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onSignUp,
  onNavigateToSignIn
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={onFirstNameChange}
        autoCapitalize="words"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={onLastNameChange}
        autoCapitalize="words"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        editable={!loading}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Creating Account..." : "Sign Up"} 
          onPress={onSignUp}
          disabled={loading}
        />
      </View>
      
      {/* ✅ DEBUGGING: Replaced TouchableOpacity with a standard Button */}
      <View style={styles.signInButton}>
        <Button
            title="Already have an account? Sign In"
            onPress={onNavigateToSignIn}
            disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#d73a49',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  signInButton: {
    marginTop: 10,
  },
});

export default SignUpForm;
