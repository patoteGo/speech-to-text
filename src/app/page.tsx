'use client';
import { useState, useEffect } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import TranscriptionHistory from '@/components/TranscriptionHistory';

// Interface for transcription data as it appears in our frontend
interface TranscriptionData {
  id: string;
  text: string;
  audioUrl: string;
  timestamp: Date;
  duration?: number;
  tokens?: number;
  durationMinutes?: number;
  usdExpended?: number;
}

// Interface for API response transcription data (with timestamp as string)
interface ApiTranscriptionData {
  id: string;
  text: string;
  audioUrl: string;
  timestamp: string;
  duration?: number;
  tokens?: number;
  durationMinutes?: number;
  usdExpended?: number;
}

export default function Home() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranscriptionComplete = (transcription: TranscriptionData) => {
    setTranscriptions(prev => [transcription, ...prev]);
  };

  const handleTranscriptionDeleted = (deletedId: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== deletedId));
  };

  const handleAllTranscriptionsCleared = () => {
    setTranscriptions([]);
  };

  // Load transcriptions from database on component mount
  useEffect(() => {
    const loadTranscriptions = async () => {
      try {
        const response = await fetch('/api/transcriptions');
        const data = await response.json();
        
        if (data.success && data.transcriptions) {
          // Convert timestamp strings back to Date objects
          const transcriptionsWithDates = data.transcriptions.map((t: ApiTranscriptionData) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }));
          setTranscriptions(transcriptionsWithDates);
        }
      } catch (error) {
        console.error('Error loading transcriptions:', error);
      }
    };

    loadTranscriptions();
  }, []);

  // Calculate total cost estimate from actual database data
  const totalCost = transcriptions.reduce((sum, t) => {
    return sum + (t.usdExpended || (t.durationMinutes || 0) * 0.006);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold leading-6 text-gray-600 mb-2">
              Servicio de Voz a Texto para profesores
            </h1>
            <p className="text-gray-500 leading-5 mt-2">
              Graba tu voz y obtén transcripciones instantáneas con OpenAI
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recording Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Grabar Audio
              </h2>
              <AudioRecorder 
                onTranscriptionComplete={handleTranscriptionComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>

            {/* Transcription History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Historial
                </h2>
                {transcriptions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                      {transcriptions.reduce((sum, t) => sum + (t.tokens || 0), 0)} tokens
                    </div>
                    <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                      ${totalCost.toFixed(4)} USD
                    </div>
                  </div>
                )}
              </div>
              <TranscriptionHistory 
                transcriptions={transcriptions}
                isLoading={isLoading}
                onTranscriptionDeleted={handleTranscriptionDeleted}
                onAllTranscriptionsCleared={handleAllTranscriptionsCleared}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
