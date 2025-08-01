import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/novels/my`, {
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
    console.error('My novels API error:', error);
    return NextResponse.json(
      { 
        error: '내 작품 목록을 불러올 수 없습니다.',
        novelList: [] 
      },
      { status: 500 }
    );
  }
} 