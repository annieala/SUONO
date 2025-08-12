// File: context/AppleMusicContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

// Apple Music Track Interfaces
export interface AppleMusicTrack {
  id: string;
  type: 'songs';
  href: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    releaseDate: string;
    isrc?: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
      bgColor?: string;
      textColor1?: string;
      textColor2?: string;
      textColor3?: string;
      textColor4?: string;
    };
    previews?: Array<{
      url: string | null; // Fixed: Allow null URLs
    }>;
    playParams?: {
      id: string;
      kind: string;
    };
  };
}

export interface AppleMusicSearchResponse {
  results: {
    songs?: {
      data: AppleMusicTrack[];
      next?: string;
    };
  };
}

// Converted track for our app
export interface ConvertedAppleMusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: {
    uri: string;
    width: number;
    height: number;
  };
  previewUrl?: string | null; // Fixed: Made consistent with usage
  duration: number;
  releaseDate: string;
  appleMusicId: string;
}

// Context Interface
interface AppleMusicContextType {
  // State
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth Methods
  authorize: () => Promise<void>;
  unauthorize: () => Promise<void>;
  checkAuthorizationStatus: () => Promise<boolean>;
  
  // Search Methods
  searchTracks: (query: string, limit?: number) => Promise<AppleMusicTrack[]>;
  
  // Utility Methods
  getTrackPreviewUrl: (track: AppleMusicTrack) => string | null;
  convertAppleMusicTrack: (track: AppleMusicTrack) => ConvertedAppleMusicTrack;
  
  // Player Methods (for future use)
  playPreview: (previewUrl: string) => Promise<void>;
  stopPreview: () => void;
}

// Create Context
const AppleMusicContext = createContext<AppleMusicContextType | undefined>(undefined);

// Provider Props
interface AppleMusicProviderProps {
  children: ReactNode;
  developerToken?: string; // Your Apple Music Developer Token
}

// Mock MusicKit for development
interface MusicKitInstance {
  isAuthorized: boolean;
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
  api: {
    search: (term: string, options?: any) => Promise<AppleMusicSearchResponse>;
  };
}

// Declare global MusicKit (would be loaded via script in web or native module)
declare global {
  interface Window {
    MusicKit?: {
      getInstance: () => MusicKitInstance;
      configure: (options: any) => MusicKitInstance;
    };
  }
}

