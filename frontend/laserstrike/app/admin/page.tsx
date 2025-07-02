"use client"
import { useState, useEffect } from "react";
import HealthBar from "@/components/healthbar";
import { Player } from "@/lib/Types";
import { useRouter } from "next/navigation";

export default function SpectatorView() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [players, setPlayers] = useState<Player[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [scores, setScores] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {

    async function fetchPlayersAndSnapshots() {
      try {
        const playersRes = await fetch(`${apiUrl}/users`);
        const playersJson = await playersRes.json();
        // Convert object to array of Player
        const playersData: Player[] = Object.values(playersJson);

        const snapshotsRes = await fetch(`${apiUrl}/admin/images`);
        const snapshotsData: string[] = await snapshotsRes.json();

        console.log("Fetched players:", playersData);
        console.log(typeof(playersData));
        // Calculate scores just like in the test data
        type PlayerWithScore = { player: Player; score: number };
        const playersWithScores: PlayerWithScore[] = playersData.map((player: Player) => {
          const kills = player.kills ?? 0;
          const deaths = player.deaths ?? 0;
          const health = player.health ?? 0;
          const score = Math.round(kills * 100 + deaths * 10 + health * 0);
          return { player, score };
        });

        playersWithScores.sort((a: PlayerWithScore, b: PlayerWithScore) => b.score - a.score);
        setPlayers(playersWithScores.map((p) => p.player));
        setScores(playersWithScores.map((p) => p.score));
        setSnapshots(snapshotsData);
      } catch (err) {
        console.error("Failed to fetch players or snapshots", err);
      }
    }

    fetchPlayersAndSnapshots();
   const interval = setInterval(fetchPlayersAndSnapshots, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, [apiUrl]);
  
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
              className="btn-shine btn-move px-5 py-2 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 hover:scale-105 active:scale-95 transition-all duration-150 font-bold flex items-center gap-2 border-2 border-green-400/30 relative"
              onClick={() => router.push('/start')}
              style={{ zIndex: 0 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Start Game
            </button>
            <button
              className="btn-shine btn-move px-5 py-2 bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white rounded-lg shadow-lg hover:from-red-700 hover:to-red-950 hover:scale-105 active:scale-95 transition-all duration-150 font-bold flex items-center gap-2 border-2 border-red-400/30 relative"
              style={{ zIndex: 0 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
          className={`bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto transition-transform duration-300 ease-in-out z-40
          fixed top-0 left-0 min-h-full w-[18%]
          transform ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-[12%] md:block rankings-sidebar`}
          style={{ maxHeight: 'calc(100vh - 3rem)' }} // 3rem for header
        >
          <div className="flex items-center mb-4 space-x-2">
            <span className="inline-flex items-center justify-center w-2rem h-2rem rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-red-900 shadow-lg">
              <svg className="w-1.25rem h-1.25rem text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="font-bold text-lg text-white">Rankings</span>
          </div>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex flex-col bg-gray-800 rounded-lg px-[0.5em] py-[0.25em] border border-gray-700 hover:border-gray-600 transition"
                style={{ minWidth: 0 }}
              >
                <div className="flex items-center justify-between min-w-0">
                  <span className="truncate font-semibold text-white text-xs">{index + 1}. {player.name}</span>
                  <div className="ml-[0.5em] flex-shrink-0 text-right">
                    <span className="block text-[0.625rem] text-gray-300 font-bold">Score</span>
                    <span className="block text-base text-cyan-400 font-extrabold">{scores[index] ?? 0}</span>
                  </div>
                </div>
                <span className="truncate text-[0.6875rem] text-gray-400">
                  Health: <span className="text-green-400">{player.health}</span> | 
                  K: <span className="text-cyan-300">{player.kills}</span> | 
                  D: <span className="text-red-400">{player.deaths}</span>
                </span>
                {/* Show health bar only if few players */}
                {players.length <= 6 && (
                  <div className="mt-[0.25em] mb-[0.25em]">
                    <HealthBar current={player.health} />
                  </div>
                )}
              </div>
            ))}
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
                  src={`data:image/jpeg;base64,${src}`}
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
              src={`data:image/jpeg;base64,${selectedImage}`}
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