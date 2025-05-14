'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FacebookSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        if (!searchParams) {
          throw new Error('Search parameters not available');
        }
        
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No authentication token provided');
        }
        
        // Save token to localStorage or your auth context
        localStorage.setItem('authToken', token);
        
        // Get user info (optional)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user information');
        }
        
        const userData = await response.json();
        
        // Save user data if needed
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to dashboard or home page
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Facebook success handling error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleSuccess();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Login...</h1>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">We're getting your account ready.</p>
      </div>
    </div>
  );
} 