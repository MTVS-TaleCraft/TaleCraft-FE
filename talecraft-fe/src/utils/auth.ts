import { getAuthToken } from './cookies';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const checkAuthAndRedirect = async (router: AppRouterInstance) => {
  try {
    console.log('인증 상태 확인 시작...');
    
    // 백엔드 API를 통해 인증 상태 확인
    const response = await fetch('http://localhost:8081/api/auth/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('인증 응답 상태:', response.status);

    // 200 OK인 경우 인증 성공
    if (response.ok) {
      try {
        const responseData = await response.json();
        console.log('인증 성공 - 사용자 정보:', responseData);
        return true;
      } catch {
        console.log('응답 파싱 실패, 하지만 상태 코드는 OK');
        return true;
      }
    }

    // 401 Unauthorized 또는 403 Forbidden인 경우
    if (response.status === 401 || response.status === 403) {
      console.log('인증 실패 - 401/403 상태 코드');
      router.push('/error');
      return false;
    }

    // 기타 에러
    console.log('인증 실패 - 기타 에러');
    router.push('/error');
    return false;
    
  } catch (error) {
    console.error('인증 확인 실패 (네트워크 에러):', error);
    
    // 네트워크 에러의 경우 (백엔드 서버가 실행되지 않았을 수 있음)
    // 개발 환경에서는 일단 통과시킴
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경에서 네트워크 에러 발생, 일단 통과');
      return true;
    }
    
    router.push('/error');
    return false;
  }
}; 