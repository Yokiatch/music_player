import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSpotify } from '../contexts/SpotifyContext';
import LoadingSpinner from './LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { spotifyToken } = useSpotify();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but no Spotify token, redirect to Spotify auth
  if (user && !spotifyToken) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect to Spotify</h2>
          <p className="text-[#b3b3b3] mb-6">
            To use this app, you need to connect your Spotify account.
          </p>
          <button
            onClick={() => window.location.href = 'http://127.0.0.1:5000/auth/login'}
            className="bg-[#1db954] text-black px-8 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors"
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  // User is fully authenticated, render children
  return children;
};

export default AuthGuard;