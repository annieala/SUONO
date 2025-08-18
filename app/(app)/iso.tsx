// File: app/(app)/iso.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColor } from '../../context/ColorContext';
import { useAudio } from '../../context/AudioContext';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 82) / 2; // 2 items per row with margins and 2px gap

export default function ISOScreen() {
  const { backgroundColor, isLoaded } = useColor();
  const {
    isPlaying,
    currentPosition,
    duration,
    currentISOTrack,
    enterISOMode,
    exitISOMode,
    playISOTrack,
    pauseAudio,
    playAudio,
    seekTo,
  } = useAudio();

  // Scrubbing state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef<View>(null);

  // Enter ISO mode when screen loads
  useEffect(() => {
    enterISOMode();
  }, []);

  const handleProgressBarPress = (evt: any) => {
    if (progressBarRef.current && duration > 0) {
      const { locationX } = evt.nativeEvent;
      
      progressBarRef.current.measure((x, y, width, height) => {
        const percentage = Math.max(0, Math.min(1, locationX / width));
        const newPosition = percentage * duration;
        seekTo(newPosition);
      });
    }
  };

  const handleBack = () => {
    // Exit ISO mode and go back
    exitISOMode();
    router.back();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Format time in mm:ss
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0;

  // Grid items configuration with audio functionality
  const gridItems = [
    {
      id: 1,
      icon: 'disc-outline',
      label: 'beat',
      trackName: 'beat',
      onPress: () => playISOTrack('beat'),
    },
    {
      id: 2,
      icon: 'musical-notes-outline',
      label: 'bass',
      trackName: 'bass',
      onPress: () => playISOTrack('bass'),
    },
    {
      id: 3,
      icon: 'pulse-outline',
      label: 'bed',
      trackName: 'bed',
      onPress: () => playISOTrack('bed'),
    },
    {
      id: 4,
      icon: 'mic-outline',
      label: 'vox',
      trackName: 'vox',
      onPress: () => playISOTrack('vox'),
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
          <Text style={styles.headerTitle}>ISO MODE</Text>
          <Text style={styles.headerSubtitle}>
            {currentISOTrack ? currentISOTrack.toUpperCase() : 'Select Track'}
          </Text>
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
              style={[
                styles.gridItem,
                currentISOTrack === 'beat' && styles.activeGridItem
              ]}
              onPress={gridItems[0].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[0].icon as any} 
                  size={32} 
                  color={currentISOTrack === 'beat' ? '#000' : '#F9E1CF'} 
                />
              </View>
              <Text style={[
                styles.gridItemLabel,
                currentISOTrack === 'beat' && styles.activeGridItemLabel
              ]}>
                {gridItems[0].label}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              style={[
                styles.gridItem,
                currentISOTrack === 'bass' && styles.activeGridItem
              ]}
              onPress={gridItems[1].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[1].icon as any} 
                  size={32} 
                  color={currentISOTrack === 'bass' ? '#000' : '#F9E1CF'} 
                />
              </View>
              <Text style={[
                styles.gridItemLabel,
                currentISOTrack === 'bass' && styles.activeGridItemLabel
              ]}>
                {gridItems[1].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.spacer} />
          
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.gridItem,
                currentISOTrack === 'bed' && styles.activeGridItem
              ]}
              onPress={gridItems[2].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[2].icon as any} 
                  size={32} 
                  color={currentISOTrack === 'bed' ? '#000' : '#F9E1CF'} 
                />
              </View>
              <Text style={[
                styles.gridItemLabel,
                currentISOTrack === 'bed' && styles.activeGridItemLabel
              ]}>
                {gridItems[2].label}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              style={[
                styles.gridItem,
                currentISOTrack === 'vox' && styles.activeGridItem
              ]}
              onPress={gridItems[3].onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={gridItems[3].icon as any} 
                  size={32} 
                  color={currentISOTrack === 'vox' ? '#000' : '#F9E1CF'} 
                />
              </View>
              <Text style={[
                styles.gridItemLabel,
                currentISOTrack === 'vox' && styles.activeGridItemLabel
              ]}>
                {gridItems[3].label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>
          {currentISOTrack ? `${currentISOTrack.toUpperCase()} - Daisies` : 'Daisies'}
        </Text>
        <Text style={styles.trackArtist}>Justin Bieber</Text>
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={24} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <TouchableWithoutFeedback onPress={handleProgressBarPress}>
          <View 
            style={styles.progressBarContainer}
            ref={progressBarRef}
          >
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progressPercentage, 100)}%` }
                ]} 
              />
              {/* Scrub handle - always visible but subtle */}
              <View 
                style={[
                  styles.scrubHandle,
                  { left: `${Math.min(progressPercentage, 100)}%` }
                ]}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
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

        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="#000" 
          />
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
  activeGridItem: {
    backgroundColor: '#F9E1CF',
    borderColor: '#F9E1CF',
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
  activeGridItemLabel: {
    color: '#000',
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
  progressBarContainer: {
    width: '100%',
    paddingVertical: 15, // Larger touch area
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F9E1CF',
    borderRadius: 2,
  },
  scrubHandle: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: '#F9E1CF',
    borderRadius: 6,
    marginLeft: -6, // Center the handle
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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