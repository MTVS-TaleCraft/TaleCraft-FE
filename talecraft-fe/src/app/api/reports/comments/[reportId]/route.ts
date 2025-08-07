import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/reports/comments/${reportId}`, {
      method: 'GET',
      credentials: 'include',
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
    console.error('Comment report detail API error:', error);
    return NextResponse.json(
      { 
        error: '댓글 신고 정보를 불러올 수 없습니다.'
      },
      { status: 500 }
    );
  }
} 