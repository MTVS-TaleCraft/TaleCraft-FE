import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    console.log('Backend URL:', backendUrl);
    
    const url = `${backendUrl}/api/tags/default`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // 응답 텍스트를 먼저 확인
    const responseText = await response.text();
    console.log('Response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Response data:', data);
    } catch {
      console.error('JSON parse error occurred');
      console.error('Response text was:', responseText);
      return NextResponse.json(
        { error: '백엔드 응답을 파싱할 수 없습니다.', responseText },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching default tags:', error);
    return NextResponse.json(
      { error: '기본 태그 조회 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 