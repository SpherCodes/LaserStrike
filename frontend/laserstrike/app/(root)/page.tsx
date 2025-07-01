'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraViewer from '@/components/CameraViewer';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedPlayer = sessionStorage.getItem('player');
    if (storedPlayer) {
      try {
        const playerObj = JSON.parse(storedPlayer);
        setPlayerName(playerObj.name || '');
      } catch {
        setPlayerName('');
      }
      setIsLoading(false);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleExit = () => {
    sessionStorage.removeItem('player');
    router.push('/login');
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

  return (
    <div className='flex-1 flex flex-col'>
      {/*  Player Info Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-red-900 border-b border-red-700/40 px-6 py-3 flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md border-2 border-white/20">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white tracking-wide">Welcome, <span className="text-red-400">{playerName}</span>!</span>
            <span className="text-xs text-gray-300">You are ready to strike!</span>
          </div>
        </div>
        <button
          onClick={handleExit}
          className="px-4 py-1 rounded-lg bg-black/60 hover:bg-red-600 hover:text-white text-gray-300 text-xs font-medium border border-red-700/30 transition-colors duration-150 shadow"
        >
          Quit
        </button>
      </div>
      {/* Camera View Container - Full remaining space */}
      <div className='flex-1 relative overflow-hidden'>
        <CameraViewer />
      </div>
    </div>
  );
}