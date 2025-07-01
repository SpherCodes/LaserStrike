"use client"
import { useState, useEffect } from "react";
import HealthBar from "@/components/healthbar";
import {Player} from "@/lib/Types";

export default function SpectatorView() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [scores, setScores] = useState<number[]>([]);//for scores

  useEffect(() => {
     const newPlayers = [
        { name: "Phiwo", health: 2, kills: 6, deaths: 3, id: "A1" },
        { name: "Calvin", health: 1, kills: 1, deaths: 1, id: "A2" },
        { name: "Siphesihle", health: 4, kills: 2, deaths: 9, id: "A3" },
        { name: "Ethan", health: 3, kills: 8, deaths: 10, id: "A4" },
    ];
    const playersWithScores = newPlayers.map((player) => {
        const kills = player.kills ?? 0;
        const deaths = player.deaths ?? 0;
        const score = (kills * 100) - (deaths * 50);
        return { player, score: score < 0 ? 0 : score };
    });
    
    playersWithScores.sort((a, b) => b.score - a.score);
    const sortedPlayers = playersWithScores.map((p) => p.player);
    const sortedScores = playersWithScores.map((p) => p.score);
    setPlayers(sortedPlayers);
    setScores(sortedScores);
    setSnapshots(Array.from({ length: 200 }, () => "https://via.placeholder.com/150"));
  }, []);

  return (
    <div className="h-screen bg-gray-950 text-white relative flex flex-col">
      {/* Simple Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🎯 LaserStrike</h1>
            <p className="text-gray-400 text-sm">Live Game Monitor</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm">
              Start Game
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm">
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 flex">
        {/* Mobile Toggle */}
        <button
          className="absolute top-24 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md md:hidden transition"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? "✕" : "☰"}
        </button>

        {/* Rankings Sidebar */}
        <div
          className={`bg-gray-900 border-r border-gray-700 p-4 overflow-auto transition-transform duration-300 ease-in-out z-40
          fixed top-0 left-0 h-full w-72 
          transform ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0 md:w-1/3 md:block`}
        >
          <h2 className="text-lg font-semibold mb-4 text-white">🏆 Rankings</h2>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold">
                      {player.id}
                    </div>
                    <div>
                      <div className="font-medium text-white">{player.name}</div>
                      <div className="text-xs text-gray-400">K:{player.kills} D:{player.deaths}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">{scores[index] ?? 0}</div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Health</span>
                    <span className="text-white">{player.health}%</span>
                  </div>
                  <HealthBar current={player.health} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Snapshots Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📸 Battle Snapshots</h2>
            <div className="text-sm text-gray-400">{snapshots.length} photos</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshots.slice(0, 12).map((src, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition cursor-pointer"
                onClick={() => setSelectedImage(src)}
              >
                <img
                  src={src}
                  alt={`Battle snapshot ${index + 1}`}
                  className="w-full h-48 object-cover hover:opacity-90 transition"
                />
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Shot #{index + 1}</span>
                    <span className="text-xs text-gray-500">
                      {Math.floor(Math.random() * 60)}s ago
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {snapshots.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4 opacity-50">📷</div>
              <p className="text-gray-400">No battle snapshots yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Simple Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="Enlarged snapshot"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              className="absolute top-4 right-4 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}