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
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Show error or tap instructions */}
      {error ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-4"
          onClick={() => {
            if (error.includes('Tap')) {
              startCamera();
            }
          }}
        >
          <p className="mb-2">{error}</p>
          {error.includes('Tap') && (
            <button className="px-4 py-2 bg-white text-black rounded">
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
        className="absolute top-0 left-0 w-full h-full object-cover"
        onClick={() => {
          // Manual play fallback
          videoRef.current?.play().catch(() => {});
        }}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture button */}
      <button
        onClick={takePhoto}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-40 h-40 bg-white text-black rounded-full shadow-2xl border-4 border-red-600 text-2xl font-bold flex items-center justify-center"
      >
        Strike
      </button>
    </div>
  );
};

export default CameraCapture;
