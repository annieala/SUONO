// File: app/(app)/iso.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColor } from '../../context/ColorContext';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 82) / 2; // 2 items per row with margins and 2px gap

export default function ISOScreen() {
  const { backgroundColor, isLoaded } = useColor();

  const handleBack = () => {
    router.back();
  };

  // Grid items configuration
  const gridItems = [
    {
      id: 1,
      icon: 'disc-outline', // Drum icon
      label: 'beat',
      onPress: () => console.log('Beat pressed'),
    },
    {
      id: 2,
      icon: 'musical-notes-outline', // Bass guitar icon
      label: 'bass',
      onPress: () => console.log('Bass pressed'),
    },
    {
      id: 3,
      icon: 'pulse-outline', // Audio waveform icon
      label: 'bed',
      onPress: () => console.log('Bed pressed'),
    },
    {
      id: 4,
      icon: 'mic-outline', // Microphone icon
      label: 'vox',
      onPress: () => console.log('Vox pressed'),
    },
  ];

  // Create container style that definitely updates
  const containerStyle = {
    flex: 1,
    backgroundColor: isLoaded ? backgroundColor : '#0A0E26',
  };

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color="#F9E1CF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PLAYING FROM ALBUM</Text>
          <Text style={styles.headerSubtitle}>Daisies</Text>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* 2x2 Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={gridItems[0].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[0].icon as any} 
                  size={32} 
                  color="#F9E1CF" 
                />
              </View>
              <Text style={styles.gridItemLabel}>{gridItems[0].label}</Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              style={styles.gridItem}
              onPress={gridItems[1].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[1].icon as any} 
                  size={32} 
                  color="#F9E1CF" 
                />
              </View>
              <Text style={styles.gridItemLabel}>{gridItems[1].label}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.spacer} />
          
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={gridItems[2].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[2].icon as any} 
                  size={32} 
                  color="#F9E1CF" 
                />
              </View>
              <Text style={styles.gridItemLabel}>{gridItems[2].label}</Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              style={styles.gridItem}
              onPress={gridItems[3].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[3].icon as any} 
                  size={32} 
                  color="#F9E1CF" 
                />
              </View>
              <Text style={styles.gridItemLabel}>{gridItems[3].label}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>Daisies</Text>
        <Text style={styles.trackArtist}>Justin Bieber</Text>
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={24} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>1:20</Text>
          <Text style={styles.timeText}>3:15</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color="#F9E1CF" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={30} color="#F9E1CF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="pause" size={20} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={30} color="#F9E1CF" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat-outline" size={24} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.lyricsButton}>
            <Text style={styles.lyricsText}>LYRICS</Text>
            <Ionicons name="chevron-down" size={16} color="#F9E1CF" style={styles.chevronIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.isoButton}>
            <Text style={styles.isoButtonText}>[[ ISO ]]</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    opacity: 0.5,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  optionsButton: {
    padding: 8,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: 2,
    height: 2,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: 'rgba(249, 225, 207, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 225, 207, 0.2)',
  },
  iconContainer: {
    marginBottom: 8,
  },
  gridItemLabel: {
    color: '#F9E1CF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  trackInfo: {
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    marginBottom: 20,
    position: 'relative',
  },
  trackTitle: {
    color: '#F9E1CF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trackArtist: {
    color: '#fff',
    opacity: 0.5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  heartIcon: {
    position: 'absolute',
    right: 40,
    top: 0,
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#F9E1CF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  playButton: {
    backgroundColor: '#F9E1CF',
    borderRadius: 35,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    paddingBottom: 15,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  isoButton: {
    backgroundColor: 'rgba(249, 225, 207, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 225, 207, 0.4)',
  },
  isoButtonText: {
    color: '#F9E1CF',
    fontSize: 12,
    fontWeight: '600',
  },
  lyricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsText: {
    fontSize: 13,
    color: '#Ffffff',
    opacity: 0.5,
    fontWeight: '300',
    marginRight: 5,
  },
  chevronIcon: {
    opacity: 0.5,
  },
});