import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SpotifyContext = createContext({});

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

export const SpotifyProvider = ({ children }) => {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Extract tokens from URL hash (after Spotify OAuth redirect)
  useEffect(() => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((acc, item) => {
        const parts = item.split('=');
        acc[parts[0]] = decodeURIComponent(parts[1]);
        return acc;
      }, {});

    window.location.hash = '';

    if (hash.access_token) {
      setSpotifyToken(hash.access_token);
      setRefreshToken(hash.refresh_token);
      setExpiresAt(Date.now() + parseInt(hash.expires_in) * 1000);
      
      // Store in localStorage for persistence
      localStorage.setItem('spotify_access_token', hash.access_token);
      localStorage.setItem('spotify_refresh_token', hash.refresh_token);
      localStorage.setItem('spotify_expires_at', Date.now() + parseInt(hash.expires_in) * 1000);
    } else {
      // Try to get from localStorage
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedRefresh = localStorage.getItem('spotify_refresh_token');
      const storedExpiry = localStorage.getItem('spotify_expires_at');

      if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
        setSpotifyToken(storedToken);
        setRefreshToken(storedRefresh);
        setExpiresAt(parseInt(storedExpiry));
      }
    }
  }, []);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!spotifyToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new Spotify.Player({
        name: 'Spotify Clone Web Player',
        getOAuthToken: (cb) => {
          cb(spotifyToken);
        },
        volume: 0.5
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication Error:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account Error:', message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback Error:', message);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayerReady(true);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setPlayerReady(false);
      });

      // Player state changed
      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;

        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
      });

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [spotifyToken]);

  // Token refresh logic
  const refreshSpotifyToken = useCallback(async () => {
    if (!refreshToken) return null;

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newExpiresAt = Date.now() + data.expires_in * 1000;
        
        setSpotifyToken(data.access_token);
        setExpiresAt(newExpiresAt);
        
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_expires_at', newExpiresAt);
        
        return data.access_token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    
    return null;
  }, [refreshToken]);

  // Auto-refresh token when it expires
  useEffect(() => {
    if (!spotifyToken || !expiresAt) return;

    const timeUntilExpiry = expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    const timeout = setTimeout(() => {
      refreshSpotifyToken();
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [spotifyToken, expiresAt, refreshSpotifyToken]);

  // Spotify login
  const loginWithSpotify = () => {
    window.location.href = 'http://127.0.0.1:5000/auth/login';
  };

  // Spotify logout
  const logoutFromSpotify = () => {
    setSpotifyToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    setPlayer(null);
    setDeviceId(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    setPlayerReady(false);
    
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_at');
  };

  // Play/pause functions
  const togglePlayback = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const playTrack = async (trackUri) => {
    if (!deviceId || !spotifyToken) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const value = {
    spotifyToken,
    player,
    deviceId,
    currentTrack,
    isPlaying,
    playerReady,
    loginWithSpotify,
    logoutFromSpotify,
    togglePlayback,
    playTrack,
    refreshSpotifyToken
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};
