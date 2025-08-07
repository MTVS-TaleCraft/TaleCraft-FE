import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/reports/${reportId}/view`, {
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
    console.error('Report view status API error:', error);
    return NextResponse.json(
      { 
        error: '신고 조회 상태 변경에 실패했습니다.'
      },
      { status: 500 }
    );
  }
} 