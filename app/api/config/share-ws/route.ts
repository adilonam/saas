import { NextResponse } from 'next/server';

export async function GET() {
  const fastApiUrl = process.env.FAST_API_URL || '';
  
  if (!fastApiUrl) {
    return NextResponse.json(
      { error: 'Backend URL not configured' },
      { status: 500 }
    );
  }

  // Convert https://saas-backend-326a81a69453.herokuapp.com
  // to wss://saas-backend-326a81a69453.herokuapp.com/ws/share/ws/{room}
  const wsUrl = fastApiUrl.replace(/^https?:\/\//, 'wss://') + '/ws/share/ws';
  const healthUrl = fastApiUrl + '/ws/share/health';

  return NextResponse.json({
    wsUrl,
    healthUrl,
  });
}
