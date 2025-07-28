import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 백엔드 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/auth/find-userid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      // 백엔드에서 FindUserIdResponse 형태로 응답하므로 그대로 반환
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.error || '아이디 찾기에 실패했습니다.' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Find userid API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 