import React, { useState, useEffect, useCallback } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { Search as SearchIcon, Play, Clock, Heart, User, Disc } from 'lucide-react';
import { debounce } from 'lodash';

const Search = () => {
  const { spotifyToken, playTrack } = useSpotify();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    artists: [],
    albums: [],
    playlists: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim() && spotifyToken) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/api/spotify/search?q=${encodeURIComponent(query)}&limit=20`,
            {
              headers: {
                'Authorization': `Bearer ${spotifyToken}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setSearchResults({
              tracks: data.tracks?.items || [],
              artists: data.artists?.items || [],
              albums: data.albums?.items || [],
              playlists: data.playlists?.items || []
            });
          }
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
      }
    }, 300),
    [spotifyToken]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handlePlayTrack = (trackUri) => {
    playTrack(trackUri);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const TrackItem = ({ track, index }) => (
    <div className="flex items-center p-2 rounded-md hover:bg-[#2a2a2a] group transition-colors">
      <div className="w-8 text-center mr-4">
        <span className="text-[#b3b3b3] group-hover:hidden">{index + 1}</span>
        <button
          onClick={() => handlePlayTrack(track.uri)}
          className="hidden group-hover:block text-white hover:text-[#1db954]"
        >
          <Play className="w-4 h-4" fill="currentColor" />
        </button>
      </div>
      
      <div className="flex items-center flex-1 min-w-0">
        <img
          src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
          alt={track.name}
          className="w-10 h-10 rounded mr-3"
          onError={(e) => {
            e.target.src = '/api/placeholder/40/40';
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white truncate font-medium">{track.name}</p>
          <p className="text-[#b3b3b3] truncate text-sm">
            {track.artists?.map(artist => artist.name).join(', ')}
          </p>
        </div>
      </div>
      
      <div className="text-[#b3b3b3] text-sm mr-4 hidden md:block">
        {track.album?.name}
      </div>
      
      <div className="text-[#b3b3b3] text-sm w-12 text-right">
        {formatDuration(track.duration_ms)}
      </div>
      
      <button className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-4 h-4 text-[#b3b3b3] hover:text-white" />
      </button>
    </div>
  );

  const ArtistCard = ({ artist }) => (
    <div className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-lg p-4 cursor-pointer">
      <div className="relative mb-4">
        <img
          src={artist.images?.[0]?.url || '/api/placeholder/160/160'}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-full"
          onError={(e) => {
            e.target.src = '/api/placeholder/160/160';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all rounded-full flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" fill="currentColor" />
        </div>
      </div>
      <h3 className="text-white font-semibold truncate">{artist.name}</h3>
      <p className="text-[#b3b3b3] text-sm">Artist</p>
    </div>
  );

  const AlbumCard = ({ album }) => (
    <div className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-lg p-4 cursor-pointer">
      <div className="relative mb-4">
        <img
          src={album.images?.[0]?.url || '/api/placeholder/160/160'}
          alt={album.name}
          className="w-full aspect-square object-cover rounded-md"
          onError={(e) => {
            e.target.src = '/api/placeholder/160/160';
          }}
        />
        <button className="absolute bottom-2 right-2 bg-[#1db954] text-black w-12 h-12 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity shadow-lg">
          <Play className="w-5 h-5 ml-1" fill="currentColor" />
        </button>
      </div>
      <h3 className="text-white font-semibold truncate">{album.name}</h3>
      <p className="text-[#b3b3b3] text-sm truncate">
        {album.release_date?.split('-')[0]} • {album.artists?.map(artist => artist.name).join(', ')}
      </p>
    </div>
  );

  const tabs = [
    { id: 'all', name: 'All' },
    { id: 'tracks', name: 'Songs' },
    { id: 'artists', name: 'Artists' },
    { id: 'albums', name: 'Albums' },
    { id: 'playlists', name: 'Playlists' }
  ];

  const browseCategories = [
    { name: 'Pop', color: 'bg-pink-500', id: 'pop' },
    { name: 'Hip-Hop', color: 'bg-orange-500', id: 'hip-hop' },
    { name: 'Rock', color: 'bg-red-500', id: 'rock' },
    { name: 'Jazz', color: 'bg-blue-500', id: 'jazz' },
    { name: 'Electronic', color: 'bg-purple-500', id: 'electronic' },
    { name: 'Classical', color: 'bg-green-500', id: 'classical' },
    { name: 'Country', color: 'bg-yellow-500', id: 'country' },
    { name: 'R&B', color: 'bg-indigo-500', id: 'rnb' }
  ];

  const handleCategoryClick = (category) => {
    setSearchQuery(category.name);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] text-white">
      <div className="p-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] w-5 h-5" />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#242424] text-white rounded-full border-none outline-none focus:bg-[#2a2a2a] transition-colors"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#282828]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-white'
                      : 'text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1db954]"></div>
              </div>
            )}

            {/* Search Results Content */}
            {!isLoading && (
              <div>
                {/* All Tab or Songs Tab */}
                {(activeTab === 'all' || activeTab === 'tracks') && searchResults.tracks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Songs</h2>
                    <div>
                      {searchResults.tracks.slice(0, activeTab === 'all' ? 5 : 20).map((track, index) => (
                        <TrackItem key={track.id} track={track} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists */}
                {(activeTab === 'all' || activeTab === 'artists') && searchResults.artists.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Artists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {searchResults.artists.slice(0, activeTab === 'all' ? 5 : 20).map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Albums */}
                {(activeTab === 'all' || activeTab === 'albums') && searchResults.albums.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Albums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {searchResults.albums.slice(0, activeTab === 'all' ? 5 : 20).map(album => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Browse Categories (when no search) */}
        {!searchQuery && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Browse all</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {browseCategories.map(category => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`${category.color} rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden h-24 flex items-end`}
                >
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                  <div className="absolute -top-2 -right-2 transform rotate-12">
                    <Disc className="w-16 h-16 text-white opacity-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

