'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Create a loading component with similar structure to avoid layout shift
const LoadingComponent = () => (
  <div className="min-h-screen">
    <div>Loading...</div>
  </div>
);

const ProfilePage = dynamic(
  () => import('@/components/pages/ProfilePage').then(mod => mod.ProfilePage),
  { 
    ssr: false,
    loading: () => <LoadingComponent />
  }
);

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingComponent />;
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <ProfilePage />
    </Suspense>
  );
}

