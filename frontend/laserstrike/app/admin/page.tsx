"use client"
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HealthBar from "@/components/healthbar";
import { Player } from "@/lib/Types";

export default function SpectatorView() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [players, setPlayers] = useState<Player[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  // Add state for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Hardcoded password - in a real app, this would be handled by a proper backend authentication system
  // The password is "laser123"
  // Note: This is just for demonstration purposes. In production, never hardcode passwords like this.
  const ADMIN_PASSWORD = "laser123";

  // State for UI animations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  
  // Function to handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (password === ADMIN_PASSWORD) {
      setIsAccessGranted(true);
      setPasswordError("");
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store authentication in session storage to persist during the session
      sessionStorage.setItem('laser_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setPasswordError("Access denied. Invalid credentials.");
      setIsSubmitting(false);
      
      const formElement = document.getElementById('admin-login-form');
      if (formElement) {
        formElement.classList.add('animate-shake');
        
        setTimeout(() => {
          formElement.classList.remove('animate-shake');
        }, 500);
      }
      
      // Clear the error after a delay
      setTimeout(() => setPasswordError(""), 3000);
    }
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('laser_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to fetch players and snapshots data
  const fetchPlayersAndSnapshots = useCallback(async () => {
    try {
      //fetch players and convert to players array
      const playersRes = await fetch(`${apiUrl}/users`);
      const playersJson = await playersRes.json();
      const playersData: Player[] = Object.values(playersJson);

      //fetch snapshots
      const snapshotsRes = await fetch(`${apiUrl}/admin/images`);
      const snapshotsData: string[] = await snapshotsRes.json();
      console.log("Fetched players:", playersData);
      //Sort the players by score
      playersData.sort((a: Player, b: Player) => (b.score ?? 0) - (a.score ?? 0));
      setPlayers(playersData);
      setSnapshots(snapshotsData);
    } catch (err) {
      console.error("Failed to fetch players or snapshots", err);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Only fetch data if authenticated
    if (isAuthenticated) {
      fetchPlayersAndSnapshots();
      const interval = setInterval(fetchPlayersAndSnapshots, 1000); // Fetch every second
      return () => clearInterval(interval);
    }
  }, [apiUrl, fetchPlayersAndSnapshots, isAuthenticated]);
  
  // Function to reset the game
  const resetGame = async () => {
    // Show confirmation dialog
    const confirmReset = window.confirm("Are you sure you want to reset the game? This will clear all player data and scores.");
    
    if (!confirmReset) {
      return; // User cancelled the reset
    }
    
    try {
      const response = await fetch(`${apiUrl}/admin/reset`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (result.status === "ok") {
        alert("Game reset successful! All players and scores have been cleared.");
        // Refresh the page data
        fetchPlayersAndSnapshots();
      } else {
        alert(`Failed to reset the game: ${result.message}`);
      }
    } catch (error) {
      console.error("Error resetting the game:", error);
      alert("An error occurred while trying to reset the game. Please check the console for details.");
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('laser_admin_auth');
  };

  // Display login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center overflow-hidden">
        {/* Decorative grid background */}
        <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-10"></div>
        
        {/* Scanner effect */}
        <div className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
        
        <div id="admin-login-form" className={`relative bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md z-10 ${isAccessGranted ? 'animate-access-granted' : ''}`}>
          <div className="text-center mb-6">
            {/* Laser icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-900 mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">LaserStrike</h1>
            <p className="text-gray-400">Admin Authentication Required</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Credentials
                </div>
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isAccessGranted}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-wider"
                placeholder="••••••"
                autoFocus
              />
              {passwordError && (
                <div className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || isAccessGranted || !password.length}
              className={`w-full px-5 py-3 rounded-lg shadow-lg transition-all duration-300 font-bold flex items-center justify-center space-x-2 ${
                isAccessGranted 
                  ? "bg-green-600 border-2 border-green-500/30 text-white" 
                  : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-2 border-red-400/30 text-white hover:from-red-600 hover:to-red-800 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isSubmitting && !isAccessGranted ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isAccessGranted ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">Return to <Link href="/" className="text-cyan-400 hover:text-cyan-300 underline">game</Link></p>
          </div>
        </div>
      </div>
    );
  }

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
              className="btn-shine px-5 py-2 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-white rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-800 hover:scale-105 active:scale-95 transition-all duration-150 font-bold flex items-center gap-2 border-2 border-yellow-400/30 relative"
              onClick={resetGame}
              style={{ zIndex: 0 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Game
            </button>
            <button
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-150 flex items-center gap-1"
              onClick={handleLogout}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 flex">
        {/* Mobile Toggle */}
        <button
          className={`md:hidden transition
            ${showSidebar 
              ? "fixed z-50 bg-gray-800 hover:bg-gray-700"
              : "absolute z-50 bg-gray-800 hover:bg-gray-700"
            }
            text-white p-2 rounded-md`}
          onClick={() => setShowSidebar(!showSidebar)}
          style={
            showSidebar
              ? { left: '45%', top: '1.5%', transform: 'translateX(-50%)', boxShadow: "0 2px 8px #0008" }
              : { left: '1%', top: '4%' }
          }
        >
          {showSidebar ? "✕" : "☰"}
        </button>
        {/* Rankings Sidebar */}
        <div
          className={`bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto transition-transform duration-300 ease-in-out z-40
          fixed top-0 left-0 min-h-full
          transform ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-[12%] md:block rankings-sidebar`}
          style={{
            maxHeight: 'calc(100vh - 3rem)',
            width: showSidebar && window.innerWidth < 768 ? '50%' : '16%',
            minWidth: showSidebar && window.innerWidth < 768 ? '8rem' : undefined,
          }}
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
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <span className="text-4xl mb-2 opacity-60">🏆</span>
                <span className="font-semibold text-base">No players in the rankings yet</span>
                <span className="text-xs mt-1">Players will appear here as soon as they join the game.</span>
              </div>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex flex-col bg-gray-800 rounded-lg px-[0.5em] py-[0.25em] border border-gray-700 hover:border-gray-600 transition"
                  style={{ minWidth: 0 }}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <span className="truncate font-semibold text-white text-xs">{index + 1}. {player.name}</span>
                    <div className="ml-[0.5em] flex-shrink-0 text-right">
                      <span className="block text-[0.625rem] text-gray-300 font-bold">Score</span>
                      <span className="block text-base text-cyan-400 font-extrabold">{player.score ?? 0}</span>
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
                      <HealthBar current={player.health} max={10} />
                    </div>
                  )}
                </div>
              ))
            )}
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
            {snapshots.slice(0, 8).map((src, index) => (
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