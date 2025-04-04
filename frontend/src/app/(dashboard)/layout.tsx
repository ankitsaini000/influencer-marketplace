'use client';

import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect('/');
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
} 