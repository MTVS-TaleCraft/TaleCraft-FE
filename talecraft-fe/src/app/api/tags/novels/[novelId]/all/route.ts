import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const backendUrl = process.env.BACKEND_URL;
    
    const response = await fetch(`${backendUrl}/api/tags/novels/${novelId}/all`, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting all tags:', error);
    return NextResponse.json(
      { error: '태그 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 