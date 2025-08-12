// File: context/PlaylistsContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  uri: any;
  artwork?: any; // Make artwork optional to match player.tsx
}

interface PlaylistsState {
  mondayMood: Track[];
  gym: Track[];
}

interface PlaylistsContextType {
  playlists: PlaylistsState;
  addToPlaylist: (playlistName: keyof PlaylistsState, track: Track) => void;
  removeFromPlaylist: (playlistName: keyof PlaylistsState, trackId: string) => void;
  isInPlaylist: (playlistName: keyof PlaylistsState, trackId: string) => boolean;
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export const PlaylistsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<PlaylistsState>({
    mondayMood: [],
    gym: [],
  });

  const addToPlaylist = (playlistName: keyof PlaylistsState, track: Track) => {
    setPlaylists(prev => {
      const currentPlaylist = prev[playlistName];
      
      // Check if track is already in the playlist
      const isAlreadyAdded = currentPlaylist.some(t => t.id === track.id);
      
      if (isAlreadyAdded) {
        return prev; // Don't add duplicate
      }
      
      return {
        ...prev,
        [playlistName]: [...currentPlaylist, track]
      };
    });
  };

  const removeFromPlaylist = (playlistName: keyof PlaylistsState, trackId: string) => {
    setPlaylists(prev => ({
      ...prev,
      [playlistName]: prev[playlistName].filter(track => track.id !== trackId)
    }));
  };

  const isInPlaylist = (playlistName: keyof PlaylistsState, trackId: string): boolean => {
    return playlists[playlistName].some(track => track.id === trackId);
  };

  return (
    <PlaylistsContext.Provider value={{
      playlists,
      addToPlaylist,
      removeFromPlaylist,
      isInPlaylist,
    }}>
      {children}
    </PlaylistsContext.Provider>
  );
};

export const usePlaylists = (): PlaylistsContextType => {
  const context = useContext(PlaylistsContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider');
  }
  return context;
};