// 쿠키 관리 유틸리티 함수들

export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;domain=localhost`;
  console.log('쿠키 설정됨:', name, value);
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    console.log('document가 정의되지 않음 (서버 사이드)');
    return null;
  }
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  console.log('현재 모든 쿠키:', document.cookie);
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      console.log('쿠키 찾음:', name, value);
      return value;
    }
  }
  console.log('쿠키를 찾을 수 없음:', name);
  return null;
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost`;
  console.log('쿠키 제거됨:', name);
};

export const getAuthToken = (): string | null => {
  const token = getCookie('JwtToken');
  console.log('인증 토큰 읽기:', token ? '토큰 존재' : '토큰 없음');
  return token;
};

export const setAuthToken = (token: string) => {
  setCookie('JwtToken', token, 7); // 7일간 유효
};

export const removeAuthToken = () => {
  removeCookie('JwtToken');
}; 