import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Home from './Home';
import Search from './Search';
import Library from './Library';
import Player from './Player';

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </div>
      </div>
      
      {/* Bottom Player */}
      <Player />
    </div>
  );
};

export default Dashboard;
