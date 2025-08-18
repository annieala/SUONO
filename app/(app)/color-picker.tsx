// File: app/(app)/color-picker.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColor } from '../../context/ColorContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 80) / 4; // 4 items per row with margins

export default function ColorPickerScreen() {
  const { backgroundColor, setBackgroundColor } = useColor();

  // Predefined color palette
  const colors = [
    '#0A0E26', // Default
    '#0A0E26', // Original dark blue
    '#1a1a2e', // Dark purple
    '#16213e', // Navy blue
    '#0f3460', // Deep blue
    '#533a7d', // Purple
    '#2d1b69', // Deep purple
    '#1e3a8a', // Blue
    '#155e75', // Teal
    '#166534', // Green
    '#365314', // Olive green
    '#713f12', // Brown
    '#92400e', // Orange brown
    '#991b1b', // Red
    '#7f1d1d', // Dark red
    '#831843', // Pink red
    '#701a75', // Magenta
    '#581c87', // Purple
    '#312e81', // Indigo
    '#1e40af', // Blue
  ];

  const handleColorSelect = async (color: string) => {
    await setBackgroundColor(color);
    // Haptic feedback could be added here
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F9E1CF" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Theme Color</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Select a color to customize your app's theme
        </Text>

        <View style={styles.colorGrid}>
          {colors.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorItem,
                { backgroundColor: color },
                backgroundColor === color && styles.selectedColor,
              ]}
              onPress={() => handleColorSelect(color)}
              activeOpacity={0.7}
            >
              {backgroundColor === color && (
                <Ionicons name="checkmark" size={24} color="#F9E1CF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Your selected theme will be saved and applied across the entire app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9E1CF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#F9E1CF',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  colorItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#F9E1CF',
    borderWidth: 3,
  },
  infoContainer: {
    backgroundColor: 'rgba(249, 225, 207, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  infoText: {
    color: '#F9E1CF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
});