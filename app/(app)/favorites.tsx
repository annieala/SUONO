// File: app/(app)/favorites.tsx
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
import { useFavorites, Track } from '../../context/FavoritesContext';

export default function FavoritesScreen() {
  const { favorites, removeFromFavorites } = useFavorites();

  const handleBack = () => {
    router.back();
  };

  const handlePlaySong = (track: Track, index: number) => {
    // Navigate to player with the selected track
    // For now, we'll just go to the player - later we can pass track data
    router.push('/(app)/player');
  };

  const handleRemoveFavorite = (trackId: string) => {
    removeFromFavorites(trackId);
  };

  const renderFavoriteItem = ({ item, index }: { item: Track; index: number }) => (
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
        style={styles.heartButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Ionicons name="heart" size={20} color="#ff6b6b" />
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
        <Text style={styles.headerTitle}>☆ Favourites ☆</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroBackground}>
          <Image 
            source={require('../../assets/fool.jpg')} 
            style={styles.heroBackgroundImage}
          />
          <View style={styles.heroOverlay} />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>☆ Favourites ☆</Text>
          <Text style={styles.heroSubtitle}>Songs you've liked...</Text>
        </View>
      </View>

      {/* Content */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Favourites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any song to add it to your favourites!
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {/* Friends Section */}
      {favorites.length > 0 && (
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>Friends are listening to...</Text>
            <Ionicons name="chevron-forward" size={16} color="#aaa" />
          </View>
          <View style={styles.friendsContent}>
            <Image source={require('../../assets/swag.jpg')} style={styles.friendsImage} />
            <Text style={styles.friendsTrack}>SWAG</Text>
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
  heartButton: {
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