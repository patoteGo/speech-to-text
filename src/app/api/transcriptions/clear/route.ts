import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE() {
  try {
    // Get all transcriptions to delete audio files from blob
    const transcriptions = await prisma.transcription.findMany({
      select: {
        audioUrl: true
      }
    });

    // Delete all audio files from Vercel Blob storage
    const deletePromises = transcriptions.map(async (t) => {
      try {
        await del(t.audioUrl, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log('Audio file deleted from blob:', t.audioUrl);
      } catch (error) {
        console.error('Error deleting audio file:', t.audioUrl, error);
        // Continue with others even if one fails
      }
    });

    await Promise.allSettled(deletePromises);

    // Delete all transcriptions from database
    const deleteResult = await prisma.transcription.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} transcripciones eliminadas exitosamente`,
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al eliminar las transcripciones' 
      },
      { status: 500 }
    );
  }
} 