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

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const speakerCount = formData.get('speakerCount') as string;

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

    // Convert the audio file to a format suitable for OpenAI
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `diarized-audio-${timestamp}.webm`;
    const openaiFile = new File([audioBlob], filename, { type: audioFile.type });

    // First, get the regular transcription
    const transcription = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: 'whisper-1',
      language: 'es',
      response_format: 'verbose_json',
      temperature: 0.2,
    });

    // Then use GPT to identify speakers and format the conversation
    const speakerPrompt = `
Please analyze this transcript and identify different speakers in the conversation. Format the output as a conversation with speaker labels.

Transcript: "${transcription.text}"

Instructions:
1. Identify distinct speakers based on context, speaking patterns, and conversation flow
2. Format as:
   Persona 1: [what they said]
   Persona 2: [what they said]
   Persona 1: [continuing conversation]
   etc.

3. Use "Persona 1", "Persona 2", etc. as speaker labels
4. If you detect more than ${speakerCount || '2'} speakers, use additional numbers
5. Be consistent with speaker identification throughout
6. Maintain the natural flow and meaning of the conversation
7. If uncertain about speaker changes, err on the side of fewer speaker transitions

Please provide ONLY the formatted conversation output, no additional commentary.
    `;

    const diarizationResult = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at identifying speakers in conversations and formatting transcripts with speaker diarization.'
        },
        {
          role: 'user',
          content: speakerPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const diarizedText = diarizationResult.choices[0]?.message?.content || transcription.text;

    // Calculate costs
    const durationMinutes = transcription.duration ? Math.ceil(transcription.duration / 60) : 1;
    const whisperCost = durationMinutes * 0.006;
    const gptTokens = diarizationResult.usage?.total_tokens || 0;
    const gptCost = (gptTokens / 1000) * 0.03; // GPT-4 pricing
    const totalCost = whisperCost + gptCost;

    // Upload to blob storage if needed
    let blobUrl = '';
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, audioFile, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        blobUrl = blob.url;
      } catch (blobError) {
        console.error('Blob upload error:', blobError);
        // Continue without blob storage
      }
    }

    // Save to database
    const savedTranscription = await prisma.transcription.create({
      data: {
        audioUrl: blobUrl,
        transcriptionText: diarizedText,
        tokensExpended: gptTokens,
        timeInSeconds: transcription.duration || 0,
        usdExpended: totalCost,
      }
    });

    return NextResponse.json({
      success: true,
      transcription: {
        id: savedTranscription.id,
        text: diarizedText,
        originalText: transcription.text,
        audioUrl: blobUrl,
        timestamp: savedTranscription.createdAt.toISOString(),
        duration: savedTranscription.timeInSeconds,
        tokens: gptTokens,
        durationMinutes,
        usdExpended: totalCost,
        speakerCount: (diarizedText.match(/Persona \d+:/g) || []).length,
      }
    });

  } catch (error) {
    console.error('Diarization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during speaker diarization' },
      { status: 500 }
    );
  }
} 