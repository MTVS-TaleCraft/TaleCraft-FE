// src/app/novel-create/page.tsx

import { Suspense } from 'react';
import NovelCreateClient from '../components/NovelCreateClient';

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <NovelCreateClient />
    </Suspense>
  );
}
