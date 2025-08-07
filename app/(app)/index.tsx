// File: app/(app)/index.tsx
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the user's first name for greeting - try multiple sources
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

  // Define interfaces for better type safety
  interface PlaylistItem {
    id: number;
    name: string;
    cover: any;
  }

  interface RecentlyPlayedItem {
    id: number;
    title: string;
    artist: string;
    cover: any;
    trackIndex?: number; // Add track index to map to player playlist
  }

  interface SearchableItem {
    id: number;
    title: string;
    artist?: string; // Optional for playlists
    cover: any;
    type: 'Playlist' | 'Album';
    trackIndex?: number; // Add track index for direct player navigation
  }

  // Mock data for friends with local assets
  const friends = [
    { id: 1, name: 'Sarah', avatar: require('../../assets/beyonce.jpg')},
    { id: 2, name: 'Mike', avatar: require('../../assets/frank-ocean.jpg') },
    { id: 3, name: 'Emma', avatar: require('../../assets/sabrina-carpenter.jpg') },
    { id: 4, name: 'Alex', avatar: require('../../assets/childish-gambino.jpg') },
  ];

  // Enhanced recently played with artist information and track mapping
  const recentlyPlayed: RecentlyPlayedItem[] = [
    { id: 1, title: 'Daisies', artist: 'Justin Bieber', cover: require('../../assets/swag.jpg'), trackIndex: 0 },
    { id: 2, title: 'The Dress', artist: 'Dijon', cover: require('../../assets/dijon.jpg'), trackIndex: 1 },
    { id: 3, title: 'Mutt', artist: 'Leon Thomas', cover: require('../../assets/mutt.jpg'), trackIndex: 2 },
  ];

  // Mock data for playlists with local assets
  const playlists: PlaylistItem[] = [
    { id: 1, name: '☆ Favourites ☆', cover: require('../../assets/fool.jpg') },
    { id: 2, name: '⋆｡˚ ☁︎ ˚｡ Monday Mood ⋆｡˚☽˚｡⋆ ', cover: require('../../assets/lovetide.jpg') },
    { id: 3, name: '❚█══█❚ Gym ❚█══█❚', cover: require('../../assets/640x640.jpg') },
  ];

  // Search functionality with proper typing and track mapping
  const allSearchableItems = useMemo((): SearchableItem[] => {
    const mappedPlaylists: SearchableItem[] = playlists.map(p => ({ 
      id: p.id,
      title: p.name,
      cover: p.cover,
      type: 'Playlist' as const
    }));
    const mappedRecentlyPlayed: SearchableItem[] = recentlyPlayed.map(r => ({ 
      id: r.id,
      title: r.title,
      artist: r.artist,
      cover: r.cover,
      type: 'Album' as const,
      trackIndex: r.trackIndex // Include track index for navigation
    }));
    return [...mappedPlaylists, ...mappedRecentlyPlayed];
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    return allSearchableItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, allSearchableItems]);

  const handleSearchResultPress = (item: SearchableItem) => {
    if (item.type === 'Playlist' && item.id === 1) {
      // Navigate to favorites
      router.push('/(app)/favorites');
    } else if (item.type === 'Album' && item.trackIndex !== undefined) {
      // Navigate to player with specific track index
      router.push({
        pathname: '/(app)/player',
        params: { trackIndex: item.trackIndex.toString() }
      });
    } else {
      // Default player navigation
      router.push('/(app)/player');
    }
  };

  const handleRecentlyPlayedPress = (item: RecentlyPlayedItem) => {
    if (item.trackIndex !== undefined) {
      // Navigate to player with specific track
      router.push({
        pathname: '/(app)/player',
        params: { trackIndex: item.trackIndex.toString() }
      });
    } else {
      // Default navigation
      router.push('/(app)/player');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()} {firstName} ✨
          </Text>
          
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs, albums, artists..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Conditional Content */}
        {searchQuery.length > 0 ? (
          // Search Results View
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {filteredData.length > 0 ? (
              <View style={styles.playlistsContainer}>
                {filteredData.map((item) => (
                  <TouchableOpacity 
                    key={`${item.type}-${item.id}`} 
                    style={styles.playlistItem}
                    onPress={() => handleSearchResultPress(item)}
                  >
                    <Image source={item.cover} style={styles.playlistCover} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.playlistName}>{item.title}</Text>
                      <Text style={styles.itemType}>{item.artist || item.type}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#666" />
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>Try searching for a different song, artist, or playlist</Text>
              </View>
            )}
          </View>
        ) : (
          // Default View
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
                  <TouchableOpacity key={friend.id} style={styles.friendItem}>
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
                {recentlyPlayed.map((item, index) => (
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
                    style={styles.playlistItem}
                    onPress={() => {
                      // Navigate to favorites if it's the favorites playlist
                      if (playlist.id === 1) {
                        router.push('/(app)/favorites');
                      }
                      // Add other playlist navigation here later
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E26',
  },
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
    fontSize: 30,
    fontWeight: '400',
    color: '#F9E1CF',
  },
  logoutButton: {
    backgroundColor: '#0A0E26',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#F9E1CF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginBottom: -10,
    height: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    marginLeft: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    color: '#F9E1CF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  noResultsSubtext: {
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemType: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9E1CF',
    marginBottom: 25,
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
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0E26',
    borderRadius: 12,
    padding: 12,
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
});