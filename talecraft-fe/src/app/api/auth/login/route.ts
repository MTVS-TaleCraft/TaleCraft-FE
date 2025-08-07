import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    

    
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
    
    // 백엔드에서 설정한 쿠키를 그대로 전달
    const responseHeaders = new Headers();
    let hasSetCookie = false;
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // SameSite=Lax 설정 추가 (HTTP 환경에서 크로스 도메인 쿠키 전송을 위해)
        const modifiedCookie = value.replace(/; Secure/g, '; SameSite=Lax');
        responseHeaders.append('Set-Cookie', modifiedCookie);
        hasSetCookie = true;
      }
    });
    


    // Next.js에서 쿠키를 직접 설정
    const res = NextResponse.json(data, {
      status: response.status,
    });
    
    // 백엔드에서 받은 JWT 토큰을 쿠키로 설정
    if (data.token) {
      res.cookies.set('JwtToken', data.token, {
        httpOnly: true,
        secure: false, // HTTP 환경에서 쿠키 전송을 위해 false로 설정
        sameSite: 'lax',
        path: '/',
      });
    }
    
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 