'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/lib/Types';

interface GameOverProps {
  player: Partial<Player>;
  onExit?: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ player, onExit }) => {
  const router = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      sessionStorage.removeItem('player');
      router.push('/login');
    }
  };

  // Format player name with safe fallback

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
      <div className="max-w-md w-full bg-gradient-to-b from-gray-900 to-black border border-red-700/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <h2 className="text-xl font-bold text-white text-center uppercase tracking-wider animate-pulse">Game Over</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            
            <span className="text-red-500 text-5xl font-bold block mb-2">
              ELIMINATED
            </span>
            <p className="text-gray-400">
              You&apos;ve been eliminated from the game.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
              <div className="text-xl font-bold text-green-400">{player.kills ?? 0}</div>
              <div className="text-xs text-gray-400">KILLS</div>
            </div>
            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
              <div className="text-xl font-bold text-red-400">{player.deaths ?? 0}</div>
              <div className="text-xs text-gray-400">DEATHS</div>
            </div>
            <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
              <div className="text-xl font-bold text-yellow-400">{player.score ?? 0}</div>
              <div className="text-xs text-gray-400">SCORE</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleExit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold rounded-lg hover:from-red-800 hover:to-red-700 transition-all duration-200 shadow-lg"
            >
              Exit to Login
            </button>
          </div>
        </div>
      </div>

      {/* Background animation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-red-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-red-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default GameOver;
