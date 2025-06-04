import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        vercelBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Service check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 