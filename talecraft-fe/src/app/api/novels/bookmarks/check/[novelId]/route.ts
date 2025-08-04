import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ novelId: string }> }
) {
  try {
    const { novelId } = await params;
    const cookies = request.headers.get('cookie');
    
    console.log('북마크 상태 확인 API 호출:', novelId);
    console.log('쿠키:', cookies);
    console.log('모든 헤더:', Object.fromEntries(request.headers.entries()));
    
    const backendUrl = `${process.env.BACKEND_URL || '/api/backend'}/api/novels/bookmarks/check/${novelId}`;
    console.log('백엔드 URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('백엔드 응답 상태:', response.status);
    console.log('백엔드 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 오류 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('북마크 상태 데이터:', data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Bookmark check API error:', error);
    return NextResponse.json(
      { 
        error: '북마크 상태 확인에 실패했습니다.',
        isBookmarked: false
      },
      { status: 500 }
    );
  }
} 