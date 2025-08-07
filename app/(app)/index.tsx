// File: app/(tabs)/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';


export default function HomeScreen() {
  const { user, signOut } = useAuth();
  
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

  // Mock data for friends with local assets
  const friends = [
    { id: 1, name: 'Sarah', avatar: require('../../assets/beyonce.jpg')},
    { id: 2, name: 'Mike', avatar: require('../../assets/frank-ocean.jpg') },
    { id: 3, name: 'Emma', avatar: require('../../assets/sabrina-carpenter.jpg') },
    { id: 4, name: 'Alex', avatar: require('../../assets/childish-gambino.jpg') },
  ];

  // Mock data for recently played with local assets
  const recentlyPlayed = [
    { id: 1, title: 'Album 1', cover: require('../../assets/swag.jpg') },
    { id: 2, title: 'Album 2', cover: require('../../assets/dijon.jpg') },
    { id: 3, title: 'Album 3', cover: require('../../assets/mutt.jpg') },
  ];

  // Mock data for playlists with local assets
  const playlists = [
    { id: 1, name: '⭐ Favorites ⭐', cover: require('../../assets/fool.jpg') },
    { id: 2, name: '☁️ ☁️ Monday Mood ☁️ ☁️', cover: require('../../assets/lovetide.jpg') },
    { id: 3, name: '🏋️ Gym 🏋️', cover: require('../../assets/640x640.jpg') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()} {firstName} ✨
          </Text>
          
          {/* Logout button (you can move this to a settings screen later) */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

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
              onPress={() => {
                // Make the first album (SWAG) clickable to go to player
                if (index === 0) {
                  router.push('/(app)/player');
                }
              }}
            >
              <Image source={item.cover} style={styles.albumCover} />
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
                  if (playlist.id === 1) { // Favorites playlist
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Dark blue background like in the design
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
    marginBottom: 30,
  },
  greeting: {
    fontSize: 25,
    fontWeight: '500',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#5f045cff', // Purple color
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 15,
  },
  friendsContainer: {
    flexDirection: 'row',
  },
  friendItem: {
    marginRight: 15,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: .5,
    borderColor: '#ffffff',
  },
  recentlyPlayedContainer: {
    flexDirection: 'row',
  },
  recentlyPlayedItem: {
    marginRight: 15,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  playlistsContainer: {
    gap: 15,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e', // Slightly lighter than background
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});