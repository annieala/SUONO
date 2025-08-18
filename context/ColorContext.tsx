// File: context/ColorContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ColorContextType {
  backgroundColor: string;
  setBackgroundColor: (color: string) => Promise<void>;
  isLoaded: boolean;
}

const ColorContext = createContext<ColorContextType>({
  backgroundColor: '#0A0E26',
  setBackgroundColor: async () => {},
  isLoaded: false,
});

interface ColorProviderProps {
  children: ReactNode;
}

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const [backgroundColor, setBackgroundColorState] = useState('#0A0E26'); // Default color
  const [isLoaded, setIsLoaded] = useState(false);

  const setBackgroundColor = async (color: string) => {
    try {
      console.log('ColorContext - Setting background color:', color);
      await AsyncStorage.setItem('appBackgroundColor', color);
      setBackgroundColorState(color);
      console.log('ColorContext - Background color set successfully:', color);
    } catch (error) {
      console.error('Error saving background color:', error);
    }
  };

  // Load saved color on app start
  useEffect(() => {
    const loadSavedColor = async () => {
      try {
        const savedColor = await AsyncStorage.getItem('appBackgroundColor');
        if (savedColor) {
          setBackgroundColorState(savedColor);
        }
      } catch (error) {
        console.error('Error loading background color:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSavedColor();
  }, []);

  return (
    <ColorContext.Provider value={{ backgroundColor, setBackgroundColor, isLoaded }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = (): ColorContextType => {
  const context = useContext(ColorContext);
  // Always return the context, even if it's the default values
  return context;
};