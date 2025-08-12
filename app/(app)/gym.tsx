// File: app/(app)/gym.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePlaylists } from '../../context/PlaylistsContext';

export default function GymScreen() {
  const { playlists, removeFromPlaylist } = usePlaylists();
  const gymTracks = playlists.gym || [];

  const handleBack = () => {
    router.back();
  };

  const handlePlaySong = (track: any, index: number) => {
    // Find the track in the main playlist and navigate to player
    // For now, we'll just go to the player - you can enhance this to start from the specific track
    router.push('/(app)/player');
  };

  const handleRemoveFromPlaylist = (trackId: string) => {
    removeFromPlaylist('gym', trackId);
  };

  const renderTrackItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => handlePlaySong(item, index)}
    >
      <Image source={item.artwork} style={styles.trackArtwork} />
      <View style={styles.trackDetails}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFromPlaylist(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❚█══█❚ Gym ❚█══█❚</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroBackground}>
          <Image 
            source={require('../../assets/640x640.jpg')} 
            style={styles.heroBackgroundImage}
          />
          <View style={styles.heroOverlay} />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>❚█══█❚ Gym ❚█══█❚</Text>
          <Text style={styles.heroSubtitle}>Pump up the energy...</Text>
        </View>
      </View>

      {/* Content */}
      {gymTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Workout Songs Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add some high-energy tracks to your gym playlist from the player!
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={gymTracks}
            keyExtractor={(item) => item.id}
            renderItem={renderTrackItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {/* Friends Section */}
      {gymTracks.length > 0 && (
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>Friends are listening to...</Text>
            <Ionicons name="chevron-forward" size={16} color="#aaa" />
          </View>
          <View style={styles.friendsContent}>
            <Image source={require('../../assets/640x640.jpg')} style={styles.friendsImage} />
            <Text style={styles.friendsTrack}>ENERGY BOOST</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  optionsButton: {
    padding: 8,
  },
  heroSection: {
    height: 200,
    position: 'relative',
    marginBottom: 20,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 20, 25, 0.7)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#aaa',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  trackArtwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#aaa',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  friendsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1f25',
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  friendsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  friendsContent: {
    alignItems: 'center',
  },
  friendsImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendsTrack: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});