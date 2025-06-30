'use client';
import { sendImageToServer } from '@/lib/actions/game.actions';
import React, { useEffect, useRef, useState } from 'react';

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported in this environment.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Unable to access the camera. Please check permissions.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden z-50">
      {error ? (
        <p className="text-white">{error}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Take Photo Button */}
          {!capturedImage && (
            <button
              onClick={takePhoto}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-40 h-40 bg-white text-black rounded-full shadow-2xl border-4 border-red-600 text-2xl font-bold flex items-center justify-center"
            >
              Strike
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CameraCapture;
