const express = require('express');
const router = express.Router();
const { login, callback, refreshToken } = require('../controllers/authcontroller');

router.get('/login', login);
router.get('/callback', callback);
router.post('/refresh-token', refreshToken);

module.exports = router;
