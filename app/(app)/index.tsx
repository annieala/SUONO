// File: app/(app)/index.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import Apple Music context
import { useAppleMusic } from '../../context/AppleMusicContext';

// Import Color context
import { useColor } from '../../context/ColorContext';

// Import Enhanced Search - simplified local-only version
import { EnhancedSearch } from '../../components/EnhancedSearch';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  
  // Use Apple Music context
  const { isAuthorized } = useAppleMusic();
  
  // Use Color context
  const { backgroundColor } = useColor();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the user's first name for greeting
  const firstName = user?.user_metadata?.first_name || 
                   user?.user_metadata?.firstName || 
                   user?.email?.split('@')[0] || 
                   'Friend';
  
  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Logout Error", "An unexpected error occurred while logging out.");
      console.error("Logout error:", error);
    }
  };

  const handleColorPickerPress = () => {
    router.push('/(app)/color-picker');
  };

  // Local tracks data for search - Only tracks that exist in player
  const localTracks = [
    { id: '1', title: 'Daisies', artist: 'Justin Bieber', cover: require('../../assets/swag.jpg'), trackIndex: 0, type: 'local' as const },
    { id: '2', title: 'The Dress', artist: 'Dijon', cover: require('../../assets/dijon.jpg'), trackIndex: 1, type: 'local' as const },
    { id: '3', title: 'Mutt', artist: 'Leon Thomas', cover: require('../../assets/mutt.jpg'), trackIndex: 2, type: 'local' as const },
  ];

  // Mock data for friends with local assets
  const friends = [
    { id: 1, name: 'Sarah', avatar: require('../../assets/beyonce.jpg')},
    { id: 2, name: 'Mike', avatar: require('../../assets/frank-ocean.jpg') },
    { id: 3, name: 'Emma', avatar: require('../../assets/sabrina-carpenter.jpg') },
    { id: 4, name: 'Alex', avatar: require('../../assets/childish-gambino.jpg') },
  ];

  // Enhanced recently played with artist information and track mapping - Only existing tracks
  const recentlyPlayed = [
    { id: 1, title: 'Daisies', artist: 'Justin Bieber', cover: require('../../assets/swag.jpg'), trackIndex: 0 },
    { id: 2, title: 'The Dress', artist: 'Dijon', cover: require('../../assets/dijon.jpg'), trackIndex: 1 },
    { id: 3, title: 'Mutt', artist: 'Leon Thomas', cover: require('../../assets/mutt.jpg'), trackIndex: 2 },
  ];

  // Mock data for playlists with local assets
  const playlists = [
    { id: 1, name: '☆ Favourites ☆', cover: require('../../assets/fool.jpg') },
    { id: 2, name: '⋆｡˚ ☁︎ ˚｡ Monday Mood ⋆｡˚☽˚｡⋆ ', cover: require('../../assets/lovetide.jpg') },
    { id: 3, name: '❚█══█❚ Gym ❚█══█❚', cover: require('../../assets/640x640.jpg') },
  ];

  // Handle friend press - navigate to player with specific track
  const handleFriendPress = (friendId: number) => {
    let trackIndex: number;
    
    switch (friendId) {
      case 1: // Sarah - plays "The Dress" (track index 1)
        trackIndex = 1;
        break;
      case 2: // Mike - plays "Mutt" (track index 2)
        trackIndex = 2;
        break;
      case 3: // Emma - plays "Daisies" (track index 0)
        trackIndex = 0;
        break;
      case 4: // Alex - plays "The Dress" (track index 1)
        trackIndex = 1;
        break;
      default:
        // Fallback to first track
        trackIndex = 0;
    }
    
    // Navigate to player with specific track index
    router.push({
      pathname: '/(app)/player',
      params: { trackIndex: trackIndex.toString() }
    });
  };

  // Handle search result selection - Updated for proper routing
  const handleTrackSelect = (track: any) => {
    console.log('Track selected:', track.title, 'Type:', track.type);
    
    if (track.type === 'local' && track.trackIndex !== undefined) {
      // Navigate to player with specific local track index
      console.log('Navigating to local track, index:', track.trackIndex);
      router.push({
        pathname: '/(app)/player',
        params: { trackIndex: track.trackIndex.toString() }
      });
    } else if (track.type === 'apple-music') {
      // Navigate to player with Apple Music track data
      console.log('Navigating to Apple Music track:', track.title);
      const appleMusicTrackData = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        previewUrl: track.previewUrl,
        artwork: track.artwork,
      };
      
      router.push({
        pathname: '/(app)/player',
        params: { 
          appleMusicTrack: JSON.stringify(appleMusicTrackData)
        }
      });
    } else {
      // Fallback - go to default player
      console.log('Fallback routing to default player');
      router.push('/(app)/player');
    }
  };

  const handleRecentlyPlayedPress = (item: any) => {
    if (item.trackIndex !== undefined) {
      router.push({
        pathname: '/(app)/player',
        params: { trackIndex: item.trackIndex.toString() }
      });
    } else {
      router.push('/(app)/player');
    }
  };

  // Create dynamic styles based on background color
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    playlistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      borderRadius: 12,
      padding: 12,
    },
    logoutButton: {
      backgroundColor: backgroundColor,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    appleMusicBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9E1CF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: backgroundColor,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with greeting and Apple Music status */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()} {firstName} ✨
          </Text>
          {isAuthorized && (
            <View style={dynamicStyles.appleMusicBadge}>
              <Ionicons name="musical-notes" size={12} color="#0A0E26" />
              <Text style={styles.appleMusicText}>Apple Music</Text>
            </View>
          )}
        </View>

        {/* Enhanced Search Component */}
        <EnhancedSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          localTracks={localTracks}
          onTrackSelect={handleTrackSelect}
        />

        {/* Show default content when not searching */}
        {searchQuery.length === 0 && (
          <>
            {/* Friends listening section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Friends are listening to...</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.friendsContainer}
              >
                {friends.map((friend) => (
                  <TouchableOpacity 
                    key={friend.id} 
                    style={styles.friendItem}
                    onPress={() => handleFriendPress(friend.id)}
                  >
                    <Image source={friend.avatar} style={styles.friendAvatar} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recently played section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Played...</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentlyPlayedContainer}
              >
                {recentlyPlayed.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.recentlyPlayedItem}
                    onPress={() => handleRecentlyPlayedPress(item)}
                  >
                    <Image source={item.cover} style={styles.albumCover} />
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>{item.artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Playlists section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Playlists ♡</Text>
              <View style={styles.playlistsContainer}>
                {playlists.map((playlist) => (
                  <TouchableOpacity 
                    key={playlist.id} 
                    style={dynamicStyles.playlistItem}
                    onPress={() => {
                      // Navigate to specific playlist screens
                      if (playlist.id === 1) {
                        router.push('/(app)/favorites');
                      } else if (playlist.id === 2) {
                        router.push('/(app)/monday-mood');
                      } else if (playlist.id === 3) {
                        router.push('/(app)/gym');
                      }
                    }}
                  >
                    <Image source={playlist.cover} style={styles.playlistCover} />
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Bottom buttons container */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity onPress={handleLogout} style={dynamicStyles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleColorPickerPress} style={styles.colorButton}>
            <Ionicons name="color-palette" size={16} color="#F9E1CF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '400',
    color: '#F9E1CF',
    flex: 1,
  },
  appleMusicText: {
    color: '#0A0E26',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9E1CF',
    marginBottom: 20,
  },
  friendsContainer: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  friendItem: {
    marginRight: 15,
    padding: 8,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: .5,
    borderColor: '#F9E1CF',
  },
  recentlyPlayedContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  recentlyPlayedItem: {
    marginRight: 15,
    width: 120,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    color: '#F9E1CF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemArtist: {
    color: '#b2b2b2',
    fontSize: 12,
  },
  playlistsContainer: {
    gap: 15,
  },
  playlistCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  playlistName: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 30,
    gap: 15,
  },
  logoutText: {
    color: '#F9E1CF',
    fontSize: 10,
    fontWeight: '600',
  },
  colorButton: {
    backgroundColor: 'rgba(249, 225, 207, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 225, 207, 0.3)',
  },
});