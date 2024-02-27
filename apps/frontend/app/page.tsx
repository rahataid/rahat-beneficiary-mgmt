'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paths } from '@/routes/paths';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.push(paths.auth.login);
  }, []);
}
