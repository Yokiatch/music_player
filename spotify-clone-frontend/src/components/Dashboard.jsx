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
    <div className="h-screen flex flex-col bg-[#191414]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
            </Routes>
          </main>
        </div>
      </div>
      <Player />
    </div>
  );
};

export default Dashboard;
