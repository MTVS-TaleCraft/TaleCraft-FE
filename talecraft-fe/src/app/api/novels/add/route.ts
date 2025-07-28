import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.title || !body.summary) {
      return NextResponse.json(
        { error: '제목과 줄거리는 필수입니다.' },
        { status: 400 }
      );
    }

    // 쿠키에서 JWT 토큰 가져오기
    const token = request.cookies.get('jwt_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다. 로그인해주세요.' },
        { status: 401 }
      );
    }

    // 백엔드 서버로 요청 전달 (JWT 토큰 포함)
    const backendResponse = await fetch('http://localhost:8081/api/novels/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          message: '작품이 성공적으로 생성되었습니다.',
          novel: backendData 
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: backendData.message || '작품 생성에 실패했습니다.' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('작품 생성 오류:', error);
    return NextResponse.json(
      { error: '백엔드 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.' },
      { status: 500 }
    );
  }
} 