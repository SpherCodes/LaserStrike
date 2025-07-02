/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HealthBar from '@/components/healthbar';
import { Player } from '@/lib/Types';
import { getSocket } from '@/lib/socket';
import CameraViewer from '@/components/CameraViewer';

// const CameraViewer = dynamic(
//   () => import('@/components/CameraViewer'),
//   { ssr: false }
// )

export default function HomePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [health, setHealth] = useState(10);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedPlayer = sessionStorage.getItem('player');
    console.log('Stored player data:', storedPlayer);
    
    if (storedPlayer) {
      try {
        const parsedPlayer = JSON.parse(storedPlayer);
        console.log('Parsed player object:', parsedPlayer);
        setPlayer(parsedPlayer);
        
        // Set initial values for player stats
        if (parsedPlayer.health) setHealth(parsedPlayer.health);
        if (parsedPlayer.kills) setKills(parsedPlayer.kills);
        if (parsedPlayer.deaths) setDeaths(parsedPlayer.deaths);
        
        // Initialize WebSocket connection for the player
        if (parsedPlayer.id) {
          console.log('Initializing WebSocket for player:', parsedPlayer.id);
          getSocket(parsedPlayer.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing stored player:', error);
        setPlayer(null);
        setIsLoading(false);
        router.push('/login');
      }
    } else {
      console.log('No stored player found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

  const handleExit = () => {
    sessionStorage.removeItem('player');
    router.push('/login');
  };

  // Handle player updates from CameraViewer
  const handlePlayerUpdate = (updates: Partial<Player>) => {
    console.log('Player update received:', updates);
    
    // Update health if provided
    if (updates.health !== undefined) {
      setHealth(updates.health);
    }
    
    // Update kills if provided
    if (updates.kills !== undefined) {
      setKills(updates.kills);
    }
    
    // Update score if provided from backend
    if (updates.score !== undefined) {
      setScore(updates.score);
    }
    
    // Increment strikes when player gets a kill
    if (updates.kills !== undefined && updates.kills > kills) {
      setStrikes(prev => prev + 1);
    }
    
    // Update deaths if provided
    if (updates.deaths !== undefined) {
      setDeaths(updates.deaths);
    }
  };

  if (isLoading) {
    return (
      <div className='h-screen flex-1 flex items-center justify-center bg-black'>
        <div className='text-center text-white'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
          <p>Loading LaserStrike...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className='h-screen flex items-center justify-center bg-black'>
        <div className='text-center text-white'>
          <p>No player data found. Please login again.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Get player name from the stored object
  const playerName = player.name || 'Unknown';
  const playerId = player.id;

  return (
    <div className='h-screen flex flex-col'>
      {/*Player Info Header with Health Bar - Fixed at top */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-red-900 border-b border-red-700/40 px-4 py-2 shadow-lg relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          {/* Player Info Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-lg border-2 border-white/20">
                {playerName.charAt(0).toUpperCase()}
              </div>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-wide">
                <span className="text-red-400">{playerName}</span>
              </span>
              <span className="text-xs text-green-400 font-medium">● ACTIVE</span>
            </div>
          </div>

          {/* Stats and Quit Button */}
          <div className="flex items-center gap-3">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-sm font-bold text-yellow-400">{score.toLocaleString()}</div>
              <div className="text-xs text-gray-400 uppercase">Score</div>
            </div>
            
            {/* Strikes Count */}
            <div className="text-center">
              <div className="text-sm font-bold text-white">{strikes}</div>
              <div className="text-xs text-gray-400 uppercase">Strikes</div>
            </div>
            
            {/* Kills */}
            <div className="text-center">
              <div className="text-sm font-bold text-green-400">{kills}</div>
              <div className="text-xs text-gray-400 uppercase">Kills</div>
            </div>
            
            {/* Deaths */}
            <div className="text-center">
              <div className="text-sm font-bold text-red-400">{deaths}</div>
              <div className="text-xs text-gray-400 uppercase">Deaths</div>
            </div>

            {/* Quit Button */}
            <button
              onClick={handleExit}
              className="px-3 py-1 rounded-lg bg-black/60 hover:bg-red-600 hover:text-white text-gray-300 text-xs font-medium border border-red-700/30 transition-all duration-200 shadow-md"
            >
              Quit
            </button>
          </div>
        </div>

        {/* Health Bar Section - Compact */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-gray-300">Health</span>
          <div className="flex-1 max-w-xs">
            <HealthBar current={health} max={10} />
          </div>
          <span className="text-xs font-bold text-green-400">{health}/10</span>
        </div>
      </div>
      {/* Camera View Container - Full remaining space */}
      <div className='flex-1 relative overflow-hidden'>
        <CameraViewer 
          playerId={player.id} 
          onPlayerUpdate={handlePlayerUpdate}
        />
      </div>
    </div>
  );
}