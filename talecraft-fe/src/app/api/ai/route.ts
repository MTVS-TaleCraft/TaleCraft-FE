import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = 'http://localhost:8080';
    const url = `${backendUrl}/api/ai`;
    
    // FormData를 백엔드로 전달
    const formData = await request.formData();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      body: formData,
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('JSON parse error:', responseText);
      return NextResponse.json(
        { error: '백엔드 응답을 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'AI 서비스에 연결할 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');
    const chatListId = searchParams.get('chatListId');
    
    if (!episodeId) {
      return NextResponse.json(
        { error: 'episodeId가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const backendUrl = 'http://localhost:8080';
    const url = `${backendUrl}/api/ai/${episodeId}?chatListId=${chatListId || ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('JSON parse error:', responseText);
      return NextResponse.json(
        { error: '백엔드 응답을 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AI GET API error:', error);
    return NextResponse.json(
      { error: 'AI 서비스에 연결할 수 없습니다.' },
      { status: 500 }
    );
  }
} 