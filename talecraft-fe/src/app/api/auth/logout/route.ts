import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 백엔드에 로그아웃 요청
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // 응답 객체 생성
    const res = NextResponse.json({ message: '로그아웃 성공' });
    
    // JwtToken 쿠키 제거 (실제 사용하는 쿠키명)
    res.cookies.set('JwtToken', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // 즉시 만료
      path: '/',
    });
    
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}