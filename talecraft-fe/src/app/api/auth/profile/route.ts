import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      console.log('Profile API response not ok:', response.status);
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: response.status }
      );
    }

    // 응답 텍스트 확인
    const responseText = await response.text();
    
    // 빈 응답인 경우
    if (!responseText || responseText.trim() === '') {
      console.log('Profile API empty response');
      return NextResponse.json(
        { error: '사용자 정보를 불러올 수 없습니다.' },
        { status: 401 }
      );
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Profile API JSON parse error occurred');
      return NextResponse.json(
        { error: '사용자 정보 형식이 올바르지 않습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: '사용자 정보를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    // 응답 상태 확인
    if (!response.ok) {
      console.log('Profile update API response not ok:', response.status);
      return NextResponse.json(
        { error: '사용자 정보 업데이트에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 응답 텍스트 확인
    const responseText = await response.text();
    
    // 빈 응답인 경우
    if (!responseText || responseText.trim() === '') {
      console.log('Profile update API empty response');
      return NextResponse.json(
        { error: '사용자 정보 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Profile update API JSON parse error occurred');
      return NextResponse.json(
        { error: '사용자 정보 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: '사용자 정보 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || '/api/backend';
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      console.log('Logout API response not ok:', response.status);
      return NextResponse.json(
        { error: '로그아웃에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 응답 텍스트 확인
    const responseText = await response.text();
    
    // 빈 응답인 경우
    if (!responseText || responseText.trim() === '') {
      console.log('Logout API empty response');
      return NextResponse.json(
        { message: '로그아웃되었습니다.' },
        { status: 200 }
      );
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Logout API JSON parse error occurred');
      return NextResponse.json(
        { message: '로그아웃되었습니다.' },
        { status: 200 }
      );
    }

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
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 