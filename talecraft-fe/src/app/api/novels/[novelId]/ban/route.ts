import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const { novelId } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/novels/${novelId}/ban`, {
      method: 'PATCH',
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
    console.error('Novel ban API error:', error);
    return NextResponse.json(
      { 
        error: '소설 차단/해제에 실패했습니다.'
      },
      { status: 500 }
    );
  }
} 