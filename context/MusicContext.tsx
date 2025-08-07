// File: context/MusicContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: any;
  uri?: any;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sample tracks for demo
  const tracks: Track[] = [
    {
      id: '1',
      title: 'Crazy Tings',
      artist: 'Tems',
      artwork: require('../assets/swag.jpg'),
    },
    {
      id: '2',
      title: 'The Dress',
      artist: 'Dijon',
      artwork: require('../assets/dijon.jpg'),
    },
    {
      id: '3',
      title: 'Mutt',
      artist: 'Leon Thomas',
      artwork: require('../assets/mutt.jpg'),
    },
  ];

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrackItem = tracks[nextIndex];
    
    if (nextTrackItem) {
      playTrack(nextTrackItem);
    }
  };

  const previousTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    const prevTrackItem = tracks[prevIndex];
    
    if (prevTrackItem) {
      playTrack(prevTrackItem);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        setCurrentTrack,
        setIsPlaying,
        setProgress,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};