import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="player" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="add-favorite" />  {/* Added AddFavorite screen */}
    </Stack>
  );
}
