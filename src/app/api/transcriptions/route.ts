import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Transcription } from '@/generated/prisma';

export async function GET() {
  try {
    const transcriptions = await prisma.transcription.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend interface
    const formattedTranscriptions = transcriptions.map((t: Transcription) => ({
      id: t.id,
      text: t.transcriptionText,
      audioUrl: t.audioUrl,
      timestamp: t.createdAt.toISOString(),
      duration: t.timeInSeconds,
      tokens: t.tokensExpended,
      durationMinutes: Math.ceil(t.timeInSeconds / 60),
      usdExpended: t.usdExpended,
    }));

    return NextResponse.json({
      success: true,
      transcriptions: formattedTranscriptions,
      total: transcriptions.length,
      totalTokens: transcriptions.reduce((sum: number, t: Transcription) => sum + t.tokensExpended, 0),
      totalCost: transcriptions.reduce((sum: number, t: Transcription) => sum + t.usdExpended, 0),
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch transcriptions' 
      },
      { status: 500 }
    );
  }
} 