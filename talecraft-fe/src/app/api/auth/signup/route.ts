import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.userId || !body.password || !body.nickname) {
      return NextResponse.json(
        { error: '아이디, 비밀번호, 닉네임은 필수입니다.' },
        { status: 400 }
      );
    }

    // 백엔드 서버로 회원가입 요청 전달
    const backendResponse = await fetch('http://localhost:8081/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          message: '회원가입이 성공적으로 완료되었습니다.',
          user: backendData 
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: backendData.message || '회원가입에 실패했습니다.' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { error: '백엔드 서버 연결에 실패했습니다.' },
      { status: 500 }
    );
  }
} 