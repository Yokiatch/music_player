import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSpotify } from '../contexts/SpotifyContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart,
  Music,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { spotifyToken } = useSpotify();
  const { user, signOut } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user playlists
  useEffect(() => {
    if (spotifyToken) {
      fetchUserPlaylists();
      fetchUserProfile();
    }
  }, [spotifyToken]);

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/spotify/playlists', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/spotify/me', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const navigationItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Search', path: '/dashboard/search', icon: Search },
    { name: 'Your Library', path: '/dashboard/library', icon: Library },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Music className="text-[#1db954] w-8 h-8" />
          <h1 className="text-xl font-bold">Spotify Clone</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-6 mb-8">
        <ul className="space-y-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 p-2 rounded-md transition-colors hover:text-white ${
                    isActive(item.path)
                      ? 'text-white bg-[#282828]'
                      : 'text-[#b3b3b3] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Create Playlist */}
      <div className="px-6 mb-6">
        <button className="flex items-center gap-4 p-2 text-[#b3b3b3] hover:text-white transition-colors w-full rounded-md hover:bg-[#1a1a1a]">
          <Plus className="w-6 h-6" />
          <span className="font-medium">Create Playlist</span>
        </button>
        <button className="flex items-center gap-4 p-2 text-[#b3b3b3] hover:text-white transition-colors w-full rounded-md hover:bg-[#1a1a1a] mt-2">
          <Heart className="w-6 h-6" />
          <span className="font-medium">Liked Songs</span>
        </button>
      </div>

      {/* Playlists */}
      <div className="px-6 flex-1 overflow-y-auto">
        <div className="border-t border-[#282828] pt-4">
          <h3 className="text-[#b3b3b3] text-sm font-medium mb-4 uppercase tracking-wider">
            Your Playlists
          </h3>
          <div className="space-y-2">
            {playlists.slice(0, 10).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/dashboard/playlist/${playlist.id}`}
                className="block p-2 text-[#b3b3b3] hover:text-white transition-colors rounded-md hover:bg-[#1a1a1a] truncate"
              >
                {playlist.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-t border-[#282828]">
        {userProfile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userProfile.images && userProfile.images[0] ? (
                <img
                  src={userProfile.images[0].url}
                  alt={userProfile.display_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-[#b3b3b3]" />
              )}
              <div>
                <p className="text-white text-sm font-medium truncate max-w-[120px]">
                  {userProfile.display_name || user?.email}
                </p>
                <p className="text-[#b3b3b3] text-xs">
                  {userProfile.followers?.total || 0} followers
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-[#b3b3b3] hover:text-white transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
