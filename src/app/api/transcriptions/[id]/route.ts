import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de transcripción requerido' },
        { status: 400 }
      );
    }

    // First, get the transcription to get the audio URL for blob deletion
    const transcription = await prisma.transcription.findUnique({
      where: { id }
    });

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcripción no encontrada' },
        { status: 404 }
      );
    }

    try {
      // Delete from Vercel Blob storage
      await del(transcription.audioUrl, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('Audio file deleted from blob:', transcription.audioUrl);
    } catch (blobError) {
      console.error('Error deleting from blob:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.transcription.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Transcripción eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete transcription error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al eliminar la transcripción' 
      },
      { status: 500 }
    );
  }
} 