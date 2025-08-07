import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  uri: any;
  artwork?: any;
}

interface FavoritesContextType {
  favorites: Track[];
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (track: Track) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Track[]>([]);

  const addToFavorites = (track: Track) => {
    setFavorites((prev) => {
      // Check if track is already in favorites
      if (prev.some((fav) => fav.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeFromFavorites = (trackId: string) => {
    setFavorites((prev) => prev.filter((track) => track.id !== trackId));
  };

  const isFavorite = (trackId: string) => {
    return favorites.some((track) => track.id === trackId);
  };

  const toggleFavorite = (track: Track) => {
    if (isFavorite(track.id)) {
      removeFromFavorites(track.id);
    } else {
      addToFavorites(track);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};