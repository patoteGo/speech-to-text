'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

// Extend Window interface to include webkit prefixed AudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default function AudioVisualizer({ stream, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Stop animation if not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    // Set up Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording || !analyserRef.current) return;

      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgb(249, 250, 251)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Color gradient based on frequency intensity
        const intensity = dataArray[i] / 255;
        if (intensity > 0.7) {
          ctx.fillStyle = 'rgb(239, 68, 68)'; // Red for high levels
        } else if (intensity > 0.4) {
          ctx.fillStyle = 'rgb(245, 158, 11)'; // Orange for medium levels
        } else if (intensity > 0.1) {
          ctx.fillStyle = 'rgb(34, 197, 94)'; // Green for good levels
        } else {
          ctx.fillStyle = 'rgb(156, 163, 175)'; // Gray for low levels
        }

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Draw volume level indicator
      const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const volumePercentage = (averageVolume / 255) * 100;
      
      // Volume level bar on the right
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(canvas.width - 30, 10, 20, canvas.height - 20);
      
      // Fill level
      const levelHeight = ((canvas.height - 20) * volumePercentage) / 100;
      if (volumePercentage > 70) {
        ctx.fillStyle = 'rgb(239, 68, 68)'; // Red
      } else if (volumePercentage > 30) {
        ctx.fillStyle = 'rgb(34, 197, 94)'; // Green
      } else {
        ctx.fillStyle = 'rgb(156, 163, 175)'; // Gray
      }
      
      ctx.fillRect(
        canvas.width - 30, 
        canvas.height - 10 - levelHeight, 
        20, 
        levelHeight
      );

      // Volume percentage text
      ctx.fillStyle = 'rgb(75, 85, 99)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.round(volumePercentage)}%`, 
        canvas.width - 20, 
        canvas.height + 15
      );
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream, isRecording]);

  if (!isRecording) {
    return (
      <div className="w-full h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-sm">Visualizador de audio</p>
          <p className="text-xs">Presiona grabar para ver los niveles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Niveles de Audio en Tiempo Real</h4>
        <p className="text-xs text-gray-500">
          Verde = Bueno • Naranja = Alto • Rojo = Muy Alto • Gris = Muy Bajo
        </p>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full h-24 bg-gray-50 rounded-lg border border-gray-200"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
          GRABANDO
        </div>
      </div>
    </div>
  );
} 