export const AppleMusicProvider: React.FC<AppleMusicProviderProps> = ({ 
  children, 
  developerToken 
}) => {
  // State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicKitInstance, setMusicKitInstance] = useState<MusicKitInstance | null>(null);

  // Initialize MusicKit
  useEffect(() => {
    initializeMusicKit();
  }, []);

  const initializeMusicKit = async () => {
    try {
      console.log('Initializing Apple Music API...');
      console.log('Developer token available:', !!developerToken);
      console.log('Developer token length:', developerToken?.length || 0);
      
      if (Platform.OS === 'web') {
        // Web initialization (would require MusicKit JS for full user library access)
        if (typeof window !== 'undefined' && window.MusicKit) {
          const music = window.MusicKit.configure({
            developerToken: developerToken || '',
            app: {
              name: 'Suono Music App',
              build: '1.0.0'
            }
          });
          setMusicKitInstance(music);
          setIsAuthorized(music.isAuthorized);
        } else {
          // MusicKit not available in web environment, use API-only implementation
          console.log('Using Apple Music API-only implementation for web');
          setMusicKitInstance(createRealAppleMusicKit());
        }
      } else {
        // React Native - use API-only implementation with real Apple Music API
        console.log('React Native detected, using Apple Music API implementation');
        setMusicKitInstance(createRealAppleMusicKit());
      }
    } catch (err) {
      console.error('Failed to initialize Apple Music API:', err);
      setError('Failed to initialize Apple Music');
      // Fallback to API implementation
      setMusicKitInstance(createRealAppleMusicKit());
    }
  };

  // Create real Apple Music API implementation
  const createRealAppleMusicKit = (): MusicKitInstance => ({
    isAuthorized: false,
    authorize: async () => {
      // For API-only access, we just check if we have a valid developer token
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (developerToken && developerToken.length > 100) {
            console.log('Apple Music API access authorized with developer token');
            resolve('authorized');
          } else {
            reject(new Error('Invalid or missing developer token'));
          }
        }, 500);
      });
    },
    unauthorize: async () => {
      return Promise.resolve();
    },
    api: {
      search: async (term: string, options?: any) => {
        console.log('🎵 Making real Apple Music API call for:', term);
        
        if (!developerToken) {
          throw new Error('No Apple Music developer token available');
        }

        try {
          // Apple Music API endpoint
          const apiUrl = `https://api.music.apple.com/v1/catalog/us/search`;
          const params = new URLSearchParams({
            term: term,
            types: 'songs',
            limit: (options?.limit || 10).toString(),
            l: 'en-us'
          });

          console.log('🌐 Calling Apple Music API:', `${apiUrl}?${params}`);

          const response = await fetch(`${apiUrl}?${params}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${developerToken}`,
              'Music-User-Token': '', // Not needed for catalog search
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error('❌ Apple Music API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            throw new Error(`Apple Music API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ Apple Music API response received');
          console.log('📊 Found tracks:', data.results?.songs?.data?.length || 0);

          // Log first track for debugging
          if (data.results?.songs?.data?.[0]) {
            const firstTrack = data.results.songs.data[0];
            console.log('🎵 First track sample:', {
              name: firstTrack.attributes?.name,
              artist: firstTrack.attributes?.artistName,
              hasPreview: !!firstTrack.attributes?.previews?.[0]?.url,
              hasArtwork: !!firstTrack.attributes?.artwork?.url
            });
          }

          return data;
        } catch (error) {
          console.error('❌ Apple Music API call failed:', error);
          throw error;
        }
      }
    }
  });

  // Authorization Methods
  const authorize = async (): Promise<void> => {
    if (!musicKitInstance) {
      throw new Error('Apple Music API not initialized');
    }

    if (!developerToken) {
      throw new Error('Apple Music Developer Token not found. Please add EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN to your .env file');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting Apple Music API authorization...');
      console.log('🔑 Using developer token (length):', developerToken.length);
      
      await musicKitInstance.authorize();
      setIsAuthorized(true);
      console.log('✅ Apple Music API authorization successful');
      Alert.alert('Success', 'Successfully connected to Apple Music!\n\nYou can now search millions of songs and play 30-second previews.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authorization failed';
      setError(errorMessage);
      console.error('❌ Apple Music authorization failed:', errorMessage);
      Alert.alert(
        'Authorization Failed', 
        `Unable to connect to Apple Music: ${errorMessage}\n\nPlease check your internet connection and try again.`
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unauthorize = async (): Promise<void> => {
    if (!musicKitInstance) {
      throw new Error('MusicKit not initialized');
    }

    setIsLoading(true);
    try {
      await musicKitInstance.unauthorize();
      setIsAuthorized(false);
    } catch (err) {
      console.error('Unauthorization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthorizationStatus = async (): Promise<boolean> => {
    if (!musicKitInstance) {
      return false;
    }
    
    const authorized = musicKitInstance.isAuthorized;
    setIsAuthorized(authorized);
    return authorized;
  };

  // Search Methods
  const searchTracks = async (query: string, limit: number = 25): Promise<AppleMusicTrack[]> => {
    if (!musicKitInstance) {
      throw new Error('Apple Music API not initialized');
    }

    if (!isAuthorized) {
      console.log('Not authorized with Apple Music, please connect first');
      return [];
    }

    if (!developerToken) {
      console.error('No developer token available for Apple Music API');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 Searching Apple Music API for: "${query}"`);
      const response = await musicKitInstance.api.search(query, {
        types: 'songs',
        limit: limit,
        l: 'en-us'
      });

      const tracks = response.results.songs?.data || [];
      console.log(`✅ Found ${tracks.length} Apple Music tracks`);
      
      // Log some details about the tracks found
      tracks.forEach((track, index) => {
        console.log(`Track ${index + 1}: ${track.attributes.name} by ${track.attributes.artistName}`);
        console.log(`  - Has preview: ${!!track.attributes.previews?.[0]?.url}`);
        console.log(`  - Has artwork: ${!!track.attributes.artwork?.url}`);
      });

      return tracks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Apple Music search failed';
      setError(errorMessage);
      console.error('❌ Apple Music API search failed:', err);
      
      // Don't throw error, just return empty array to gracefully handle failures
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Utility Methods
  const getTrackPreviewUrl = (track: AppleMusicTrack): string | null => {
    const previewUrl = track.attributes.previews?.[0]?.url;
    return previewUrl || null;
  };

  // Player Methods (basic implementation)
  const playPreview = async (previewUrl: string): Promise<void> => {
    // This would integrate with your audio player
    console.log('Playing preview:', previewUrl);
    // For now, just a placeholder
  };

  const stopPreview = (): void => {
    // This would stop the current preview
    console.log('Stopping preview');
  };

  // Context Value
  const contextValue: AppleMusicContextType = {
    // State
    isAuthorized,
    isLoading,
    error,
    
    // Auth Methods
    authorize,
    unauthorize,
    checkAuthorizationStatus,
    
    // Search Methods
    searchTracks,
    
    // Utility Methods
    getTrackPreviewUrl,
    convertAppleMusicTrack,
    
    // Player Methods
    playPreview,
    stopPreview,
  };

  return (
    <AppleMusicContext.Provider value={contextValue}>
      {children}
    </AppleMusicContext.Provider>
  );
};

// Custom Hook
export const useAppleMusic = (): AppleMusicContextType => {
  const context = useContext(AppleMusicContext);
  if (context === undefined) {
    throw new Error('useAppleMusic must be used within an AppleMusicProvider');
  }
  return context;
};

// Utility function to convert Apple Music tracks
export const convertAppleMusicTrack = (track: AppleMusicTrack): ConvertedAppleMusicTrack => {
  const previewUrl = track.attributes.previews?.[0]?.url;
  
  return {
    id: `apple-${track.id}`,
    title: track.attributes.name,
    artist: track.attributes.artistName,
    album: track.attributes.albumName,
    artwork: track.attributes.artwork ? {
      uri: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
      width: track.attributes.artwork.width,
      height: track.attributes.artwork.height,
    } : undefined,
    previewUrl: previewUrl || null,
    duration: track.attributes.durationInMillis,
    releaseDate: track.attributes.releaseDate,
    appleMusicId: track.id,
  };
};