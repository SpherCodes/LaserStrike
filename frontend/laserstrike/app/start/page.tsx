'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/TargetIcon';

export default function GameStartPage() {
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Skeleton POST method to create a game
  async function createGame(gameId: string) {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      if (!res.ok) {
        throw new Error('Failed to create game');
      }
      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gameId.trim()) {
      setError('Game ID is required');
      return;
    }
    setError('');
    try {
      await createGame(gameId);
      router.push('/spectator'); // Redirects back to spectator view
    } catch (err) {
      setError('Could not create game. Please try again.');
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br flex items-center justify-center from-red-900 via-black to-gray-900 p-6">
      <div className="start-bg" />
      <div className="start-game-card">
        <div className="text-center mb-8">
          {/* Modern icon: Laser/target SVG */}
          <Icon />
          <h1 className="start-game-title">Start Game</h1>
          <p className="start-game-desc">Enter the Game ID to begin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-300 mb-2">
              Game ID
            </label>
            <input
              id="gameId"
              type="text"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              placeholder="Enter game id..."
              className="start-game-input"
              maxLength={20}
              autoFocus
            />
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          </div>
          <button
            type="submit"
            className="start-game-btn"
          >
            <span>Start Game</span>
          </button>
        </form>
      </div>
    </div>
  );
}