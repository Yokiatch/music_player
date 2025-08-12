const express = require('express');
const router = express.Router();
const { authenticateSpotify } = require('../middleware/auth');
const { 
  getUserProfile, 
  getUserPlaylists, 
  searchTracks, 
  getPlaylist 
} = require('../controllers/spotifyController');

// Apply authentication middleware to all routes
router.use(authenticateSpotify);

router.get('/me', getUserProfile);
router.get('/playlists', getUserPlaylists);
router.get('/search', searchTracks);
router.get('/playlist/:playlistId', getPlaylist);

module.exports = router;
