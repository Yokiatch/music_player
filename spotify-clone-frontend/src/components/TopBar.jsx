import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSpotify } from '../contexts/SpotifyContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  User,
  ChevronDown,
  LogOut,
  ExternalLink
} from 'lucide-react';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { logoutFromSpotify } = useSpotify();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const canGoBack = window.history.length > 1;
  const canGoForward = false; // Browser forward detection is limited

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      navigate(1);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutFromSpotify();
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/search')) return 'Search';
    if (path.includes('/library')) return 'Your Library';
    if (path.includes('/playlist')) return 'Playlist';
    return 'Home';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isSearchPage = location.pathname.includes('/search');

  return (
    <div className="h-16 bg-[#0a0a0a] bg-opacity-80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              canGoBack
                ? 'bg-black text-white hover:bg-[#282828]'
                : 'bg-[#0a0a0a] text-[#5e5e5e] cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleForward}
            disabled={!canGoForward}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              canGoForward
                ? 'bg-black text-white hover:bg-[#282828]'
                : 'bg-[#0a0a0a] text-[#5e5e5e] cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Page Title/Greeting */}
        <div className="ml-4">
          {location.pathname === '/dashboard' ? (
            <h1 className="text-white text-2xl font-bold">
              {getGreeting()}
            </h1>
          ) : (
            <h1 className="text-white text-xl font-semibold">
              {getPageTitle()}
            </h1>
          )}
        </div>
      </div>

      {/* Center Section - Search (only on search page) */}
      {isSearchPage && (
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] w-4 h-4" />
            <input
              type="text"
              placeholder="Artists, songs, or podcasts"
              className="w-full pl-10 pr-4 py-2 bg-[#242424] text-white text-sm rounded-full border-none outline-none focus:bg-[#2a2a2a] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Right Section - User Menu */}
      <div className="flex items-center gap-4">
        {/* Upgrade Button (optional) */}
        <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
          Upgrade
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2 bg-black bg-opacity-70 hover:bg-opacity-90 transition-colors rounded-full pl-1 pr-2 py-1"
          >
            <div className="w-7 h-7 rounded-full bg-[#535353] flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-white text-sm font-medium max-w-[100px] truncate">
              {user?.displayName || user?.email || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-white" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-[#282828] rounded-md shadow-lg py-1 z-20">
              <div className="px-3 py-2 border-b border-[#404040]">
                <p className="text-white text-sm font-medium truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-[#b3b3b3] text-xs truncate">
                  {user?.email}
                </p>
              </div>
              
              <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#404040] transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#404040] transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Profile
              </button>
              
              <div className="border-t border-[#404040] mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#404040] transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;

