import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('value');
    const type = searchParams.get('type');
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    let url = `${backendUrl}/api/novels`;
    
    // 쿼리 파라미터가 있는 경우 추가
    if (keyword && type) {
      url += `?value=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}`;
    } else if (keyword) {
      url += `?value=${encodeURIComponent(keyword)}`;
    } else if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: '소설 목록을 불러올 수 없습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Novels API error:', error);
    return NextResponse.json(
      { error: '소설 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
} 