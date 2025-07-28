// File: services/spotifyService.ts
import * as AuthSession from 'expo-auth-session';
import axios, { AxiosResponse } from 'axios';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = AuthSession.makeRedirectUri();

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'; 
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

// TypeScript interfaces for Spotify API responses
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

interface SpotifyArtist {
  id: string;
  name: string;
  type: 'artist';
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  type: 'album';
  uri: string;
  href: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  release_date: string;
  total_tracks: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  type: 'track';
  uri: string;
  href: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  is_local: boolean;
}

interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string;
  images: SpotifyImage[];
  followers: {
    total: number;
  };
  country: string;
  product: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string | null;
  };
  tracks: {
    total: number;
  };
  public: boolean | null;
  collaborative: boolean;
  uri: string;
  href: string;
}

interface SpotifyCurrentlyPlaying {
  item: SpotifyTrack | null;
  is_playing: boolean;
  progress_ms: number | null;
  timestamp: number;
  device: {
    id: string | null;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number | null;
  } | null;
  context: {
    type: string;
    href: string;
    uri: string;
  } | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
}

interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

interface SpotifyDevicesResponse {
  devices: SpotifyDevice[];
}

type SpotifySearchType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode';
type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Simple authentication using implicit grant (simpler than PKCE)
  async authenticate(): Promise<SpotifyTokenResponse> {
    try {
      if (!CLIENT_ID) {
        throw new Error('Spotify Client ID is not configured. Please add EXPO_PUBLIC_SPOTIFY_CLIENT_ID to your .env file');
      }

      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        scopes: [
          'user-read-email',
          'user-read-private',
          'user-read-playback-state',
          'user-modify-playback-state',
          'user-read-currently-playing',
          'streaming',
          'playlist-read-private',
          'playlist-read-collaborative',
          'user-library-read',
          'user-top-read',
          'user-read-recently-played'
        ],
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token, // Using implicit grant for simplicity
      });

      const result = await request.promptAsync({
        authorizationEndpoint: `${SPOTIFY_AUTH_BASE}/authorize`,
      });

      if (result.type === 'success' && result.params.access_token) {
        this.accessToken = result.params.access_token;
        // Note: Implicit grant doesn't provide refresh token
        return {
          access_token: result.params.access_token,
          token_type: result.params.token_type || 'Bearer',
          scope: result.params.scope || '',
          expires_in: parseInt(result.params.expires_in || '3600'),
        };
      }
      
      throw new Error('Authentication failed or was cancelled');
    } catch (error) {
      console.error('Spotify authentication error:', error);
      throw error;
    }
  }

  // Make authenticated API requests
  private async apiRequest<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    try {
      const config = {
        method,
        url: `${SPOTIFY_API_BASE}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      };

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, user needs to re-authenticate
        this.accessToken = null;
        throw new Error('Token expired. Please re-authenticate.');
      }
      console.error('Spotify API error:', error);
      throw error;
    }
  }

  // Get user's profile
  async getUserProfile(): Promise<SpotifyUser> {
    return this.apiRequest<SpotifyUser>('/me');
  }

  // Get user's playlists
  async getUserPlaylists(limit: number = 20): Promise<SpotifyPlaylistsResponse> {
    return this.apiRequest<SpotifyPlaylistsResponse>(`/me/playlists?limit=${limit}`);
  }

  // Get currently playing track
  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    try {
      return await this.apiRequest<SpotifyCurrentlyPlaying>('/me/player/currently-playing');
    } catch (error: any) {
      // If no track is playing, Spotify returns 204, which axios treats as an error
      if (error.response?.status === 204) {
        return null;
      }
      throw error;
    }
  }

  // Get user's top tracks
  async getTopTracks(timeRange: SpotifyTimeRange = 'medium_term', limit: number = 20): Promise<SpotifyTopTracksResponse> {
    return this.apiRequest<SpotifyTopTracksResponse>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  // Search for tracks, artists, albums
  async search(query: string, type: SpotifySearchType = 'track', limit: number = 20): Promise<SpotifySearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.apiRequest<SpotifySearchResponse>(`/search?q=${encodedQuery}&type=${type}&limit=${limit}`);
  }

  // Get album tracks
  async getAlbumTracks(albumId: string): Promise<{ items: SpotifyTrack[] }> {
    return this.apiRequest<{ items: SpotifyTrack[] }>(`/albums/${albumId}/tracks`);
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<{ tracks: SpotifyTrack[] }> {
    return this.apiRequest<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=${market}`);
  }

  // Play/Pause controls (requires Spotify Premium)
  async play(deviceId?: string, uris?: string[]): Promise<void> {
    const body: any = {};
    if (uris) body.uris = uris;
    if (deviceId) body.device_ids = [deviceId];
    
    return this.apiRequest<void>('/me/player/play', 'PUT', body);
  }

  async pause(): Promise<void> {
    return this.apiRequest<void>('/me/player/pause', 'PUT');
  }

  async skipToNext(): Promise<void> {
    return this.apiRequest<void>('/me/player/next', 'POST');
  }

  async skipToPrevious(): Promise<void> {
    return this.apiRequest<void>('/me/player/previous', 'POST');
  }

  // Get available devices
  async getDevices(): Promise<SpotifyDevicesResponse> {
    return this.apiRequest<SpotifyDevicesResponse>('/me/player/devices');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Clear authentication tokens
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export default new SpotifyService();

// Export types for use in other files
export type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyCurrentlyPlaying,
  SpotifySearchResponse,
  SpotifyDevice,
  SpotifySearchType,
  SpotifyTimeRange,
};