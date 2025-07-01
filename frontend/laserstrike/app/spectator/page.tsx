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
    <div className="h-screen bg-black text-white relative flex flex-col">
      {/* Game Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎯 LaserStrike Game</h1>
            <p className="text-gray-400 text-sm">Spectator View - Live Game Monitoring</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Start Game
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 flex">
        {/* Toggle Button (Mobile) */}
        <button
          className="absolute top-20 left-4 z-50 bg-gray-800 text-white p-2 rounded-md md:hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? "✖" : "☰"}
        </button>

      {/* Sidebar - Rankings */}
      <div
        className={`bg-black border-r border-gray-700 p-3 overflow-auto transition-transform duration-300 ease-in-out z-40
          fixed top-0 left-0 h-full w-64 
          transform ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0 md:w-1/4 md:block`}
      >
        <h2 className="text-lg font-semibold mb-2">Rankings</h2>
        <ul className="space-y-4" style={{ marginLeft: "-10px" }}>
          {players.map((player, index) => (
            <li
              key={player.id}
              className="grid grid-cols-[50px_50px_1fr] gap-3 items-center py-2"
              style={{ marginBottom: "8px" }}
            >
              <div className="text-sm font-normal text-center">{index + 1}</div>
              <div className="text-3xl font-light leading-none text-center">{player.id}</div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center bg-gray-100">
                    <HealthBar current={player.health} />
                  </div>
                  <div className="text-xs text-cyan-400 mr-1">
                    {scores[index] ?? 0}pts
                  </div>
                </div>
                <div className="text-sm font-medium text-white">{player.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content - Snapshots */}
      <div className="flex-1 p-3 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Snapshots</h2>
        
        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {snapshots.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Snapshot ${index + 1}`}
              className="w-full h-64 object-cover rounded cursor-pointer hover:opacity-80"
              onClick={() => setSelectedImage(src)}
            />
          ))}
        </div>
      </div>


      {/* Modal for enlarged image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged snapshot"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>        )}
      </div>
    </div>
  );
}