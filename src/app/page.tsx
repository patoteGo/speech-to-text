'use client';
import { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import TranscriptionHistory from '@/components/TranscriptionHistory';

export default function Home() {
  const [transcriptions, setTranscriptions] = useState<{
    id: string;
    text: string;
    audioUrl: string;
    timestamp: Date;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranscriptionComplete = (transcription: {
    id: string;
    text: string;
    audioUrl: string;
    timestamp: Date;
  }) => {
    setTranscriptions(prev => [transcription, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Speech to Text Service
            </h1>
            <p className="text-gray-600 text-lg">
              Record your voice and get instant transcriptions powered by OpenAI
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recording Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Record Audio
              </h2>
              <AudioRecorder 
                onTranscriptionComplete={handleTranscriptionComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>

            {/* Transcription History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Transcription History
              </h2>
              <TranscriptionHistory 
                transcriptions={transcriptions}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
