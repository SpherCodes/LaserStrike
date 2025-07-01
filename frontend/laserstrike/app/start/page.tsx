'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
          <div className="flex items-center justify-center mb-4">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <circle cx="28" cy="28" r="26" stroke="#ef4444" strokeWidth="4" fill="#18181b" />
              <circle cx="28" cy="28" r="12" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="28" cy="28" r="4" fill="#ef4444" />
              <line x1="28" y1="2" x2="28" y2="12" stroke="#ef4444" strokeWidth="2" />
              <line x1="28" y1="44" x2="28" y2="54" stroke="#ef4444" strokeWidth="2" />
              <line x1="2" y1="28" x2="12" y2="28" stroke="#ef4444" strokeWidth="2" />
              <line x1="44" y1="28" x2="54" y2="28" stroke="#ef4444" strokeWidth="2" />
            </svg>
          </div>
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