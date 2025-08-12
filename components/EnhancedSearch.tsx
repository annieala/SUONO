// File: components/EnhancedSearch.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import Apple Music context
import { useAppleMusic, type AppleMusicTrack } from '../context/AppleMusicContext';

interface LocalTrack {
  id: string;
  title: string;
  artist: string;
  cover: any;
  trackIndex?: number;
  type: 'local';
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: any;
  type: 'local' | 'apple-music';
  trackIndex?: number;
  previewUrl?: string | null;
  source: 'Local Library' | 'Apple Music';
}

interface EnhancedSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  localTracks: LocalTrack[];
  onTrackSelect: (track: SearchResult) => void;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  searchQuery,
  setSearchQuery,
  localTracks,
  onTrackSelect,
}) => {
  const { isAuthorized, searchTracks, getTrackPreviewUrl, authorize, isLoading } = useAppleMusic();
  const [appleMusicResults, setAppleMusicResults] = useState<SearchResult[]>([]);
  const [isSearchingAppleMusic, setIsSearchingAppleMusic] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search for Apple Music
  useEffect(() => {
    if (searchQuery.length > 2 && isAuthorized) {
      const timeoutId = setTimeout(() => {
        searchAppleMusic(searchQuery);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setAppleMusicResults([]);
    }
  }, [searchQuery, isAuthorized]);

  const searchAppleMusic = async (query: string) => {
    setIsSearchingAppleMusic(true);
    try {
      console.log('🔍 EnhancedSearch: Starting Apple Music search for:', query);
      const tracks = await searchTracks(query);
      console.log('📥 EnhancedSearch: Received tracks from API:', tracks.length);
      
      const convertedTracks: SearchResult[] = tracks.map((track, index) => {
        console.log(`🎵 Converting track ${index + 1}:`, track.attributes.name);
        
        const converted = {
          id: track.id,
          title: track.attributes.name,
          artist: track.attributes.artistName,
          album: track.attributes.albumName,
          artwork: track.attributes.artwork ? {
            uri: track.attributes.artwork.url
              .replace('{w}', '300')
              .replace('{h}', '300')
          } : null,
          type: 'apple-music' as const,
          previewUrl: getTrackPreviewUrl(track) || null,
          source: 'Apple Music' as const,
        };
        
        console.log(`✅ Converted track: ${converted.title} by ${converted.artist}`);
        console.log(`   Preview URL: ${converted.previewUrl ? 'Available' : 'Not available'}`);
        console.log(`   Artwork: ${converted.artwork ? 'Available' : 'Not available'}`);
        
        return converted;
      });
      
      setAppleMusicResults(convertedTracks);
      console.log('🎯 EnhancedSearch: Apple Music results updated');
    } catch (error) {
      console.error('❌ EnhancedSearch: Apple Music search failed:', error);
    } finally {
      setIsSearchingAppleMusic(false);
    }
  };

  // Filter local tracks
  const filteredLocalTracks = useMemo(() => {
    if (!searchQuery) return [];
    return localTracks
      .filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: track.cover,
        type: 'local' as const,
        trackIndex: track.trackIndex,
        source: 'Local Library' as const,
      }));
  }, [searchQuery, localTracks]);

  // Combine and sort results
  const allResults = useMemo(() => {
    const combined = [...filteredLocalTracks, ...appleMusicResults];
    // Sort: Local tracks first, then Apple Music
    return combined.sort((a, b) => {
      if (a.type === 'local' && b.type === 'apple-music') return -1;
      if (a.type === 'apple-music' && b.type === 'local') return 1;
      return 0;
    });
  }, [filteredLocalTracks, appleMusicResults]);

  const handleTrackPress = (track: SearchResult) => {
    onTrackSelect(track);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleAppleMusicAuth = async () => {
    try {
      await authorize();
    } catch (error) {
      // Error handling is done in the context
    }
  };

  useEffect(() => {
    setShowResults(searchQuery.length > 0);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your library and Apple Music..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setShowResults(searchQuery.length > 0)}
          editable={!isLoading}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Apple Music Auth Banner */}
      {!isAuthorized && searchQuery.length > 0 && (
        <View style={styles.authBanner}>
          <View style={styles.authBannerContent}>
            <Ionicons name="musical-notes" size={24} color="#FA2D48" />
            <View style={styles.authBannerText}>
              <Text style={styles.authBannerTitle}>Connect to Apple Music</Text>
              <Text style={styles.authBannerSubtitle}>Search millions of songs</Text>
            </View>
            <TouchableOpacity 
              style={styles.connectButton} 
              onPress={handleAppleMusicAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Results */}
      {showResults && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Loading indicator for Apple Music */}
          {isSearchingAppleMusic && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#F9E1CF" />
              <Text style={styles.loadingText}>Searching Apple Music...</Text>
            </View>
          )}

          {/* Results */}
          {allResults.length > 0 ? (
            <>
              {/* Section Headers and Results */}
              {filteredLocalTracks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="phone-portrait" size={16} color="#F9E1CF" />
                    <Text style={styles.sectionTitle}>Your Library</Text>
                  </View>
                  {filteredLocalTracks.map((track) => (
                    <SearchResultItem
                      key={`local-${track.id}`}
                      track={track}
                      onPress={() => handleTrackPress(track)}
                    />
                  ))}
                </View>
              )}

              {appleMusicResults.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="musical-notes" size={16} color="#FA2D48" />
                    <Text style={styles.sectionTitle}>Apple Music</Text>
                  </View>
                  {appleMusicResults.map((track) => (
                    <SearchResultItem
                      key={`apple-${track.id}`}
                      track={track}
                      onPress={() => handleTrackPress(track)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            !isSearchingAppleMusic && searchQuery.length > 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#666" />
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>
                  {!isAuthorized 
                    ? "Connect to Apple Music to search millions more songs"
                    : "Try searching for a different song or artist"
                  }
                </Text>
              </View>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
};

// Search Result Item Component
interface SearchResultItemProps {
  track: SearchResult;
  onPress: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ track, onPress }) => {
  const getArtworkSource = () => {
    if (!track.artwork) {
      return require('../assets/swag.jpg'); // Fallback image
    }
    
    if (track.type === 'apple-music' && track.artwork?.uri) {
      return { uri: track.artwork.uri };
    }
    
    // For local tracks, artwork is the direct source
    return track.artwork;
  };

  return (
    <TouchableOpacity style={styles.resultItem} onPress={onPress}>
      <Image 
        source={getArtworkSource()} 
        style={styles.resultArtwork} 
        defaultSource={require('../assets/swag.jpg')}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.resultArtist} numberOfLines={1}>
          {track.artist}
          {track.album && ` • ${track.album}`}
        </Text>
        <Text style={styles.resultSource}>{track.source}</Text>
      </View>
      <View style={styles.resultActions}>
        {track.type === 'apple-music' && (
          <View style={styles.previewBadge}>
            <Text style={styles.previewText}>30s</Text>
          </View>
        )}
        <Ionicons 
          name={track.type === 'local' ? "play" : "headset"} 
          size={20} 
          color="#F9E1CF" 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    height: 45,
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
  authBanner: {
    backgroundColor: '#1a1a1a',
    marginTop: 10,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FA2D48',
  },
  authBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  authBannerTitle: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: '600',
  },
  authBannerSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: '#FA2D48',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    maxHeight: 400,
    marginTop: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#F9E1CF',
    marginLeft: 10,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#0f1729',
    marginBottom: 5,
    borderRadius: 8,
  },
  resultArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: '#F9E1CF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultArtist: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  resultSource: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBadge: {
    backgroundColor: '#FA2D48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  previewText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
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
    paddingHorizontal: 20,
  },
});