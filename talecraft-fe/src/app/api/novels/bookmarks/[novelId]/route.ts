import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/novels/bookmarks/${novelId}`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Bookmark add API error:', error);
    return NextResponse.json(
      { 
        error: '북마크 추가에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8081'}/api/novels/bookmarks/${novelId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Bookmark delete API error:', error);
    return NextResponse.json(
      { 
        error: '북마크 삭제에 실패했습니다.'
      },
      { status: 500 }
    );
  }
} 