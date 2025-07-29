// File: app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native'; // Import for loading indicator


export default function AppLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="player" /> {/* Add this line */}
    </Stack>
  );
}