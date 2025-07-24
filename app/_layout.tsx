// File: app/_layout.tsx

import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, Text, StyleSheet, Animated } from 'react-native';

// Splash Screen Component
const SplashScreen = () => {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Create a pulsing animation for the waveform
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <Animated.View 
          style={[
            styles.logoIcon,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.waveform}>
            {/* Animated waveform */}
            <View style={[styles.wave, { height: 6 }]} />
            <View style={[styles.wave, { height: 18 }]} />
            <View style={[styles.wave, { height: 12 }]} />
            <View style={[styles.wave, { height: 24 }]} />
            <View style={[styles.wave, { height: 8 }]} />
            <View style={[styles.wave, { height: 20 }]} />
            <View style={[styles.wave, { height: 14 }]} />
            <View style={[styles.wave, { height: 10 }]} />
          </View>
        </Animated.View>
        <Text style={styles.logoText}>Suono</Text>
      </View>
    </View>
  );
};

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded before navigating.
    if (loading) {
      return;
    }

    const inAppGroup = segments[0] === '(app)';

    if (session && !inAppGroup) {
      // User is signed in but not in the (app) group, so redirect to the main app.
      router.replace('/(app)');
    } else if (!session && inAppGroup) {
      // User is not signed in but is in the (app) group, so redirect to login.
      router.replace('/(auth)/login');
    }
  }, [session, loading, segments]);

  // Show the beautiful Suono splash screen while the auth state is being determined.
  if (loading) {
    return <SplashScreen />;
  }

  // Once loaded, Slot renders the correct route.
  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000', // Pure black background like in Image 1
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    marginBottom: 20,
  },
  waveform: {
    flexDirection: 'row',
    //alignItems: 'end',
    gap: 4,
  },
  wave: {
    width: 4,
    backgroundColor: '#7c3aed', // Purple waveform
    borderRadius: 2,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
});