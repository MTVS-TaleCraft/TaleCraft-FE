import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('로그인 API 호출 - 백엔드로 요청 전송');
    
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('백엔드 응답 상태:', response.status);
    console.log('백엔드 응답 데이터:', data);
    
    // 백엔드에서 설정한 쿠키를 그대로 전달
    const responseHeaders = new Headers();
    let hasSetCookie = false;
    
    response.headers.forEach((value, key) => {
      console.log('백엔드 응답 헤더:', key, value);
      if (key.toLowerCase() === 'set-cookie') {
        console.log('백엔드에서 받은 쿠키:', value);
        // SameSite=Lax 설정 추가 (HTTP 환경에서 크로스 도메인 쿠키 전송을 위해)
        const modifiedCookie = value.replace(/; Secure/g, '; SameSite=Lax');
        responseHeaders.append('Set-Cookie', modifiedCookie);
        hasSetCookie = true;
      }
    });
    
    if (!hasSetCookie) {
      console.log('백엔드에서 Set-Cookie 헤더를 받지 못함');
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 