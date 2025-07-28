import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const novelId = params.id;

    // 쿠키에서 JWT 토큰 가져오기
    const token = request.cookies.get('jwt_token')?.value;

    // 백엔드 서버로 작품 상세 요청 전달 (JWT 토큰 포함)
    const backendResponse = await fetch(`http://localhost:8081/api/novels/${novelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json(backendData, { status: 200 });
    } else {
      return NextResponse.json(
        { error: backendData.message || '작품 상세 정보를 가져오는데 실패했습니다.' },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error('작품 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '백엔드 서버 연결에 실패했습니다.' },
      { status: 500 }
    );
  }
} 