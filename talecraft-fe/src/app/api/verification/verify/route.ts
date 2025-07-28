import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code || !email) {
      return NextResponse.json(
        { error: '인증 코드와 이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/verification/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, email }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.error || '이메일 인증에 실패했습니다.' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Email verification API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 