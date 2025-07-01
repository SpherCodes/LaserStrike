'use client';
import { sendImageToServer } from '@/lib/socket';
import React, { useEffect, useRef, useState } from 'react';

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

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
        } catch (playErr: any) {
          console.warn('Autoplay blocked or aborted:', playErr);
          setError('Tap the video to start the camera.');
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use. Please close other apps/tabs.');
      } else {
        setError('Unable to access the camera. Please check permissions.');
      }
    }
  };

  // On mount, start camera; on unmount, stop it
  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  // Capture frame and send
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg', 0.9);
      sendImageToServer(image);
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
          <div className="absolute inset-0 w-40 h-40 rounded-full bg-red-500 opacity-20 animate-ping"></div>
          {/* Main button */}
          <button
            onClick={takePhoto}
            className="relative w-40 h-40 bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black rounded-full shadow-2xl border-4 border-red-600 text-2xl font-bold flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-150 hover:shadow-red-500/50"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">🎯</span>
              <span className="text-lg font-extrabold">STRIKE</span>
            </div>
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
