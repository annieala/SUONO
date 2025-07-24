// File: app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Redirect } from 'expo-router';

// This is the navigator for the main app screens
export default function AppLayout() {
  const { session } = useAuth();

  // If the user is not signed in, redirect them to the login screen.
  // This is a crucial security measure.
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // If the user IS signed in, show the stack navigator without tabs.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Add your other main app screens here */}
    </Stack>
  );
}