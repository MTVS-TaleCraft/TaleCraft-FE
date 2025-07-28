import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.userId || !body.password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 백엔드 서버로 로그인 요청 전달
    const backendResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok) {
      // JWT 토큰을 쿠키에 저장
      const response = NextResponse.json(
        { 
          message: '로그인이 성공적으로 완료되었습니다.',
          user: backendData.user 
        },
        { status: 200 }
      );

      // JWT 토큰을 httpOnly 쿠키로 설정
      response.cookies.set('jwt_token', backendData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      return response;
    } else {
      return NextResponse.json(
        { error: backendData.message || '로그인에 실패했습니다.' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '백엔드 서버 연결에 실패했습니다.' },
      { status: 500 }
    );
  }
} 