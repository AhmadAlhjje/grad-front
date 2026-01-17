'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or login
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading fullScreen />
    </div>
  );
}
