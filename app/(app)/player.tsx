// File: app/(app)/player.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSpotify } from '../../context/SpotifyContext';
import { Ionicons } from '@expo/vector-icons';
import type { SpotifyArtist } from '../../services/spotifyService';

export default function MusicPlayerScreen() {
  const {
    isAuthenticated,
    currentTrack,
    isPlaying,
    loading,
    authenticate,
    getCurrentTrack,
    play,
    pause,
    skipToNext,
    skipToPrevious,
  } = useSpotify();

  const [progress, setProgress] = useState(0);

  // Authenticate if not already authenticated
  const handleAuthenticate = async (): Promise<void> => {
    try {
      await authenticate();
      Alert.alert('Success', 'Connected to Spotify!');
      return;
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Spotify. Please try again.');
      return;
    }
  };

  // Handle play/pause
  const handlePlayPause = async (): Promise<void> => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await play();
      }
      return;
    } catch (error) {
      Alert.alert('Error', 'Playback control failed. Make sure Spotify is open on a device.');
      return;
    }
  };

  // Handle skip next
  const handleNext = async (): Promise<void> => {
    try {
      await skipToNext();
      return;
    } catch (error) {
      Alert.alert('Error', 'Failed to skip to next track.');
      return;
    }
  };

  // Handle skip previous
  const handlePrevious = async (): Promise<void> => {
    try {
      await skipToPrevious();
      return;
    } catch (error) {
      Alert.alert('Error', 'Failed to skip to previous track.');
      return;
    }
  };

  // Simulate progress (in a real app, you'd get this from Spotify)
  useEffect(() => {
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          return newProgress >= currentTrack.duration_ms / 1000 ? 0 : newProgress;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  // Format time in mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If not authenticated, show connect screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🎵</Text>
            <Text style={styles.connectTitle}>Connect to Spotify</Text>
            <Text style={styles.connectSubtitle}>
              Connect your Spotify account to play music
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.connectButton} 
            onPress={handleAuthenticate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.connectButtonText}>Connect Spotify</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no current track, show empty state
  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No track playing</Text>
          <Text style={styles.emptySubtext}>Start playing music on Spotify</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={getCurrentTrack}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-down" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PLAYING FROM ALBUM</Text>
          <Text style={styles.headerSubtitle}>{currentTrack.album?.name || 'Unknown Album'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.albumContainer}>
        <Image 
          source={{ 
            uri: currentTrack.album?.images?.[0]?.url || 'https://via.placeholder.com/320x320/000000/808080?text=No+Image'
          }} 
          style={styles.albumArt} 
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentTrack.artists?.map((artist: SpotifyArtist) => artist.name).join(', ') || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>
            {formatTime(currentTrack.duration_ms / 1000)}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(progress / (currentTrack.duration_ms / 1000)) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="shuffle" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
          <Ionicons name="play-skip-back-sharp" size={32} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="#000000" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
          <Ionicons name="play-skip-forward-sharp" size={32} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="repeat" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.lyricsButton}>
          <Text style={styles.lyricsText}>LYRICS</Text>
          <Ionicons name="chevron-up" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2a4a', // Dark navy blue matching your design
  },
  // Connect Screen Styles
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 20,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  connectSubtitle: {
    fontSize: 16,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 22,
  },
  connectButton: {
    backgroundColor: '#1DB954', // Spotify green
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8B8B8B',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Player Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    marginTop: 2,
  },
  albumContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  albumArt: {
    width: 320,
    height: 320,
    borderRadius: 8,
  },
  trackInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  trackDetails: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#b3b3b3',
    fontWeight: '400',
  },
  heartButton: {
    padding: 4,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#b3b3b3',
    fontWeight: '400',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#4a5568',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  controlButton: {
    padding: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  lyricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 4,
    letterSpacing: 1,
  },
});