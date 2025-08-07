import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const { novelId } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/reports/novels/${novelId}/count`, {
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
    console.error('Novel report count API error:', error);
    return NextResponse.json(
      { 
        error: '신고 수를 불러올 수 없습니다.',
        count: 0
      },
      { status: 500 }
    );
  }
} 