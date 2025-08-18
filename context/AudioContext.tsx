// context/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { AVPlaybackStatus } from 'expo-av';

interface AudioContextType {
  // Current playback state
  isPlaying: boolean;
  currentTrack: string | null;
  currentPosition: number;
  duration: number;
  
  // ISO mode state
  isISOMode: boolean;
  pausedPosition: number; // Position where main track was paused
  currentISOTrack: string | null;
  
  // Audio controls
  playMainTrack: (trackName: string) => Promise<void>;
  pauseAudio: () => Promise<void>;
  playAudio: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  
  // ISO controls
  enterISOMode: () => Promise<void>;
  exitISOMode: () => Promise<void>;
  playISOTrack: (trackName: string) => Promise<void>;
  
  // Setup
  setupAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Audio file mappings
const AUDIO_FILES = {
  // Main tracks
  'daisies': require('../assets/audio/sample.mp3'), // Replace with your main track
  
  // ISO tracks
  'beat': require('../assets/audio/beat.mp3'),
  'bass': require('../assets/audio/bass.mp3'),
  'bed': require('../assets/audio/bed.mp3'),
  'vox': require('../assets/audio/vox.mp3'), // Using available file
};

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // ISO mode state
  const [isISOMode, setIsISOMode] = useState(false);
  const [pausedPosition, setPausedPosition] = useState(0);
  const [currentISOTrack, setCurrentISOTrack] = useState<string | null>(null);

  // Setup audio session
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  };

  // Load and play main track
  const playMainTrack = async (trackName: string) => {
    try {
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      const audioFile = AUDIO_FILES[trackName as keyof typeof AUDIO_FILES];
      if (!audioFile) {
        console.error('Audio file not found:', trackName);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioFile,
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentTrack(trackName);
      setIsPlaying(true);
      setIsISOMode(false);
      setCurrentISOTrack(null);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Play ISO track starting from paused position
  const playISOTrack = async (trackName: string) => {
    try {
      // Unload current sound
      if (sound) {
        await sound.unloadAsync();
      }

      const audioFile = AUDIO_FILES[trackName as keyof typeof AUDIO_FILES];
      if (!audioFile) {
        console.error('ISO track not found:', trackName);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioFile,
        { 
          shouldPlay: true,
          positionMillis: pausedPosition // Start from where main track was paused
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentISOTrack(trackName);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing ISO track:', error);
    }
  };

  // Enter ISO mode (pause main track and save position)
  const enterISOMode = async () => {
    if (sound && isPlaying) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.pauseAsync();
        setPausedPosition(status.positionMillis || 0);
        setIsPlaying(false);
        setIsISOMode(true);
      }
    }
  };

  // Exit ISO mode (resume main track from saved position)
  const exitISOMode = async () => {
    if (currentTrack) {
      try {
        // Unload ISO sound
        if (sound) {
          await sound.unloadAsync();
        }

        // Reload main track
        const audioFile = AUDIO_FILES[currentTrack as keyof typeof AUDIO_FILES];
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioFile,
          { 
            shouldPlay: true,
            positionMillis: pausedPosition
          },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
        setIsPlaying(true);
        setIsISOMode(false);
        setCurrentISOTrack(null);
      } catch (error) {
        console.error('Error exiting ISO mode:', error);
      }
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const playAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      await sound.setPositionAsync(position);
      if (isISOMode) {
        setPausedPosition(position);
      }
    }
  };

  // Playback status update handler
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Update paused position if in ISO mode
      if (isISOMode && status.positionMillis) {
        setPausedPosition(status.positionMillis);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const value: AudioContextType = {
    isPlaying,
    currentTrack,
    currentPosition,
    duration,
    isISOMode,
    pausedPosition,
    currentISOTrack,
    playMainTrack,
    pauseAudio,
    playAudio,
    seekTo,
    enterISOMode,
    exitISOMode,
    playISOTrack,
    setupAudio,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}