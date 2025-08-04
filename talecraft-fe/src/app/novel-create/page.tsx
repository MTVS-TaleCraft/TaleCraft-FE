'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NovelCreateClient from '../components/NovelCreateClient';
import { checkAuthAndRedirect } from '@/utils/auth';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      await checkAuthAndRedirect(router);
    };
    
    initPage();
  }, [router]);

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <NovelCreateClient />
    </Suspense>
  );
}
