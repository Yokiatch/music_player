import React, { useEffect, useState } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { Play, Clock, Heart } from 'lucide-react';

const Home = () => {
  const { spotifyToken, playTrack } = useSpotify();
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spotifyToken) {
      fetchHomeData();
    }
  }, [spotifyToken]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserPlaylists(),
        fetchFeaturedPlaylists(),
        // fetchRecentlyPlayed(), // Uncomment when needed
      ]);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/spotify/playlists', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPlaylists(data.items?.slice(0, 6) || []);
      }
    } catch (error) {
      console.error('Error fetching user playlists:', error);
    }
  };

  const fetchFeaturedPlaylists = async () => {
    try {
      // Using search as a fallback for featured playlists
      const response = await fetch('http://127.0.0.1:5000/api/spotify/search?q=top%20hits&limit=6', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Convert tracks to playlist-like format for display
        const trackPlaylists = data.tracks?.items?.slice(0, 6).map(track => ({
          id: track.id,
          name: track.name,
          description: `By ${track.artists[0]?.name}`,
          images: track.album?.images || [],
          uri: track.uri,
          type: 'track'
        })) || [];
        setFeaturedPlaylists(trackPlaylists);
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    }
  };

  const handlePlayClick = (item) => {
    if (item.uri) {
      playTrack(item.uri);
    }
  };

  const PlaylistCard = ({ item, size = 'normal' }) => {
    const cardSize = size === 'large' ? 'w-48' : 'w-40';
    const imageSize = size === 'large' ? 'h-48' : 'h-40';
    
    return (
      <div className={`${cardSize} bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer group relative`}>
        <div className="relative">
          <img
            src={item.images?.[0]?.url || '/api/placeholder/160/160'}
            alt={item.name}
            className={`${imageSize} w-full object-cover rounded-md mb-4`}
            onError={(e) => {
              e.target.src = '/api/placeholder/160/160';
            }}
          />
          <button
            onClick={() => handlePlayClick(item)}
            className="absolute bottom-2 right-2 bg-[#1db954] text-black w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Play className="w-5 h-5 ml-1" fill="currentColor" />
          </button>
        </div>
        <h3 className="text-white font-semibold mb-2 truncate">{item.name}</h3>
        <p className="text-[#b3b3b3] text-sm line-clamp-2">
          {item.description || `${item.type === 'track' ? 'Song' : 'Playlist'}`}
        </p>
      </div>
    );
  };

  const QuickPlayCard = ({ item }) => (
    <div className="bg-[#282828] hover:bg-[#3e3e3e] transition-colors rounded-md flex items-center cursor-pointer group">
      <img
        src={item.images?.[0]?.url || '/api/placeholder/60/60'}
        alt={item.name}
        className="w-16 h-16 rounded-l-md"
        onError={(e) => {
          e.target.src = '/api/placeholder/60/60';
        }}
      />
      <div className="flex-1 px-4">
        <p className="text-white font-medium truncate">{item.name}</p>
      </div>
      <button
        onClick={() => handlePlayClick(item)}
        className="mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Play className="w-8 h-8 text-white hover:text-[#1db954]" fill="currentColor" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1db954]"></div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] text-white">
      <div className="p-8">
        {/* Greeting */}
        <h1 className="text-3xl font-bold mb-8">{greeting}</h1>

        {/* Quick Play Grid */}
        {userPlaylists.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <QuickPlayCard key={playlist.id} item={playlist} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recently played</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentlyPlayed.map((item, index) => (
                <PlaylistCard key={`recent-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Content */}
        {featuredPlaylists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Popular right now</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredPlaylists.map((item, index) => (
                <PlaylistCard key={`featured-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Your Music */}
        {userPlaylists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Made for you</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userPlaylists.slice(0, 5).map((playlist) => (
                <PlaylistCard key={`made-for-you-${playlist.id}`} item={playlist} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userPlaylists.length === 0 && featuredPlaylists.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-[#b3b3b3] mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start listening</h2>
            <p className="text-[#b3b3b3]">
              Search for your favorite songs and create your first playlist
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
