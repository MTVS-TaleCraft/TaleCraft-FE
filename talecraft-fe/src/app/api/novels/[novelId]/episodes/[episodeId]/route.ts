import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ novelId: string; episodeId: string }> }
) {
  try {
    const { novelId, episodeId } = await params;
    
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/novels/${novelId}/episodes/${episodeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Episode API error:', error);
    return NextResponse.json(
      { 
        error: '에피소드를 불러올 수 없습니다.'
      },
      { status: 500 }
    );
  }
} 