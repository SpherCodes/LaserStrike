'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterPlayer } from '@/lib/actions/game.actions';

export default function LoginPage() {
  const [player, setPlayer] = useState<PlayerRegisterProps>({ name: '', tagId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer((prev: PlayerRegisterProps) => ({ ...prev, name: e.target.value }));
  };

  const handleTagIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer((prev: PlayerRegisterProps) => ({ ...prev, tagId: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player.name && player.tagId) {
      setIsLoading(true);
      // Store player in sessionStorage
      sessionStorage.setItem('player', JSON.stringify(player));
      RegisterPlayer(player);
      router.push('/');
    }
  };

  return (
    <div className=' h-screen flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-900 via-black to-gray-900'>
      <div className='w-full max-w-md bg-black/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-red-500/20'>
        {/* Game Logo/Title */}
        <div className='text-center mb-8'>
          <div className='text-6xl mb-4'>🎯</div>
          <h1 className='text-3xl font-bold text-white mb-2'>LaserStrike</h1>
          <p className='text-gray-100'>Enter your name to join the battle</p>
        </div>

        {/* Name Entry Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='playerName' className='block text-sm font-medium text-gray-300 mb-2'>
              Strike Name
            </label>
            <input
              type='text'
              id='playerName'
              value={player.name}
              onChange={handlePlayerNameChange}
              placeholder='Enter your strike name...'
              className='w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-lg text-white placeholder-gray-400'
              maxLength={20}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor='tagId' className='block text-sm font-medium text-gray-100 mb-2'>
              Strike Tag Id
            </label>
            <input
              type='text'
              id='tagId'
              value={player.tagId}
              onChange={handleTagIdChange}
              placeholder='Enter your tag id...'
              className='w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-lg text-white placeholder-gray-400'
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          <button
            type='submit'
            className='text-white py-3 px-6 rounded-lg font-semibold text-lg bg-red-600 '
          >
            {isLoading && <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>}
            <span>{isLoading ? 'Entering Battle...' : 'Enter Battle'}</span>
          </button>
        </form>

        {/* Game Instructions */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-400 mb-4'>
            Take precise shots and dominate the leaderboard!
          </p>
          <div className='flex items-center justify-center space-x-4 text-xs text-gray-500'>
            <span>🎯 Precision</span>
            <span>⚡ Speed</span>
            <span>🏆 Victory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
