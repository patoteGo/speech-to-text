'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: {
    id: string;
    text: string;
    audioUrl: string;
    timestamp: Date;
    duration?: number;
    tokens?: number;
    durationMinutes?: number;
    usdExpended?: number;
  }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function AudioRecorder({ 
  onTranscriptionComplete, 
  isLoading, 
  setIsLoading 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Clean up the stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al acceder al micrófono. Por favor, asegúrate de haber otorgado permisos de micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioUrl) return;
    
    setIsLoading(true);
    
    try {
      // Convert the blob URL to a File object
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Create a proper File object from the blob
      const audioFile = new File([blob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm;codecs=opus'
      });
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // Call the transcription API
      const apiResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (!apiResponse.ok) {
        throw new Error(result.error || 'Failed to transcribe audio');
      }
      
      if (result.success && result.transcription) {
        // Convert timestamp back to Date object
        const transcription = {
          ...result.transcription,
          timestamp: new Date(result.transcription.timestamp)
        };
        
        onTranscriptionComplete(transcription);
        
        // Reset for next recording
        setAudioUrl(null);
        setRecordingTime(0);
      } else {
        throw new Error('Invalid response from transcription service');
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al transcribir audio: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="flex justify-center items-center">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={isLoading}
            className="w-20 h-20 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {isRecording && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-mono text-red-600">
              {formatTime(recordingTime)}
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Detener Grabación
            </button>
          </div>
        )}
      </div>

      {/* Audio Preview and Actions */}
      {audioUrl && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Grabación completada ({formatTime(recordingTime)})</p>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/webm" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleTranscribe}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Transcribiendo...
                </>
              ) : (
                'Transcribir'
              )}
            </button>
            
            <button
              onClick={discardRecording}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 text-center">
        {!isRecording && !audioUrl && !isLoading && (
          <p>Haz clic en el botón del micrófono para comenzar a grabar</p>
        )}
      </div>
    </div>
  );
} 