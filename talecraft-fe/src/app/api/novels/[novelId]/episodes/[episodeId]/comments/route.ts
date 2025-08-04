import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ novelId: string; episodeId: string }> }
) {
  try {
    const { novelId, episodeId } = await params;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/novels/${novelId}/episodes/${episodeId}/comments`, {
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
    console.error('Comments API error:', error);
    return NextResponse.json(
      { 
        error: '댓글을 불러올 수 없습니다.',
        commentList: []
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ novelId: string; episodeId: string }> }
) {
  try {
    const { novelId, episodeId } = await params;
    const body = await request.json();
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/novels/${novelId}/episodes/${episodeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Comment creation API error:', error);
    return NextResponse.json(
      { 
        error: '댓글을 작성할 수 없습니다.'
      },
      { status: 500 }
    );
  }
} 