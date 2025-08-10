import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpotifyProvider } from './contexts/SpotifyContext';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SpotifyProvider>
        <Router>
          <div className="min-h-screen bg-[#191414]">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/*" 
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } 
              />
            </Routes>
          </div>
        </Router>
      </SpotifyProvider>
    </AuthProvider>
  );
}

export default App;
