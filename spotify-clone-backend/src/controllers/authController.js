const { spotifyApi, scopes } = require('../config/spotify');

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const login = (req, res) => {
  const state = generateRandomString(16);
  
  // Store state in session for validation
  req.session.state = state;
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);
  res.redirect(authorizeURL);
};

const callback = async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.session.state;

  if (error || state !== storedState) {
    return res.redirect(`${process.env.FRONTEND_URL}/#error=access_denied`);
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Set tokens in Spotify API instance
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    // Store tokens securely (you might want to use JWT or session storage)
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    req.session.expires_at = Date.now() + (expires_in * 1000);

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.redirect(`${process.env.FRONTEND_URL}/#error=invalid_token`);
  }
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    spotifyApi.setRefreshToken(refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    
    const { access_token, expires_in } = data.body;
    
    res.json({
      access_token,
      expires_in
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(400).json({ error: 'Invalid refresh token' });
  }
};

module.exports = {
  login,
  callback,
  refreshToken
};
