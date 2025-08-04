'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthAndRedirect } from '@/utils/auth';

import EpisodeCreateClient from '../components/EpisodeCreateClient';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      await checkAuthAndRedirect(router);
    };
    
    initPage();
  }, [router]);

  return (
    <Suspense fallback={<div>페이지 불러오는 중...</div>}>
      <EpisodeCreateClient />
    </Suspense>
  );
}
