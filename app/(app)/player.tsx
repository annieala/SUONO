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
import { usePlaylists } from '../../context/PlaylistsContext';

// Import Apple Music context
import { useAppleMusic } from '../../context/AppleMusicContext';

const { width, height } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  uri: any;
  artwork?: any;
  isAppleMusic?: boolean;
  previewUrl?: string;
  album?: string;
}

type RepeatMode = 'off' | 'all' | 'one';

export default function MusicPlayerScreen() {
  // Get route parameters
  const { trackIndex: paramTrackIndex, appleMusicTrack: paramAppleMusicTrack } = useLocalSearchParams();
  
  // Debug logging for route parameters
  console.log('Player opened with params:');
  console.log('- trackIndex:', paramTrackIndex);
  console.log('- appleMusicTrack:', paramAppleMusicTrack ? 'Apple Music track provided' : 'No Apple Music track');
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    return paramTrackIndex ? parseInt(paramTrackIndex as string, 10) : 0;
  });
  
  // Apple Music track state
  const [currentAppleMusicTrack, setCurrentAppleMusicTrack] = useState<Track | null>(null);
  const [isAppleMusicMode, setIsAppleMusicMode] = useState(false);
  
  // Other state variables
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToPlaylist } = usePlaylists();
  
  // Use Apple Music context
  const { getTrackPreviewUrl, isAuthorized } = useAppleMusic();

  // Playlist data for the dropdown
  const availablePlaylists = [
    { 
      id: 'mondayMood', 
      name: '⋆｡˚ ☁︎ ˚｡ Monday Mood ⋆｡˚☽˚｡⋆', 
      cover: require('../../assets/lovetide.jpg') 
    },
    { 
      id: 'gym', 
      name: '❚█══█❚ Gym ❚█══█❚', 
      cover: require('../../assets/640x640.jpg') 
    },
  ];

  // Main playlist with all tracks
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
    {
      id: '4',
      title: 'Hurry Up',
      artist: 'Beyoncé',
      uri: require('../../assets/audio/hurry-up.mp3'),
      artwork: require('../../assets/lovetide.jpg'),
    },
    {
      id: '5',
      title: 'Fool',
      artist: 'Childish Gambino ',
      uri: require('../../assets/audio/fool.mp3'),
      artwork: require('../../assets/childish-gambino.jpg'),
    },
    {
      id: '6',
      title: 'Only Wanna Dance With You',
      artist: 'Annie',
      uri: require('../../assets/audio/only-wanna-dance-with-you.mp3'),
      artwork: require('../../assets/self-talk.jpg'),
    },
  ];

  // Mock lyrics data
  const lyricsData: { [key: string]: string[] } = {
    '1': [
      'Throwin petals like do you love me or not?',
      'Head is spinnin, and it dont know when to stop', 
      'Cause you said, "Forever," babe, did you mean it or not?',
      'babe, did you mean it or not?',
      'Hold on hold on',
      'You leave me on read, babe,',
      'but I still get the message',
      'Instead of a line, its three dots,',
      'but I can connect them',
      'And if it aint right, babe, you know Ill respect it',
      'But if you need time, just take your time',
      'Honey, I get it, I get it, I get it',
      'for educational purposes, adhering to copyright act section 30.02 ',
    ],
    '2': [
      'Do you still take a long time to get ready?',
      'Cause you used to make too',
      'much out of that kind of stuff',
      'When you turn your head',
      'around and it kills',
      'Cause the dress looks nice on you still',
      'And it always will', 
      'I wait a long time just to see you',
      'No, we dont have to patch things up',
      'Just turn the lights down for the thrill',
      'Cause the dress looks nice on you still',
      'And it always will, so',
      'We should go out and dance like we used to dance',
      'We should go out and hold hands – lovers hold hands',
      'Well maybe thats the question, an answer I dont have',
    ],
  };

  // Parse Apple Music track from params
  useEffect(() => {
    if (paramAppleMusicTrack) {
      try {
        console.log('Parsing Apple Music track from params...');
        const appleMusicTrack = JSON.parse(paramAppleMusicTrack as string);
        const convertedTrack: Track = {
          id: appleMusicTrack.id,
          title: appleMusicTrack.title,
          artist: appleMusicTrack.artist,
          album: appleMusicTrack.album,
          uri: appleMusicTrack.previewUrl,
          artwork: appleMusicTrack.artwork,
          isAppleMusic: true,
          previewUrl: appleMusicTrack.previewUrl,
        };
        setCurrentAppleMusicTrack(convertedTrack);
        setIsAppleMusicMode(true);
        console.log('Apple Music track parsed successfully:', convertedTrack.title);
        console.log('Preview URL:', convertedTrack.previewUrl);
        
        // Immediately load the Apple Music track
        loadAndPlayAudio(undefined, convertedTrack);
      } catch (error) {
        console.error('Error parsing Apple Music track:', error);
      }
    } else if (paramTrackIndex) {
      // Load local track if trackIndex is provided
      const trackIndex = parseInt(paramTrackIndex as string, 10);
      console.log('Loading local track with index:', trackIndex);
      loadAndPlayAudio(trackIndex);
    } else {
      // Default to first local track
      console.log('No specific track provided, loading first local track');
      loadAndPlayAudio(0);
    }
  }, [paramAppleMusicTrack, paramTrackIndex]);

  // Get current track based on mode
  const currentTrack = (isAppleMusicMode && currentAppleMusicTrack) 
    ? currentAppleMusicTrack 
    : playlist[currentTrackIndex] || playlist[0]; // Fallback to first track

  const currentLyrics = (currentTrack?.id && lyricsData[currentTrack.id]) || [
    'Lyrics not available for this track',
    '',
    isAppleMusicMode ? 'Apple Music previews may not include full lyrics.' : 'Lyrics will be available for supported tracks.',
  ];

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
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sound && isPlaying && !isSliding) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          
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

  const loadAndPlayAudio = async (trackIndex?: number, appleMusicTrack?: Track) => {
    try {
      setIsLoading(true);
      console.log('=== LOADING AUDIO ===');
      console.log('trackIndex:', trackIndex);
      console.log('appleMusicTrack provided:', !!appleMusicTrack);
      
      if (sound) {
        await sound.unloadAsync();
      }

      let track: Track;
      
      if (appleMusicTrack) {
        // Playing Apple Music track
        track = appleMusicTrack;
        setIsAppleMusicMode(true);
        setCurrentAppleMusicTrack(appleMusicTrack);
        console.log('🎵 Loading Apple Music track:', track.title);
        console.log('🔗 Preview URL:', track.previewUrl);
        console.log('🎨 Artwork:', track.artwork);
      } else {
        // Playing local track
        const targetIndex = trackIndex !== undefined ? trackIndex : currentTrackIndex;
        let foundTrack = playlist[targetIndex];
        
        // If track not found, try first track
        if (!foundTrack && playlist.length > 0) {
          foundTrack = playlist[0];
          setCurrentTrackIndex(0);
        }
        
        // If still no track found, exit
        if (!foundTrack) {
          console.error('❌ No valid tracks available');
          setIsLoading(false);
          return;
        }
        
        track = foundTrack;
        setIsAppleMusicMode(false);
        setCurrentAppleMusicTrack(null);
        console.log('🎵 Loading local track:', track.title);
      }

      if (!track) {
        console.error('❌ Track not found');
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

      // Handle different URI types
      let audioUri;
      if (track.isAppleMusic && track.previewUrl) {
        console.log('🌐 Using Apple Music preview URL:', track.previewUrl);
        audioUri = { uri: track.previewUrl };
      } else {
        console.log('📁 Using local audio file');
        audioUri = track.uri;
      }

      console.log('🔊 Creating audio with URI:', audioUri);

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioUri,
        { shouldPlay: false }
      );

      setSound(newSound);
      setPosition(0);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        console.log('✅ Audio loaded successfully, duration:', status.durationMillis);
      }

      await newSound.playAsync();
      setIsPlaying(true);
      setIsLoading(false);
      console.log('▶️ Audio playback started');
      console.log('=== LOADING COMPLETE ===');
    } catch (error) {
      console.error('❌ Error loading audio:', error);
      setIsLoading(false);
      
      // Show specific error messages for Apple Music tracks
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (appleMusicTrack && appleMusicTrack.isAppleMusic) {
        console.log('🎵 Apple Music track error:', errorMessage);
        
        // Handle specific Apple Music preview errors
        if (errorMessage.includes('network') || 
            errorMessage.includes('403') || 
            errorMessage.includes('404') || 
            errorMessage.includes('-1008') ||
            errorMessage.includes('NSURLErrorDomain') ||
            errorMessage.includes('cannot decode')) {
          
          console.log('🚨 Apple Music preview URL error - likely mock data or invalid URL');
          
          Alert.alert(
            'Apple Music Preview Not Available',
            'This Apple Music track preview cannot be played. This is likely because we\'re using mock data for development.\n\nWould you like to play a local track instead?',
            [
              { text: 'Return to Search', onPress: () => router.back() },
              { text: 'Play Local Track', onPress: () => {
                setIsAppleMusicMode(false);
                setCurrentAppleMusicTrack(null);
                loadAndPlayAudio(0);
              }}
            ]
          );
        } else {
          Alert.alert(
            'Playback Error',
            `Unable to play this Apple Music track: ${errorMessage}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Playback Error',
          `Unable to play this track: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      if (currentAppleMusicTrack) {
        await loadAndPlayAudio(undefined, currentAppleMusicTrack);
      } else {
        await loadAndPlayAudio(currentTrackIndex);
      }
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

  const getRandomTrackIndex = (): number => {
    if (playlist.length <= 1) return 0;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentTrackIndex);
    
    return randomIndex;
  };

  const handleTrackEnd = async () => {
    if (isAppleMusicMode) {
      // Apple Music previews are only 30 seconds, offer to continue with local music
      Alert.alert(
        'Preview Ended',
        'This was a 30-second Apple Music preview. Would you like to continue with your local library?',
        [
          { text: 'Stay Here', style: 'cancel' },
          { 
            text: 'Continue with Library', 
            onPress: () => {
              setIsAppleMusicMode(false);
              setCurrentAppleMusicTrack(null);
              loadAndPlayAudio(0);
            }
          }
        ]
      );
      return;
    }

    if (repeatMode === 'one') {
      await loadAndPlayAudio(currentTrackIndex);
    } else if (repeatMode === 'all' || repeatMode === 'off') {
      await nextTrack();
    }
  };

  const nextTrack = async () => {
    if (isAppleMusicMode) {
      // For Apple Music tracks, offer to return to local playlist
      Alert.alert(
        'End of Track',
        'This was an Apple Music preview. Return to your library?',
        [
          { text: 'Stay', style: 'cancel' },
          { 
            text: 'Return to Library', 
            onPress: () => {
              setIsAppleMusicMode(false);
              setCurrentAppleMusicTrack(null);
              loadAndPlayAudio(0);
            }
          }
        ]
      );
      return;
    }

    let nextIndex: number;

    if (isShuffleEnabled) {
      nextIndex = getRandomTrackIndex();
      setShuffleHistory(prev => [...prev, currentTrackIndex]);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
      
      if (nextIndex === 0 && repeatMode === 'off') {
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
    if (isAppleMusicMode) {
      // Similar handling for Apple Music mode
      Alert.alert(
        'Apple Music Track',
        'Return to your library to navigate between tracks?',
        [
          { text: 'Stay', style: 'cancel' },
          { 
            text: 'Return to Library', 
            onPress: () => {
              setIsAppleMusicMode(false);
              setCurrentAppleMusicTrack(null);
              loadAndPlayAudio(currentTrackIndex);
            }
          }
        ]
      );
      return;
    }

    let prevIndex: number;

    if (isShuffleEnabled && shuffleHistory.length > 0) {
      const history = [...shuffleHistory];
      prevIndex = history.pop() || 0;
      setShuffleHistory(history);
    } else {
      prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    }

    setCurrentTrackIndex(prevIndex);
    await loadAndPlayAudio(prevIndex);
  };

  const toggleShuffle = () => {
    if (isAppleMusicMode) return; // Disable for Apple Music
    setIsShuffleEnabled(!isShuffleEnabled);
    if (!isShuffleEnabled) {
      setShuffleHistory([]);
    }
  };

  const toggleRepeat = () => {
    if (isAppleMusicMode) return; // Disable for Apple Music
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
    if (isAppleMusicMode) {
      Alert.alert(
        'Add to Favorites',
        'Apple Music tracks cannot be added to favorites. This feature is only available for your local library.',
        [{ text: 'OK' }]
      );
      return;
    }
    toggleFavorite(currentTrack);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    if (isAppleMusicMode) {
      Alert.alert(
        'Add to Playlist',
        'Apple Music tracks cannot be added to playlists. This feature is only available for your local library.',
        [{ text: 'OK' }]
      );
      setShowDropdown(false);
      return;
    }

    addToPlaylist(playlistId as 'mondayMood' | 'gym', currentTrack);
    console.log(`Adding "${currentTrack.title}" to "${playlistName}"`);
    setShowDropdown(false);
    
    setTimeout(() => {
      Alert.alert(
        "Added to Playlist", 
        `"${currentTrack.title}" has been added to "${playlistName}"`
      );
    }, 100);
  };

  // Handle Apple Music button press
  const handleOpenInAppleMusic = () => {
    Alert.alert(
      'Open in Apple Music',
      'This would open the full track in the Apple Music app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Apple Music', onPress: () => {
          // In a real implementation, you would open the Apple Music app
          console.log('Opening Apple Music app...');
        }}
      ]
    );
  };

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

  const isCurrentTrackFavorite = !isAppleMusicMode && isFavorite(currentTrack.id);

  // Get artwork source with Apple Music support
  const getArtworkSource = () => {
    if (currentTrack.isAppleMusic && currentTrack.artwork?.uri) {
      return { uri: currentTrack.artwork.uri };
    }
    return currentTrack.artwork || require('../../assets/swag.jpg');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Apple Music indicator */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.leftButton}>
          <Ionicons name="chevron-down" size={15} color="#F9E1CF" />  
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isAppleMusicMode ? 'APPLE MUSIC PREVIEW' : 'PLAYING FROM PLAYLIST'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentTrack.title}
          </Text>
          {isAppleMusicMode && (
            <View style={styles.previewBadge}>
              <Ionicons name="musical-notes" size={12} color="#FA2D48" />
              <Text style={styles.previewText}>30s Preview</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={toggleDropdown} style={styles.rightButton}>
          <Ionicons name="ellipsis-vertical" size={15} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* Album Artwork with Apple Music support */}
      <View style={styles.artworkContainer}>
        <Image
          source={getArtworkSource()}
          style={styles.artwork}
          defaultSource={require('../../assets/swag.jpg')}
        />
        {isAppleMusicMode && (
          <View style={styles.appleMusicOverlay}>
            <Ionicons name="musical-notes" size={24} color="#FA2D48" />
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{currentTrack.title}</Text>
        <Text style={styles.trackArtist}>
          {currentTrack.artist}
          {currentTrack.album && ` • ${currentTrack.album}`}
        </Text>
        <TouchableOpacity style={styles.heartIcon} onPress={handleToggleFavorite}>
          <Ionicons 
            name={isCurrentTrackFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isAppleMusicMode ? "#666" : "#F9E1CF"} 
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

      {/* Controls with Apple Music limitations */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          onPress={toggleShuffle}
          disabled={isAppleMusicMode}
          style={isAppleMusicMode ? styles.disabledButton : {}}
        >
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={isAppleMusicMode ? '#666' : (isShuffleEnabled ? '#1DB954' : '#F9E1CF')} 
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

        <TouchableOpacity 
          onPress={toggleRepeat}
          disabled={isAppleMusicMode}
          style={isAppleMusicMode ? styles.disabledButton : {}}
        >
          <View style={styles.repeatContainer}>
            <Ionicons 
              name={getRepeatIcon()} 
              size={24} 
              color={isAppleMusicMode ? '#666' : getRepeatColor()} 
            />
            {repeatMode === 'one' && !isAppleMusicMode && (
              <View style={styles.repeatOneIndicator}>
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Apple Music info section */}
      {isAppleMusicMode && (
        <View style={styles.appleMusicInfo}>
          <Text style={styles.appleMusicInfoText}>
            This is a 30-second preview from Apple Music
          </Text>
          <TouchableOpacity style={styles.appleMusicButton} onPress={handleOpenInAppleMusic}>
            <Text style={styles.appleMusicButtonText}>Open in Apple Music</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lyrics Section */}
      <View style={styles.lyricsSection}>
        <TouchableOpacity style={styles.lyricsButton} onPress={openLyricsModal}>
          <Text style={styles.lyricsText}>LYRICS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lyricsButton} onPress={openLyricsModal}>
          <Ionicons name="chevron-up" size={16} color="#F9E1CF" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <TouchableOpacity 
            style={styles.dropdownBackdrop}
            onPress={() => setShowDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownMenu}>
              <Text style={styles.dropdownTitle}>
                {isAppleMusicMode ? '⚠️ Apple Music Track' : '+  Add to Playlist'}
              </Text>
              {isAppleMusicMode ? (
                <Text style={styles.appleMusicWarning}>
                  Apple Music tracks cannot be added to your playlists. This feature is only available for your local library.
                </Text>
              ) : (
                availablePlaylists.map((playlist) => (
                  <TouchableOpacity 
                    key={playlist.id}
                    style={styles.dropdownItem}
                    onPress={() => handleAddToPlaylist(playlist.id, playlist.name)}
                  >
                    <Image source={playlist.cover} style={styles.dropdownItemCover} />
                    <Text style={styles.dropdownItemText}>{playlist.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </>
      )}

      {/* Lyrics Modal */}
      <Modal
        visible={showLyrics}
        transparent={true}
        animationType="none"
        onRequestClose={closeLyricsModal}
      >
        <View style={styles.lyricsModalContainer}>
          <Animated.View 
            style={[
              styles.lyricsModal,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.lyricsHeader}>
              <TouchableOpacity onPress={closeLyricsModal}>
                <Ionicons name="chevron-down" size={24} color="#F9E1CF" />
              </TouchableOpacity>
              <View style={styles.lyricsHeaderInfo}>
                <Text style={styles.lyricsHeaderTitle}>LYRICS</Text>
                <Text style={styles.lyricsHeaderSubtitle}>
                  {currentTrack.title} • {currentTrack.artist}
                  {isAppleMusicMode && ' (Apple Music)'}
                </Text>
              </View>
              <TouchableOpacity>
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
    backgroundColor: '#0A0E26',
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
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FA2D48',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  previewText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
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
  appleMusicOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
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
    width: '90%',
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
  disabledButton: {
    opacity: 0.5,
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
    color: '#F9E1CF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  appleMusicInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  appleMusicInfoText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  appleMusicButton: {
    backgroundColor: '#FA2D48',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  appleMusicButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lyricsSection: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  lyricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  lyricsText: {
    fontSize: 13,
    color: '#Ffffff',
    opacity: 0.5,
    fontWeight: '300',
  },
  dropdownContainer: {
    position: 'absolute',
    alignItems: 'flex-start',
    top: 80,
    right: 0,
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
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
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
  appleMusicWarning: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  lyricsModal: {
    height: height * 0.9,
    backgroundColor: '#0A0E26',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
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
  },
  lyricsSectionHeader: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
});