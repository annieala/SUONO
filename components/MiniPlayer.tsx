// File: components/MiniPlayer.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: any;
}

interface MiniPlayerProps {
  currentTrack?: Track;
  isPlaying?: boolean;
  progress?: number; // 0 to 1
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function MiniPlayer({
  currentTrack,
  isPlaying = false,
  progress = 0,
  onPlayPause,
  onNext,
  onPrevious,
}: MiniPlayerProps) {
  const slideUp = useSharedValue(100); // Start hidden below screen

  // Sample track for demo
  const defaultTrack: Track = {
    id: '1',
    title: 'Crazy Tings',
    artist: 'Tems',
    artwork: require('../assets/swag.jpg'), // You can change this
  };

  const track = currentTrack || defaultTrack;

  useEffect(() => {
    // Animate mini player sliding up when track is available
    slideUp.value = withTiming(track ? 0 : 100, { duration: 300 });
  }, [track]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideUp.value }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress * 100}%`,
    };
  });

  const handleMiniPlayerPress = () => {
    router.push('/(app)/player');
  };

  if (!track) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
        </View>
      </View>

      {/* Mini Player Content */}
      <TouchableOpacity style={styles.miniPlayer} onPress={handleMiniPlayerPress}>
        <View style={styles.trackInfo}>
          <Image source={track.artwork} style={styles.artwork} />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {track.artist}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onPrevious}
          >
            <Ionicons name="play-skip-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={onPlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onNext}
          >
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 1000,
  },
  progressContainer: {
    height: 3,
  },
  progressBackground: {
    height: '100%',
    backgroundColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 64,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  artist: {
    color: '#aaa',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    padding: 8,
    marginHorizontal: 8,
  },
});