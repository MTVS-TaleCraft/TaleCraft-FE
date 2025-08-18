import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagName = searchParams.get('tagName');
    
    if (!tagName) {
      return NextResponse.json(
        { error: '태그 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    // 서버 사이드에서는 절대 URL 사용
    const url = `http://localhost:8080/api/tags/search/novels?tagName=${encodeURIComponent(tagName)}`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Backend response not ok:', response.status);
      return NextResponse.json(
        { error: '백엔드에서 태그 검색에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching novels by tag:', error);
    return NextResponse.json(
      { error: '태그로 소설 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
