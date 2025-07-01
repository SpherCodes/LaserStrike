"use client"
import { useState, useEffect } from "react";
import HealthBar from "@/components/healthbar";

type Player = {
  id: number;
  name: string;
  rank: number;
  health: number;
  score: number;
  letter: string;
};

export default function SpectatorView() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  useEffect(() => {
    setPlayers([
      { id: 1, name: "Phiwo", rank: 1, health: 1, score: 2450, letter: "A" },
      { id: 2, name: "Calvin", rank: 2, health: 3, score: 2200, letter: "B" },
      { id: 3, name: "Siphesihle", rank: 3, health: 9, score: 2100, letter: "C" },
      { id: 4, name: "Ethan", rank: 4, health: 6, score: 1950, letter: "D" },
    ]);
    setSnapshots(Array.from({ length: 200 }, () => "https://via.placeholder.com/150"));
  }, []);

  return (
    <div className="h-screen bg-black text-white relative flex">
      {/* Toggle Button (Mobile) */}
      <button
        className="absolute top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md md:hidden"
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
          {players.map((player) => (
            <li
              key={player.id}
              className="grid grid-cols-[50px_50px_1fr] gap-3 items-center py-2"
              style={{ marginBottom: "8px" }}
            >
              <div className="text-sm font-normal text-center">{player.rank}</div>
              <div className="text-3xl font-light leading-none text-center">{player.letter}</div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center bg-gray-100">
                    <HealthBar current={player.health} />
                  </div>
                  <div className="text-xs text-cyan-400 ml-2" style={{ marginRight: "20px" }}>
                    {player.score}pts
                  </div>
                </div>
                <div className="text-sm font-medium text-white">{player.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content - Snapshots */}
      <div className="flex-1 p-3 overflow-auto ml-0 md:ml-0">
        <h2 className="text-lg font-semibold mb-2">Snapshots</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {snapshots.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Snapshot ${index + 1}`}
              className="w-full h-auto rounded cursor-pointer hover:opacity-80"
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
        </div>
      )}
    </div>
  );
}