import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = 'http://localhost:8080';
    const url = `${backendUrl}/api/novels/bookmarks`;
    
    console.log('북마크 목록 API 호출');
    console.log('쿠키:', request.headers.get('cookie'));
    
    console.log('백엔드 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
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
    console.log('북마크 목록 데이터:', data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Bookmark list API error:', error);
    return NextResponse.json(
      { 
        error: '북마크 목록을 불러오는데 실패했습니다.',
        bookmarkList: []
      },
      { status: 500 }
    );
  }
} 