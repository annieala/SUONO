// File: context/SpotifyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import spotifyService from '../services/spotifyService';
import type { 
  SpotifyTrack, 
  SpotifyUser, 
  SpotifyPlaylist, 
  SpotifyCurrentlyPlaying,
  SpotifySearchResponse,
  SpotifySearchType 
} from '../services/spotifyService';

interface SpotifyContextType {
  // State
  isAuthenticated: boolean;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  userProfile: SpotifyUser | null;
  playlists: SpotifyPlaylist[];
  topTracks: SpotifyTrack[];
  loading: boolean;

  // Actions
  authenticate: () => Promise<void>;
  getCurrentTrack: () => Promise<SpotifyCurrentlyPlaying | null>;
  search: (query: string, type?: SpotifySearchType) => Promise<SpotifySearchResponse>;
  play: (uris?: string[]) => Promise<void>;
  pause: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  loadUserData: () => Promise<void>;
  logout: () => void;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useSpotify = (): SpotifyContextType => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

interface SpotifyProviderProps {
  children: ReactNode;
}

export const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const authenticate = async (): Promise<void> => {
    try {
      setLoading(true);
      await spotifyService.authenticate();
      setIsAuthenticated(true);
      await loadUserData();
      return;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (): Promise<void> => {
    try {
      const [profile, userPlaylists, tracks] = await Promise.all([
        spotifyService.getUserProfile(),
        spotifyService.getUserPlaylists(),
        spotifyService.getTopTracks()
      ]);

      setUserProfile(profile);
      setPlaylists(userPlaylists.items || []);
      setTopTracks(tracks.items || []);
      return;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return;
    }
  };

  const getCurrentTrack = async (): Promise<SpotifyCurrentlyPlaying | null> => {
    try {
      const current = await spotifyService.getCurrentlyPlaying();
      if (current?.item) {
        setCurrentTrack(current.item);
        setIsPlaying(current.is_playing);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
      return current;
    } catch (error) {
      console.error('Failed to get current track:', error);
      return null;
    }
  };

  const search = async (query: string, type: SpotifySearchType = 'track'): Promise<SpotifySearchResponse> => {
    try {
      setLoading(true);
      const results = await spotifyService.search(query, type);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const play = async (uris?: string[]): Promise<void> => {
    try {
      await spotifyService.play(undefined, uris);
      setIsPlaying(true);
      setTimeout(() => getCurrentTrack(), 1000);
      return;
    } catch (error) {
      console.error('Play failed:', error);
      throw error;
    }
  };

  const pause = async (): Promise<void> => {
    try {
      await spotifyService.pause();
      setIsPlaying(false);
      return;
    } catch (error) {
      console.error('Pause failed:', error);
      throw error;
    }
  };

  const skipToNext = async (): Promise<void> => {
    try {
      await spotifyService.skipToNext();
      setTimeout(() => getCurrentTrack(), 1000);
      return;
    } catch (error) {
      console.error('Skip to next failed:', error);
      throw error;
    }
  };

  const skipToPrevious = async (): Promise<void> => {
    try {
      await spotifyService.skipToPrevious();
      setTimeout(() => getCurrentTrack(), 1000);
      return;
    } catch (error) {
      console.error('Skip to previous failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    spotifyService.logout();
    setIsAuthenticated(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    setUserProfile(null);
    setPlaylists([]);
    setTopTracks([]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentTrack();
      const interval = setInterval(getCurrentTrack, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (spotifyService.isAuthenticated()) {
      setIsAuthenticated(true);
      loadUserData();
    }
  }, []);

  const value: SpotifyContextType = {
    isAuthenticated,
    currentTrack,
    isPlaying,
    userProfile,
    playlists,
    topTracks,
    loading,
    authenticate,
    getCurrentTrack,
    search,
    play,
    pause,
    skipToNext,
    skipToPrevious,
    loadUserData,
    logout,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};