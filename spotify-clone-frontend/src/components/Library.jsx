import React, { useState, useEffect } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { 
  Play, 
  Heart, 
  Plus, 
  Search, 
  Grid3x3, 
  List,
  Clock,
  Filter
} from 'lucide-react';

const Library = () => {
  const { spotifyToken, playTrack } = useSpotify();
  const [playlists, setPlaylists] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [activeTab, setActiveTab] = useState('playlists');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spotifyToken) {
      fetchLibraryData();
    }
  }, [spotifyToken]);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPlaylists(),
        fetchSavedTracks()
      ]);
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
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

  const fetchSavedTracks = async () => {
    try {
      // Note: This would require a new backend endpoint for saved tracks
      // For now, we'll use an empty array
      setSavedTracks([]);
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PlaylistCard = ({ playlist }) => (
    <div className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-lg p-4 cursor-pointer group">
      <div className="relative mb-4">
        <img
          src={playlist.images?.[0]?.url || '/api/placeholder/160/160'}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-md"
          onError={(e) => {
            e.target.src = '/api/placeholder/160/160';
          }}
        />
        <button
          onClick={() => playTrack(playlist.uri)}
          className="absolute bottom-2 right-2 bg-[#1db954] text-black w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-105"
        >
          <Play className="w-5 h-5 ml-1" fill="currentColor" />
        </button>
      </div>
      <h3 className="text-white font-semibold mb-2 truncate">{playlist.name}</h3>
      <p className="text-[#b3b3b3] text-sm line-clamp-2">
        {playlist.description || `${playlist.tracks?.total || 0} songs`}
      </p>
    </div>
  );

  const PlaylistListItem = ({ playlist }) => (
    <div className="flex items-center p-2 rounded-md hover:bg-[#2a2a2a] group cursor-pointer">
      <img
        src={playlist.images?.[2]?.url || playlist.images?.[0]?.url || '/api/placeholder/60/60'}
        alt={playlist.name}
        className="w-12 h-12 rounded mr-4"
        onError={(e) => {
          e.target.src = '/api/placeholder/60/60';
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{playlist.name}</h4>
        <p className="text-[#b3b3b3] text-sm truncate">
          {playlist.public ? 'Public' : 'Private'} • {playlist.tracks?.total || 0} songs
        </p>
      </div>
      <button
        onClick={() => playTrack(playlist.uri)}
        className="opacity-0 group-hover:opacity-100 transition-opacity mr-4"
      >
        <Play className="w-8 h-8 text-white hover:text-[#1db954]" fill="currentColor" />
      </button>
    </div>
  );

  const tabs = [
    { id: 'playlists', name: 'Playlists', count: playlists.length },
    { id: 'artists', name: 'Artists', count: 0 },
    { id: 'albums', name: 'Albums', count: 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1db954]"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#b3b3b3] hover:text-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
            >
              {viewMode === 'list' ? <Grid3x3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg p-4 w-64 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Liked Songs</h3>
                <p className="text-purple-100 text-sm">{savedTracks.length} songs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] w-4 h-4" />
            <input
              type="text"
              placeholder={`Search in ${tabs.find(t => t.id === activeTab)?.name.toLowerCase()}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] text-white text-sm rounded-full border-none outline-none focus:bg-[#2a2a2a] transition-colors"
            />
          </div>

          <button className="p-2 text-[#b3b3b3] hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'playlists' && (
            <div>
              {filteredPlaylists.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPlaylists.map(playlist => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlaylists.map(playlist => (
                      <PlaylistListItem key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
                    <List className="w-8 h-8 text-[#b3b3b3]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
                  <p className="text-[#b3b3b3] mb-4">
                    Create your first playlist to get started
                  </p>
                  <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
                    Create playlist
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'playlists' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#b3b3b3]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming soon</h3>
              <p className="text-[#b3b3b3]">
                {activeTab} will be available in a future update
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
