'use client';
import { sendDataToServer, getSocket } from '@/lib/socket';
import useShotEvents from '@/lib/hooks/useShotEvents';
import { Player } from '@/lib/Types';
import React, { useEffect, useRef, useState } from 'react';

const CameraViewer: React.FC<{ 
  playerId: number,
  onPlayerUpdate?: (updates: Partial<Player>) => void
}> = ({ playerId, onPlayerUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const [showShotNotification, setShowShotNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  // Subscribe to shot events
  const shotEvent = useShotEvents();

  // Helper to stop any existing camera stream
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current!.srcObject = null;
    }
  };

  // Start camera with proper error handling
  const startCamera = async () => {
    // Stop any old stream first
    stopCamera();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported in this environment.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setError(null);
        } catch (playErr: unknown) {
          console.warn('Autoplay blocked or aborted:', playErr);
          setError('Tap the video to start the camera.');
        }
      }
    } catch (err: unknown) {
      console.error('Camera error:', err);
      const error = err as { name?: string };
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Camera is already in use. Please close other apps/tabs.');
      } else {
        setError('Unable to access the camera. Please check permissions.');
      }
    }
  };

  // On mount, start camera and ensure WebSocket is connected
  useEffect(() => {
    startCamera();
    
    // Ensure WebSocket is connected
    const ensureSocketConnection = () => {
      try {
        const socket = getSocket(playerId);
        setIsSocketConnected(socket?.readyState === WebSocket.OPEN);
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setIsSocketConnected(false);
      }
    };

    ensureSocketConnection();
    
    // Check connection periodically
    const connectionCheckInterval = setInterval(() => {
      ensureSocketConnection();
    }, 5000);

    return () => {
      stopCamera();
      clearInterval(connectionCheckInterval);
    };
  }, [playerId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handle shot events
  useEffect(() => {
    if (!shotEvent) return;
    
    // Check if this player was involved in the shot
    if (shotEvent.killer.id === playerId) {
      // This player shot someone
      if (onPlayerUpdate) {
        onPlayerUpdate({
          kills: shotEvent.killer.kills || 0,
          score: shotEvent.killer.score
        });
      }
      setNotificationMessage(`You shot ${shotEvent.target.name}!`);
      setShowShotNotification(true);
    } 
    if (shotEvent.target.id === playerId) {
      // This player was shot
      if (onPlayerUpdate) {
        onPlayerUpdate({
          deaths: shotEvent.target.deaths || 0,
          health: shotEvent.target.health
        });
      }
      setNotificationMessage(`You were shot by ${shotEvent.killer.name}!`);
      setShowShotNotification(true);
    }
  }, [shotEvent, playerId, onPlayerUpdate]);

  useEffect(() => {
    const loadSound = async () => {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const response = await fetch(`/sounds/shoot${playerId}.wav`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      bufferRef.current = buffer;
    };

    loadSound().catch(console.error);
  }, [playerId]);

  // Separate effect to handle notification timer
  useEffect(() => {
    if (showShotNotification) {
      const timer = setTimeout(() => {
        setShowShotNotification(false);
      }, 1000);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    }
  }, [showShotNotification]);


  function playSound() {
    const buffer = bufferRef.current;
    const ctx = audioCtxRef.current;

    if (!buffer || !ctx) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0, 0, 0.5); // start at 0s, play 0.5s
  }
  // Capture frame and send
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    if (!isSocketConnected) {
      return;
    }


    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Play shoot sound
    playSound()

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg', 0.9);

      // Send image via WebSocket with callback-based response handling
      try {
        sendDataToServer({
          type: 'capture_image',
          image: image.split(',')[1], // Send base64 data without prefix
          player_id: playerId
        });
      } catch (error) {
        console.error('Error sending image:', error);
        
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center overflow-hidden">
      {/* Redesigned crosshair overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <svg className="w-24 h-24 text-red-500 opacity-80 drop-shadow-lg animate-pulse" viewBox="0 0 64 64" fill="none">
          {/* Outer targeting circle */}
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
          {/* Inner precision circle */}
          <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1" />
          {/* Cross lines */}
          <line x1="32" y1="2" x2="32" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="62" x2="32" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="32" x2="50" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Center precision dot */}
          <circle cx="32" cy="32" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Corner frame indicators */}
      <div className="absolute inset-4 z-10 pointer-events-none">
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500 opacity-70"></div>
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500 opacity-70"></div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500 opacity-70"></div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500 opacity-70"></div>
      </div>

      {/* Show error or tap instructions */}
      {error ? (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            if (error.includes('Tap')) {
              startCamera();
            }
          }}
        >
          <div className="text-6xl mb-4">📷</div>
          <p className="mb-4 text-center text-lg font-medium">{error}</p>
          {error.includes('Tap') && (
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold shadow-lg hover:from-red-700 hover:to-red-600 transition-all duration-200">
              Start Camera
            </button>
          )}
        </div>
      ) : null}

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        onClick={() => {
          // Manual play fallback
          videoRef.current?.play().catch(() => {});
        }}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Enhanced tactical shoot button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative">
          {/* Outer glow ring - animated when connected */}
          <div className={`absolute inset-0 w-28 h-28 rounded-full transition-all duration-300 ${
            isSocketConnected 
              ? 'animate-ping bg-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
              : 'bg-gray-500/20'
          }`}></div>
          
          {/* Secondary pulse ring */}
          <div className={`absolute inset-4 w-24 h-24 rounded-full transition-all duration-500 ${
            isSocketConnected 
              ? 'animate-pulse bg-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]' 
              : 'bg-gray-400/10'
          }`}></div>
          
          {/* Main tactical button */}
          <button
            onClick={takePhoto}
            disabled={!isSocketConnected}
            className={`relative w-28 h-28 rounded-full shadow-2xl border-2 text-lg font-bold flex items-center justify-center transition-all duration-200 transform ${
               !isSocketConnected
                 ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 border-gray-600 text-gray-400 scale-95 cursor-not-allowed opacity-60'
                 : 'bg-gradient-to-br from-red-900 via-red-800 to-black border-red-500 text-white hover:scale-110 active:scale-95 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:border-red-400 active:bg-gradient-to-br active:from-red-800 active:via-red-700 active:to-red-900'
             }`}
          >
            {/* Inner tactical design */}
            <div className="relative flex flex-col items-center">
              {/* Crosshair icon */}
              <div className="relative">
                <div className={`w-6 h-6 flex items-center justify-center ${
                  isSocketConnected ? 'text-red-300' : 'text-gray-500'
                }`}>
                  {/* Custom crosshair SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
                    <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              
              {/* Action text */}
              <span className={`text-xs font-extrabold tracking-wider mt-1 ${
                isSocketConnected ? 'text-red-100' : 'text-gray-500'
              }`}>
                {isSocketConnected ? 'FIRE' : 'OFFLINE'}
              </span>
            </div>
            
            {/* Tactical corner elements */}
            <div className="absolute inset-1 rounded-full border border-red-600/20 pointer-events-none"></div>
            
            {/* Status indicator dots */}
            <div className="absolute -top-1 -right-1">
              <div className={`w-3 h-3 rounded-full border-2 border-black ${
                isSocketConnected 
                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse' 
                  : 'bg-red-500 animate-bounce'
              }`}></div>
            </div>
          </button>
          
          {/* Tactical grid overlay when active */}
          {isSocketConnected && (
            <div className="absolute inset-0 w-20 h-20 rounded-full pointer-events-none opacity-20">
              <div className="absolute inset-2 border border-red-500/30 rounded-full"></div>
              <div className="absolute top-1/2 left-2 right-2 h-px bg-red-500/20"></div>
              <div className="absolute left-1/2 top-2 bottom-2 w-px bg-red-500/20"></div>
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
          <div className={`w-2 h-2 rounded-full ${
            isSocketConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500 animate-bounce'
          }`}></div>
          <span className="text-white text-sm font-medium">
            {isSocketConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      {/* Shot notification */}
      {showShotNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border-2 border-red-500 transition-all duration-300">
          <p className="text-white text-center text-lg font-semibold">
            {notificationMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraViewer;
