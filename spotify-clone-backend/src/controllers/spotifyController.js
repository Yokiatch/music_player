const { spotifyApi } = require('../config/spotify');

const getUserProfile = async (req, res) => {
  try {
    const data = await spotifyApi.getMe();
    res.json(data.body);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const data = await spotifyApi.getUserPlaylists();
    res.json(data.body);
  } catch (error) {
    console.error('Error getting playlists:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
};

const searchTracks = async (req, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const data = await spotifyApi.searchTracks(q, { limit: parseInt(limit) });
    res.json(data.body);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
};

const getPlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const data = await spotifyApi.getPlaylist(playlistId);
    res.json(data.body);
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
};

module.exports = {
  getUserProfile,
  getUserPlaylists,
  searchTracks,
  getPlaylist
};
