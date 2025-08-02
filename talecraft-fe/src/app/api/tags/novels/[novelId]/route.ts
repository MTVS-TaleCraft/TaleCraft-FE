import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const backendUrl = process.env.BACKEND_URL;
    
    const response = await fetch(`${backendUrl}/api/tags/novels/${novelId}`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: '태그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const backendUrl = process.env.BACKEND_URL;
    const body = await request.json();
    
    const response = await fetch(`${backendUrl}/api/tags/novels/${novelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error adding tags:', error);
    return NextResponse.json(
      { error: '태그 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 