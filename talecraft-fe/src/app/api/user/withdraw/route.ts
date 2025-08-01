import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/user/withdraw`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    
    // 백엔드에서 설정한 쿠키를 그대로 전달
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append('Set-Cookie', value);
      }
    });

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Withdraw API error:', error);
    return NextResponse.json(
      { error: '회원 탈퇴 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 