import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">TaleCraft</h1>
        <p className="text-xl text-gray-600 mb-8">소설과 이야기의 새로운 세계</p>
        
        <div className="space-y-4">
          <Link href="/test">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
              Test 페이지 보기
            </button>
          </Link>
          
          <Link href="/auth-test">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
              인증 테스트
            </button>
          </Link>
          
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/novel-list" className="text-blue-600 hover:text-blue-800">
              작품 목록
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/novel/1" className="text-purple-600 hover:text-purple-800">
              작품 상세
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
