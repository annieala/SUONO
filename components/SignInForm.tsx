// File: components/SignInForm.tsx

import React from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

// Define the types for the props this component will receive
type SignInFormProps = {
  email?: string;
  password?: string;
  error?: string;
  loading?: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSignIn: () => void;
};

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  error,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSignIn,
}) => {
  return (
    <View style={styles.formContainer}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange} // This line sends the text to the login screen
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange} // This line sends the text to the login screen
        secureTextEntry
        editable={!loading}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Signing In..." : "Sign In"} 
          onPress={onSignIn}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
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
  },
});

export default SignInForm;
