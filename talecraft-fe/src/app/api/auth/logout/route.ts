import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 백엔드에 로그아웃 요청
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // 응답 객체 생성
    const res = NextResponse.json({ message: '로그아웃 성공' });
    
    // 백엔드에서 설정한 쿠키를 그대로 전달
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        res.headers.append('Set-Cookie', value);
      }
    });
    
    // JWT 토큰 쿠키 제거 (백엔드와 동일한 이름 사용)
    res.cookies.set('JwtToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 즉시 만료
      path: '/',
    });
    
    return res;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}