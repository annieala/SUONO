// File: app/(app)/player.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFavorites } from '../../context/FavoritesContext';

const { width } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  uri: any;
  artwork?: any;
}

type RepeatMode = 'off' | 'all' | 'one';

export default function MusicPlayerScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  // New state for shuffle and repeat
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]);

  // Use favorites context
  const { isFavorite, toggleFavorite } = useFavorites();

  // PLAYLIST WITH ALL TRACKS
  const playlist: Track[] = [
    {
      id: '1',
      title: 'Daisies',
      artist: 'Justin Bieber',
      uri: require('../../assets/audio/sample.mp3'), 
      artwork: require('../../assets/swag.jpg'), 
    },
    {
      id: '2',
      title: 'The Dress',
      artist: 'Dijon',
      uri: require('../../assets/audio/the-dress.mp3'),
      artwork: require('../../assets/dijon.jpg'),
    },
    {
      id: '3',
      title: 'Mutt',
      artist: 'Leon Thomas',
      uri: require('../../assets/audio/mutt.mp3'),
      artwork: require('../../assets/mutt.jpg'),
    },
  ];

  const currentTrack = playlist[currentTrackIndex];

  // Initialize original playlist
  useEffect(() => {
    if (originalPlaylist.length === 0) {
      setOriginalPlaylist([...playlist]);
    }
  }, []);

  // Safety check
  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tracks available</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sound && isPlaying && !isSliding) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          
          // Auto-play next track when current track ends
          if (status.positionMillis && status.durationMillis && 
              status.positionMillis >= status.durationMillis - 1000) {
            await handleTrackEnd();
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sound, isPlaying, isSliding, currentTrackIndex, repeatMode]);

  const loadAndPlayAudio = async (trackIndex?: number) => {
    try {
      setIsLoading(true);
      
      if (sound) {
        await sound.unloadAsync();
      }

      const targetIndex = trackIndex !== undefined ? trackIndex : currentTrackIndex;
      const track = playlist[targetIndex];

      if (!track) {
        console.error('Track not found at index:', targetIndex);
        setIsLoading(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        track.uri,
        { shouldPlay: false }
      );

      setSound(newSound);
      setPosition(0);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

      await newSound.playAsync();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      await loadAndPlayAudio(currentTrackIndex);
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekToPosition = async (value: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(value);
        setPosition(value);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(0, position - 15000);
      await seekToPosition(newPosition);
    }
  };

  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(duration, position + 15000);
      await seekToPosition(newPosition);
    }
  };

  // Get random track index (excluding current track)
  const getRandomTrackIndex = (): number => {
    if (playlist.length <= 1) return 0;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentTrackIndex);
    
    return randomIndex;
  };

  // Handle what happens when a track ends
  const handleTrackEnd = async () => {
    if (repeatMode === 'one') {
      // Repeat current track
      await loadAndPlayAudio(currentTrackIndex);
    } else if (repeatMode === 'all' || repeatMode === 'off') {
      await nextTrack();
    }
  };

  const nextTrack = async () => {
    let nextIndex: number;

    if (isShuffleEnabled) {
      // Shuffle mode: get random track
      nextIndex = getRandomTrackIndex();
      setShuffleHistory(prev => [...prev, currentTrackIndex]);
    } else {
      // Normal mode: go to next track
      nextIndex = (currentTrackIndex + 1) % playlist.length;
      
      // If we've reached the end and repeat is off, stop
      if (nextIndex === 0 && repeatMode === 'off') {
        // We've reached the end of playlist with no repeat
        setIsPlaying(false);
        if (sound) {
          await sound.pauseAsync();
        }
        return;
      }
    }

    setCurrentTrackIndex(nextIndex);
    await loadAndPlayAudio(nextIndex);
  };

  const previousTrack = async () => {
    let prevIndex: number;

    if (isShuffleEnabled && shuffleHistory.length > 0) {
      // Shuffle mode: go back to previous track from history
      const history = [...shuffleHistory];
      prevIndex = history.pop() || 0;
      setShuffleHistory(history);
    } else {
      // Normal mode: go to previous track
      prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    }

    setCurrentTrackIndex(prevIndex);
    await loadAndPlayAudio(prevIndex);
  };

  const toggleShuffle = () => {
    setIsShuffleEnabled(!isShuffleEnabled);
    // Clear shuffle history when toggling
    if (!isShuffleEnabled) {
      setShuffleHistory([]);
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex] as RepeatMode);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return 'repeat-outline'; // Could also use a "1" overlay
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== 'off' ? '#1DB954' : '#fff';
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(currentTrack);
  };

  const isCurrentTrackFavorite = isFavorite(currentTrack.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PLAYING FROM PLAYLIST</Text>
          <Text style={styles.headerSubtitle}>Track {currentTrackIndex + 1} of {playlist.length}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Album Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={currentTrack.artwork}
          style={styles.artwork}
          defaultSource={require('../../assets/swag.jpg')}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{currentTrack.title}</Text>
        <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
        <TouchableOpacity style={styles.heartIcon} onPress={handleToggleFavorite}>
          <Ionicons 
            name={isCurrentTrackFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isCurrentTrackFavorite ? "#ff6b6b" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={(value: number) => {
            setPosition(value);
            setIsSliding(true);
          }}
          onSlidingComplete={(value: number) => {
            seekToPosition(value);
            setIsSliding(false);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#333"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={skipBackward}>
          <Ionicons name="play-back" size={30} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={previousTrack}>
          <Ionicons name="play-skip-back" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={30} color="#000" />
          ) : (
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={30} 
              color="#000" 
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward}>
          <Ionicons name="play-forward" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={isShuffleEnabled ? '#1DB954' : '#fff'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleRepeat}>
          <View style={styles.repeatContainer}>
            <Ionicons 
              name={getRepeatIcon()} 
              size={24} 
              color={getRepeatColor()} 
            />
            {repeatMode === 'one' && (
              <View style={styles.repeatOneIndicator}>
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Lyrics Section */}
      <View style={styles.lyricsSection}>
        <TouchableOpacity style={styles.lyricsButton}>
          <Text style={styles.lyricsText}>LYRICS</Text>
          <Ionicons name="chevron-up" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  trackTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trackArtist: {
    color: '#aaa',
    fontSize: 16,
  },
  heartIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
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
    paddingHorizontal: 20,
  },
  playButton: {
    backgroundColor: '#fff',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 60,
  },
  repeatContainer: {
    position: 'relative',
  },
  repeatOneIndicator: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#1DB954',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lyricsSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  lyricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
    letterSpacing: 1,
  },
});