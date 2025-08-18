// File: app/(app)/player.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  Alert,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../../context/FavoritesContext';
import { useColor } from '../../context/ColorContext';

const { width, height } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  uri: any;
  artwork?: any;
}

type RepeatMode = 'off' | 'all' | 'one';

export default function MusicPlayerScreen() {
  // Get route parameters
  const { trackIndex: paramTrackIndex } = useLocalSearchParams();
  
  // Use Color context
  const { backgroundColor, isLoaded } = useColor();
  
  // Add force re-render trigger
  const [, forceUpdate] = useState({});
  
  // Force re-render when color changes
  useEffect(() => {
    console.log('Player - Color changed:', backgroundColor, 'isLoaded:', isLoaded);
    forceUpdate({});
  }, [backgroundColor, isLoaded]);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    // Initialize with route parameter or default to 0
    return paramTrackIndex ? parseInt(paramTrackIndex as string, 10) : 0;
  });
  
  // New state for shuffle and repeat
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]);
  
  // State for dropdown menu and lyrics modal
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Use favorites context
  const { isFavorite, toggleFavorite } = useFavorites();

  // Playlist data for the dropdown (excluding Favorites)
  const availablePlaylists = [
    { id: 2, name: 'Monday Mood ⋆｡˚☽˚｡⋆', cover: require('../../assets/lovetide.jpg') },
    { id: 3, name: 'Gym ❚█══█❚', cover: require('../../assets/640x640.jpg') },
  ];

  // PLAYLIST WITH WORKING TRACKS
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

  // Create container style that definitely updates - MOVED UP TO AVOID USAGE BEFORE DECLARATION
  const containerStyle = {
    flex: 1,
    backgroundColor: isLoaded ? backgroundColor : '#0A0E26',
    paddingHorizontal: 20,
    paddingTop: 10,
  };

  const dropdownStyle = {
    backgroundColor: isLoaded ? backgroundColor : '#0A0E26',
    borderRadius: 2,
    padding: 6,
    marginTop: 10,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  };

  // Mock lyrics data with placeholder content
  const lyricsData: { [key: string]: string[] } = {
    '1': [
      '[Verse 1]',
      'Placeholder lyrics for demonstration',
      'This is where the actual lyrics would appear',
      'For educational and development purposes',
      '',
      '[Chorus]',
      'Sample chorus text here',
      'Showing the lyrics display functionality',
      'In a real app, these would be the actual lyrics',
      '',
      '[Verse 2]',
      'Another verse of placeholder text',
      'Demonstrating the scrolling lyrics feature',
      'Replace with actual licensed lyrics content',
    ],
    '2': [
      '[Verse 1]',
      'Sample lyrics for The Dress',
      'Placeholder content for development',
      'Actual lyrics would require proper licensing',
      '',
      '[Chorus]',
      'Demo lyrics showing the interface',
      'This text is just for testing purposes',
      'Real implementation needs music rights',
    ],
    '3': [
      '[Verse 1]',
      'Placeholder lyrics for this track',
      'Demonstration of the lyrics feature',
      'Replace with properly licensed content',
      '',
      '[Bridge]',
      'Sample text for the lyrics modal',
      'Shows how the interface would work',
      'With actual song lyrics in production',
    ],
  };

  const currentLyrics = (currentTrack?.id && lyricsData[currentTrack.id]) || [
    'Lyrics not available for this track',
    '',
    'Lyrics will be displayed here when available',
    'This feature requires proper music licensing',
  ];

  // Initialize original playlist
  useEffect(() => {
    if (originalPlaylist.length === 0) {
      setOriginalPlaylist([...playlist]);
    }
  }, []);

  // Auto-load track when component mounts or trackIndex changes
  useEffect(() => {
    if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length) {
      loadAndPlayAudio(currentTrackIndex);
    }
  }, []); // Only run on mount

  // Safety check
  if (!currentTrack) {
    return (
      <SafeAreaView style={containerStyle}>
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
        return 'repeat-outline';
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== 'off' ? '#1DB954' : '#F9E1CF';
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(currentTrack);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAddToPlaylist = (playlistId: number, playlistName: string) => {
    // Here you would implement the actual logic to add the track to the playlist
    // For now, we'll just show an alert as a demo
    console.log(`Adding "${currentTrack.title}" to "${playlistName}"`);
    
    // Close the dropdown
    setShowDropdown(false);
    
    // Show confirmation (you could replace this with a toast notification)
    setTimeout(() => {
      Alert.alert(
        "Added to Playlist", 
        `"${currentTrack.title}" has been added to "${playlistName}"`
      );
    }, 100);
  };

  const isCurrentTrackFavorite = isFavorite(currentTrack.id);

  // Lyrics modal functions
  const openLyricsModal = () => {
    setShowLyrics(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeLyricsModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowLyrics(false);
    });
  };

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.leftButton}>
          <Ionicons name="chevron-down" size={15} color="#F9E1CF" />  
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PLAYING FROM PLAYLIST</Text>
        <Text style={styles.headerSubtitle}>{playlist[currentTrackIndex]?.title}</Text>

        </View>
        <TouchableOpacity onPress={toggleDropdown} style={styles.rightButton}>
          <Ionicons name="ellipsis-vertical" size={15} color="#F9E1CF" />
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
            color={isCurrentTrackFavorite ? "#F9E1CF" : "#F9E1CF"} 
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
          minimumTrackTintColor="#F9E1CF"
          maximumTrackTintColor="#333"
          thumbTintColor="#F9E1CF"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={isShuffleEnabled ? '#1DB954' : '#F9E1CF'} 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={previousTrack}>
          <Ionicons name="play-skip-back" size={30} color="#F9E1CF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={25} color="#F9E1CF" />
          ) : (
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color="#000" 
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={30} color="#F9E1CF" />
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

      {/* Lyrics Section with ISO Button */}
      <View style={styles.lyricsSection}>
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.lyricsButton} onPress={openLyricsModal}>
            <Text style={styles.lyricsText}>LYRICS</Text>
            <Ionicons name="chevron-up" size={16} color="#F9E1CF" style={styles.chevronIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.isoButton}
            onPress={() => router.push('/(app)/iso')}
          >
            <Text style={styles.isoButtonText}>[[ ISO ]]</Text>
          </TouchableOpacity>
        </View>
      </View>
 
      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <TouchableOpacity 
            style={styles.dropdownBackdrop}
            onPress={() => setShowDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownContainer}>
          <View style={dropdownStyle}>
              <Text style={styles.dropdownTitle}>+  Add to Playlist</Text>
              {availablePlaylists.map((playlist) => (
                <TouchableOpacity 
                  key={playlist.id}
                  style={styles.dropdownItem}
                  onPress={() => handleAddToPlaylist(playlist.id, playlist.name)}
                >
                  <Image source={playlist.cover} style={styles.dropdownItemCover} />
                  <Text style={styles.dropdownItemText}>{playlist.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Lyrics Modal with CSS Blur Fallback */}
      <Modal
        visible={showLyrics}
        transparent={true}
        animationType="none"
        onRequestClose={closeLyricsModal}
      >
        <View style={styles.lyricsModalContainer}>
          {/* Multi-layer blur effect */}
          <View style={styles.blurLayer1} />
          <View style={styles.blurLayer2} />
          <View style={styles.blurLayer3} />
          
          <Animated.View 
            style={[
              styles.lyricsModal,
              { backgroundColor: isLoaded ? `${backgroundColor}F0` : '#0A0E26F0' },
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.lyricsHeader}>
              <TouchableOpacity onPress={closeLyricsModal} style={styles.lyricsCloseButton}>
                <Ionicons name="chevron-down" size={24} color="#F9E1CF" />
              </TouchableOpacity>
              <View style={styles.lyricsHeaderInfo}>
                <Text style={styles.lyricsHeaderTitle}>LYRICS</Text>
                <Text style={styles.lyricsHeaderSubtitle}>
                  {currentTrack.title} • {currentTrack.artist}
                </Text>
              </View>
              <TouchableOpacity style={styles.lyricsShareButton}>
                <Ionicons name="share-outline" size={24} color="#F9E1CF" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.lyricsContent}
              showsVerticalScrollIndicator={false}
            >
              {currentLyrics.map((line: string, index: number) => (
                <Text 
                  key={index} 
                  style={[
                    styles.lyricsLine,
                    line.startsWith('[') && line.endsWith(']') && styles.lyricsSectionHeader
                  ]}
                >
                  {line}
                </Text>
              ))}
              
              <View style={{ height: 100 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#F9E1CF',
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
  leftButton: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  rightButton: {
    position: 'absolute',
    right: 30,
    zIndex: 1,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    opacity: .5,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 15,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: width - 50,
    height: width - 50,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  trackInfo: {
    alignItems: 'flex-start',
    left: 30,
    marginBottom: 20,
    position: 'relative',
  },
  trackTitle: {
    color: '#F9E1CF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trackArtist: {
    color: '#fff',
    opacity: 0.5,
    fontSize: 14,
    fontWeight:'bold',
  },
  heartIcon: {
    position: 'absolute',
    right: 60,
    top: 0,
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '90%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
    width: '90%', // Match the progress bar width
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
    backgroundColor: '#F9E1CF',
    borderRadius: 35,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatContainer: {
    position: 'relative',
  },
  repeatOneIndicator: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#F9E1CF',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    color: '#F9E1CF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lyricsSection: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  isoButton: {
    backgroundColor: 'rgba(249, 225, 207, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 225, 207, 0.3)',
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
  dropdownContainer: {
    position: 'absolute',
    alignItems: 'flex-start',
    top: 80,
    right: 0, // Position dropdown near the right button
    zIndex: 1000,
    
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownMenu: {
    borderRadius: 2,
    padding: 6,
    marginTop: 10,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  dropdownTitle: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 1,
    borderRadius: 1,
  },
  dropdownItemCover: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 10,
  },
  dropdownItemText: {
    color: '#F9E1CF',
    fontSize: 14,
    flex: 1,
  },
  lyricsModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px) saturate(180%)',
  },
  blurLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 38, 0.3)',
    backdropFilter: 'blur(8px) brightness(0.8)',
  },
  blurLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  lyricsModal: {
    height: height * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 25,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(249, 225, 207, 0.2)',
    // Glass morphism effect
    backdropFilter: 'blur(20px) saturate(180%)',
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249, 225, 207, 0.15)',
    backgroundColor: 'rgba(249, 225, 207, 0.05)', // Slight frosted glass effect
  },
  lyricsCloseButton: {
    padding: 8,
    borderRadius: 20,
  },
  lyricsShareButton: {
    padding: 8,
    borderRadius: 20,
  },
  lyricsHeaderInfo: {
    flex: 1,
    alignItems: 'center',
  },
  lyricsHeaderTitle: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  lyricsHeaderSubtitle: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  lyricsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  lyricsLine: {
    color: '#F9E1CF',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lyricsSectionHeader: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});