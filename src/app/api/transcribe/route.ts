import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Vercel Blob token not configured' },
        { status: 500 }
      );
    }

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `audio-${timestamp}.webm`;

    try {
      // Upload file to Vercel Blob
      const blob = await put(filename, audioFile, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log('File uploaded to blob:', blob.url);

      // Convert the audio file to a format suitable for OpenAI
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

      // Create a File object for OpenAI
      const openaiFile = new File([audioBlob], filename, { type: audioFile.type });

      // Transcribe audio using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: openaiFile,
        model: 'whisper-1',
        language: 'es', // Spanish language
        response_format: 'verbose_json', // Get detailed response with duration
        temperature: 0.2,
        // Add speaker diarization parameters
        prompt: "Identify different speakers in the conversation. Format as Speaker 1: [text], Speaker 2: [text], etc.",
      });

      // Calculate estimated tokens (Whisper pricing is per minute, but we can estimate)
      // OpenAI Whisper charges $0.006 per minute, roughly equivalent to token usage
      const durationMinutes = transcription.duration ? Math.ceil(transcription.duration / 60) : 1;
      const estimatedTokens = Math.ceil(transcription.text.length / 4); // Rough estimate: 4 chars per token

      // Calculate cost in USD
      const usdCost = durationMinutes * 0.006;

      console.log('Transcription completed:', {
        duration: transcription.duration,
        textLength: transcription.text.length,
        estimatedTokens,
        usdCost
      });

      // Save to database
      const savedTranscription = await prisma.transcription.create({
        data: {
          audioUrl: blob.url,
          transcriptionText: transcription.text,
          tokensExpended: estimatedTokens,
          timeInSeconds: transcription.duration || 0,
          usdExpended: usdCost,
        }
      });

      // Return successful response
      return NextResponse.json({
        success: true,
        transcription: {
          id: savedTranscription.id,
          text: savedTranscription.transcriptionText,
          audioUrl: savedTranscription.audioUrl,
          timestamp: savedTranscription.createdAt.toISOString(),
          duration: savedTranscription.timeInSeconds,
          tokens: savedTranscription.tokensExpended,
          durationMinutes,
          usdExpended: savedTranscription.usdExpended,
        }
      });

    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Transcription API error:', error);
    
    // Check if it's an OpenAI error
    if (error instanceof Error && error.message.includes('openai')) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 