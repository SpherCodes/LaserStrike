"use client"
import { useState, useEffect } from "react";
import HealthBar from "@/components/healthbar";
import { Player } from "@/lib/Types";
import { useRouter } from "next/navigation";

export default function SpectatorView() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [scores, setScores] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    // --- Skeleton for fetching players and snapshots ---
    // (Uncomment and implement your API calls here)
    /*
    async function fetchPlayersAndSnapshots() {
      const playersRes = await fetch('/api/players');
      const playersData = await playersRes.json();
      setPlayers(playersData);

      const snapshotsRes = await fetch('/api/snapshots');
      const snapshotsData = await snapshotsRes.json();
      setSnapshots(snapshotsData);
    }
    fetchPlayersAndSnapshots();
    */

    // --- Test data (keep for now) ---
    const newPlayers = [
      { name: "Phiwo", health: 2, kills: 6, deaths: 3, id: "A1" },
      { name: "Calvin", health: 1, kills: 1, deaths: 1, id: "A2" },
      { name: "Siphesihle", health: 4, kills: 2, deaths: 9, id: "A3" },
      { name: "Ethan", health: 3, kills: 8, deaths: 10, id: "A4" },
      { name: "Other", health: 1, kills: 1, deaths: 9, id: "A5" },
      { name: "Other2", health: 1, kills: 9, deaths: 0, id: "A6" },
    ];
    //Calculating scores based on kills, deaths, and health
    // this system ensures that the score is always increasing or the same, even if a player has no kills or deaths.
    // The score is calculated as follows:
    // score = (kills * killScore) + (deaths * deathBonus) + (health * healthBonus)
    const playersWithScores = newPlayers.map((player) => {
      const kills = player.kills ?? 0;
      const deaths = player.deaths ?? 0;
      const health = player.health ?? 0;

      const killScore = 100;
      const deathBonus = 10;
      const healthBonus = 0.001;

      const score = Math.round((kills * killScore) + (deaths * deathBonus) + (health * healthBonus));

      return { player, score };
    });

    playersWithScores.sort((a, b) => b.score - a.score);
    const sortedPlayers = playersWithScores.map((p) => p.player);
    const sortedScores = playersWithScores.map((p) => p.score);
    setPlayers(sortedPlayers);
    setScores(sortedScores);
    setSnapshots(Array.from({ length: 200 }, () => "/images/bg-start2.jpg"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      {/* Simple Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">LaserStrike</h1>
            <p className="text-gray-400 text-sm">Live Game Monitor</p>
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
              onClick={() => router.push('/start')}
            >
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
          fixed top-0 left-0 min-h-full w-56
          transform ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-1/4 md:block`}
        >
          <div className="flex items-center mb-4 space-x-2">
            {/* Stylish icon for rankings */}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-red-900 shadow-lg">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#fff" strokeWidth="2" fill="none"/>
                <path d="M11 5v7l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <h2 className="text-xl font-bold text-yellow-200 tracking-wide drop-shadow">Rankings</h2>
          </div>
          <div className="space-y-3">
            {players.map((player, index) => {
              const isTop3 = index < 3;
              // Choose a color for each top 3 rank
              const rankColors = [
                "from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-400", // 1st
                "from-gray-300 to-gray-500 text-gray-900 border-gray-300",         // 2nd
                "from-amber-500 to-orange-700 text-orange-900 border-amber-400"    // 3rd
              ];
              return (
                <div
                  key={player.id}
                  className={
                    isTop3
                      ? "bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition"
                      : "bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition scale-95"
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={
                          isTop3
                            ? `w-12 h-12 bg-gradient-to-br ${rankColors[index]} border-2 rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg`
                            : "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold"
                        }
                      >
                        {index + 1}
                      </div>
                      <div
                        className={
                          isTop3
                            ? "w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold"
                            : "w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold"
                        }
                      >
                        {player.id}
                      </div>
                      <div>
                        <div className={isTop3 ? "font-bold text-lg text-white" : "font-medium text-base text-white"}>
                          {player.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={isTop3 ? "text-lg font-extrabold text-cyan-300" : "text-sm font-bold text-cyan-400"}>
                        {scores[index] ?? 0}
                      </div>
                      <div className={isTop3 ? "text-xs text-gray-300" : "text-xs text-gray-400"}>points</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Health</span>
                      <span className={isTop3 ? "text-white font-bold" : "text-white"}>{player.health}%</span>
                    </div>
                    <HealthBar current={player.health} />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Kills: <span className="text-green-400 font-semibold">{player.kills}</span></span>
                      <span className="text-gray-400">Deaths: <span className="text-red-400 font-semibold">{player.deaths}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Snapshots Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {/* Stylish icon for snapshots */}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-gray-800 to-gray-900 shadow-lg">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="3" y="6" width="16" height="12" rx="3" stroke="#fff" strokeWidth="2"/>
                  <circle cx="11" cy="12" r="3" stroke="#fff" strokeWidth="2"/>
                  <rect x="8" y="3" width="6" height="3" rx="1.5" fill="#fff" fillOpacity="0.2"/>
                </svg>
              </span>
              <h2 className="text-xl font-bold text-red-200 tracking-wide drop-shadow">Battle Snapshots</h2>
            </div>
            <div className="text-sm text-gray-400">{snapshots.length} photos</div>
          </div>
          <div className="snapshots-grid">
            {snapshots.slice(0, 12).map((src, index) => (
              <div
                key={index}
                className="snapshot-card"
                onClick={() => setSelectedImage(src)}
              >
                <img
                  src={src}
                  alt={`Battle snapshot ${index + 1}`}
                  className="snapshot-img"
                />
                <div className="snapshot-meta">
                  <span>Shot #{index + 1}</span>
                  <span>{Math.floor(Math.random() * 60)}s ago</span>
                </div>
              </div>
            ))}
          </div>
          {snapshots.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-4 opacity-50">📷</div>
              <p>No battle snapshots yet</p>
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