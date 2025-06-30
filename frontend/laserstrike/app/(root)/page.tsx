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
    console.log('Stored player:', storedPlayer);
    if (storedPlayer) {
      setPlayerName(storedPlayer);
      setIsLoading(false);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleExit = () => {
    sessionStorage.removeItem('playerName');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center bg-black'>
        <div className='text-center text-white'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
          <p>Loading LaserStrike...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col'>
      {/* Player Info Header */}
      <div className='border-b border-gray-800 px-4 py-2 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold'>
            {playerName.charAt(0).toUpperCase()}
          </div>
          <span className='font-medium text-white'>Ready, {playerName}!</span>
        </div>
        <button
          onClick={handleExit}
          className='text-sm text-gray-400'
        >
          Quite
        </button>
      </div>

      {/* Camera View Container - Full remaining space */}
      <div className='flex-1 relative'>
        <CameraViewer />
      </div>
    </div>
  );
}