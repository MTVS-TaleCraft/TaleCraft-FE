import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ novelId: string; tagName: string }> }
) {
  try {
    const { novelId, tagName } = await params;
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    
    const response = await fetch(`${backendUrl}/api/tags/novels/${novelId}/common/${encodeURIComponent(tagName)}`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error adding common tag:', error);
    return NextResponse.json(
      { error: '기본 태그 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 