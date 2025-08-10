const jwt = require('jsonwebtoken');

const authenticateSpotify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];
  
  // Set the access token for this request
  const { spotifyApi } = require('../config/spotify');
  spotifyApi.setAccessToken(token);
  
  next();
};

module.exports = {
  authenticateSpotify
};
