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
  const [lastCaptureStatus, setLastCaptureStatus] = useState<'success' | 'error' | null>(null);
  const [captureMessage, setCaptureMessage] = useState<string>('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const soundPaths = Array.from({ length: 20 }, (_, i) => `/sounds/shoot${i}.wav`);
  const [showShotNotification, setShowShotNotification] = useState(false);
  // const [notificationMessage, setNotificationMessage] = useState('');
  
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
        console.log('WebSocket state:', socket?.readyState);
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
      console.log('Player shot someone:', shotEvent.target.name);
      // setNotificationMessage(`You shot ${shotEvent.target.name}! +100 points`);
      // setShowShotNotification(true);
    } else if (shotEvent.target.id === playerId) {
      // This player was shot
      if (onPlayerUpdate) {
        onPlayerUpdate({
          deaths: shotEvent.target.deaths || 0,
          health: shotEvent.target.health
        });
      }
      // setNotificationMessage(`You were shot by ${shotEvent.killer.name}!`);
      // setShowShotNotification(true);
    }
  }, [shotEvent, playerId, onPlayerUpdate]);

  // Separate effect to handle notification timer
  useEffect(() => {
    if (showShotNotification) {
      const timer = setTimeout(() => {
        setShowShotNotification(false);
      }, 3000);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    }
  }, [showShotNotification]);

  function playSound(pId: number) {
    const audio = new Audio(soundPaths[pId]);
    audio.play().catch((e) => console.error("Failed to play sound:", e));
  }
  // Capture frame and send
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    if (!isSocketConnected) {
      setError('WebSocket not connected');
      return;
    }


    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Play shoot sound
    playSound(playerId)

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg', 0.9);
      
      // Increment capture count to show activity
      setCaptureCount(prev => prev + 1);
      setLastCaptureStatus(null);
      setCaptureMessage('');

      // Send image via WebSocket with callback-based response handling
      try {
        sendDataToServer({
          type: 'capture_image',
          image: image.split(',')[1], // Send base64 data without prefix
          player_id: playerId
        });
      } catch (error) {
        console.error('Error sending image:', error);
        setLastCaptureStatus('error');
        setCaptureMessage('Connection error. Please try again.');
        
        setTimeout(() => {
          setLastCaptureStatus(null);
          setCaptureMessage('');
        }, 3000);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center overflow-hidden">
      {/* Crosshair overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-16 h-16">
            {/* Crosshair lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 opacity-80 shadow-lg"></div>
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-red-500 opacity-80 shadow-lg"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
          </div>
        </div>
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

      {/* Enhanced capture button with pulse animation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative">
          {/* Pulse ring */}
          <div className= "absolute inset-0 w-40 h-40 rounded-full opacity-20 "></div>
          {/* Main button */}
          <button
            onClick={takePhoto}
            disabled={!isSocketConnected}
            className={`relative w-40 h-40 rounded-full shadow-2xl border-4 text-2xl font-bold flex items-center justify-center transition-all duration-150 ${
              !isSocketConnected
                ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border-gray-600 text-gray-900 scale-95 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black border-red-600 hover:scale-105 active:scale-95 hover:shadow-red-500/50'
            }`}
          >
            <div className="flex flex-col items-center">
                <>
                  <span className="text-3xl mb-1">🎯</span>
                  <span className="text-lg font-extrabold">STRIKE</span>
                </>
            </div>
          </button>
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
          {captureCount > 0 && (
            <span className="text-white text-xs bg-red-600 rounded-full px-2 py-1">
              {captureCount}
            </span>
          )}
        </div>
      </div>

      {/* Capture Status Feedback */}
      {lastCaptureStatus && (
        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 rounded-lg backdrop-blur-sm border-2 transition-all duration-300 ${
          lastCaptureStatus === 'success' 
            ? 'bg-green-900/80 border-green-500 text-green-100' 
            : 'bg-red-900/80 border-red-500 text-red-100'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-xl">
              {lastCaptureStatus === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{captureMessage}</span>
          </div>
        </div>
      )}
      
      {/* Shot notification */}
      {showShotNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border-2 border-red-500 transition-all duration-300">
          <p className="text-white text-center text-lg font-semibold">
            {/* {notificationMessage} */}
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraViewer;
