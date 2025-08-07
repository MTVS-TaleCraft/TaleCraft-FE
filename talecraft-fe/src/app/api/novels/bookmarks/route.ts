import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    
    console.log('북마크 목록 API 호출');
    console.log('쿠키:', cookies);
    
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/novels/bookmarks`;
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