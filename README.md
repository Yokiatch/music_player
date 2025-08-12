# spotify-clone

Spotify clone built with React + Vite + Tailwind (frontend) and Node/Express (backend) that authenticates with Spotify and uses Firebase for user auth.

## Prerequisites
- Node.js 18+ and npm
- Spotify Developer account (Client ID/Secret)
- Firebase project (Web app credentials)

## Setup

### 1) Backend
- Copy `spotify-clone-backend/.env.example` to `.env` and fill the values:
  - `FRONTEND_URL=http://127.0.0.1:3000`
  - `SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/auth/callback`
  - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SESSION_SECRET`
- Install and run:
  ```bash
  cd spotify-clone-backend
  npm ci
  npm run dev
  ```
  Server runs at `http://127.0.0.1:5000`. Health: `GET /health`.

### 2) Frontend
- Copy `spotify-clone-frontend/.env.example` to `.env` and fill Firebase web config values
- Install and run:
  ```bash
  cd spotify-clone-frontend
  npm ci
  npm run dev
  ```
  App runs at `http://127.0.0.1:3000`.

## Usage
- Visit the app, sign in with email/password or Google (Firebase).
- Click "Connect with Spotify" to start the Spotify OAuth flow.

## Notes
- CORS requires `FRONTEND_URL` to match the Vite dev URL.
- Ensure your Spotify app allowlist includes the redirect URI. 
