import React, { useState, useEffect, useRef } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart,
  Maximize2,
  Monitor
} from 'lucide-react';

const Player = () => {
  const { 
    currentTrack, 
    isPlaying, 
    player, 
    deviceId,
    playerReady,
    togglePlayback 
  } = useSpotify();

  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: context, 2: track
  const [isLiked, setIsLiked] = useState(false);
  
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Update position periodically
  useEffect(() => {
    let interval;
    if (isPlaying && player) {
      interval = setInterval(async () => {
        try {
          const state = await player.getCurrentState();
          if (state) {
            setPosition(state.position);
            setDuration(state.duration);
          }
        } catch (error) {
          console.error('Error getting player state:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  // Volume control
  useEffect(() => {
    if (player && playerReady) {
      player.setVolume(volume / 100);
    }
  }, [volume, player, playerReady]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !player || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newPosition = clickRatio * duration;
    
    player.seek(newPosition);
    setPosition(newPosition);
  };

  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newVolume = Math.max(0, Math.min(100, clickRatio * 100));
    
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePrevious = async () => {
    if (player) {
      try {
        await player.previousTrack();
      } catch (error) {
        console.error('Error skipping to previous track:', error);
      }
    }
  };

  const handleNext = async () => {
    if (player) {
      try {
        await player.nextTrack();
      } catch (error) {
        console.error('Error skipping to next track:', error);
      }
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    // Note: Actual shuffle functionality would require Spotify API calls
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
    // Note: Actual repeat functionality would require Spotify API calls
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // Note: Actual like functionality would require Spotify API calls
  };

  if (!currentTrack) {
    return (
      <div className="h-20 bg-[#181818] border-t border-[#282828] flex items-center justify-center">
        <p className="text-[#b3b3b3] text-sm">No track selected</p>
      </div>
    );
  }

  return (
    <div className="h-20 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between">
      {/* Left Section - Track Info */}
      <div className="flex items-center w-1/3 min-w-0">
        <div className="flex items-center min-w-0">
          <img
            src={currentTrack.album?.images?.[2]?.url || currentTrack.album?.images?.[0]?.url}
            alt={currentTrack.name}
            className="w-14 h-14 rounded mr-3"
            onError={(e) => {
              e.target.src = '/api/placeholder/56/56';
            }}
          />
          <div className="min-w-0 mr-4">
            <p className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
              {currentTrack.name}
            </p>
            <p className="text-[#b3b3b3] text-xs truncate hover:underline cursor-pointer">
              {currentTrack.artists?.map(artist => artist.name).join(', ')}
            </p>
          </div>
          <button
            onClick={toggleLike}
            className="mr-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'text-[#1db954] fill-current' : 'text-[#b3b3b3]'}`} 
            />
          </button>
        </div>
      </div>

      {/* Center Section - Player Controls */}
      <div className="flex flex-col items-center w-1/3 max-w-md">
        {/* Control Buttons */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              isShuffled ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePrevious}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlayback}
            className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            )}
          </button>
          
          <button
            onClick={handleNext}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`transition-colors ${
              repeatMode > 0 ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 2 && (
              <span className="absolute text-xs font-bold ml-3 -mt-2">1</span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[#b3b3b3] text-xs w-10 text-right">
            {formatTime(position)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-[#5e5e5e] rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-[#1db954] transition-colors"
              style={{ width: `${duration ? (position / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[#b3b3b3] text-xs w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Section - Volume & Device Controls */}
      <div className="flex items-center justify-end w-1/3 gap-4">
        <button className="text-[#b3b3b3] hover:text-white transition-colors">
          <Monitor className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <div
            ref={volumeRef}
            onClick={handleVolumeClick}
            className="w-20 h-1 bg-[#5e5e5e] rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-[#1db954] transition-colors"
              style={{ width: `${volume}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
        
        <button className="text-[#b3b3b3] hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Player;
