import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import EpisodeCreateClient from '../components/EpisodeCreateClient';

export default function Page() {
  return (
    <Suspense fallback={<div>페이지 불러오는 중...</div>}>
      <EpisodeCreateClient />
    </Suspense>
  );
}
