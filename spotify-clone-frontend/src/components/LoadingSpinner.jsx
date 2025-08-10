import React from 'react';
import { Play } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-[#191414] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Play className="w-16 h-16 text-[#1db954] fill-current" />
        </div>
        <p className="text-white text-lg">Loading your music...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
