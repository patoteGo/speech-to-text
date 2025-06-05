'use client';

import { useState } from 'react';

interface Transcription {
  id: string;
  text: string;
  audioUrl: string;
  timestamp: Date;
  duration?: number;
  tokens?: number;
  durationMinutes?: number;
  usdExpended?: number;
}

interface TranscriptionHistoryProps {
  transcriptions: Transcription[];
  isLoading: boolean;
  onTranscriptionDeleted: (id: string) => void;
  onAllTranscriptionsCleared: () => void;
}

export default function TranscriptionHistory({ 
  transcriptions, 
  isLoading,
  onTranscriptionDeleted,
  onAllTranscriptionsCleared
}: TranscriptionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const deleteTranscription = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transcripción? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onTranscriptionDeleted(id);
        alert('Transcripción eliminada exitosamente');
      } else {
        throw new Error(result.error || 'Error al eliminar la transcripción');
      }
    } catch (error) {
      console.error('Error deleting transcription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const clearAllTranscriptions = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODAS las transcripciones? Esta acción no se puede deshacer.')) {
      return;
    }

    setClearingAll(true);
    
    try {
      const response = await fetch('/api/transcriptions/clear', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onAllTranscriptionsCleared();
        alert(result.message);
      } else {
        throw new Error(result.error || 'Error al eliminar las transcripciones');
      }
    } catch (error) {
      console.error('Error clearing all transcriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar todas las transcripciones: ${errorMessage}`);
    } finally {
      setClearingAll(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading && transcriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Procesando transcripción...</span>
        </div>
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg">No hay transcripciones aún</p>
        <p className="text-sm text-gray-400">Graba algo de audio para ver las transcripciones aquí</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with clear all button */}
      {transcriptions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h3 className="font-bold mb-2 sm:text-lg font-medium text-gray-900">
            Historial de Transcripciones ({transcriptions.length})
          </h3>
          <button
            onClick={clearAllTranscriptions}
            disabled={clearingAll}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar todas las transcripciones"
          >
            {clearingAll ? (
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Eliminando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Limpiar Todo</span>
              </div>
            )}
          </button>
        </div>
      )}
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transcriptions.map((transcription) => (
        <div
          key={transcription.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">
                {formatTimestamp(transcription.timestamp)}
              </span>
              {transcription.tokens && (
                <span className="text-xs text-blue-600 font-medium">
                  {transcription.tokens} tokens
                  {transcription.durationMinutes && ` • ${transcription.durationMinutes} min`}
                  {transcription.usdExpended && ` • $${transcription.usdExpended.toFixed(4)}`}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(transcription.text, transcription.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copiar al portapapeles"
              >
                {copiedId === transcription.id ? (
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => deleteTranscription(transcription.id)}
                disabled={deletingId === transcription.id}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Eliminar transcripción"
              >
                {deletingId === transcription.id ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
              
              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(transcription.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={expandedId === transcription.id ? "Contraer" : "Expandir"}
              >
                <svg 
                  className={`h-4 w-4 transition-transform ${expandedId === transcription.id ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Transcription Text */}
          <div className="mb-3">
            <p className="text-gray-800 leading-relaxed">
              {expandedId === transcription.id 
                ? transcription.text 
                : truncateText(transcription.text)
              }
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-gray-50 rounded-md p-2">
            <audio controls className="w-full h-8">
              <source src={transcription.audioUrl} type="audio/webm" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>

          {/* Show "Show more/less" for long texts */}
          {transcription.text.length > 100 && (
            <button
              onClick={() => toggleExpanded(transcription.id)}
              className="text-blue-500 hover:text-blue-600 text-sm mt-2 transition-colors"
            >
              {expandedId === transcription.id ? 'Mostrar menos' : 'Mostrar más'}
            </button>
          )}
        </div>
      ))}
      
      {/* Loading indicator for new transcriptions */}
      {isLoading && (
        <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      )}
      </div>
    </div>
  );
} 