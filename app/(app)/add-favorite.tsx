import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase'; // use your existing client

export default function AddFavoriteScreen() {
  const { session } = useAuth();
  const [trackId, setTrackId] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState('');

  const handleAddFavorite = async () => {
    if (!trackId || !trackTitle || !artist) {
      setError('Please fill out all fields');
      return;
    }

    const { error } = await supabase.from('favorites').insert([
      {
        user_id: session?.user.id,
        track_id: trackId,
        track_metadata: {
          title: trackTitle,
          artist: artist,
        },
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setError('');
      Alert.alert('Success', 'Favorite song added!');
      setTrackId('');
      setTrackTitle('');
      setArtist('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Track ID"
        value={trackId}
        onChangeText={setTrackId}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Track Title"
        value={trackTitle}
        onChangeText={setTrackTitle}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Add to Favorites" onPress={handleAddFavorite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#16213e' },
  input: {
    borderWidth: 1,
    borderColor: '#404463',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    color: '#ffffff',
    backgroundColor: '#1e1e2f',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
  },
});
