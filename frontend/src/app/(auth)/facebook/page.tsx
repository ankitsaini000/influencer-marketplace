'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FacebookLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to initiate Facebook login
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend to get the Facebook auth URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/facebook/login`);
      const data = await response.json();
      
      if (data.redirectUrl) {
        // Redirect to Facebook login page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Failed to get Facebook login URL');
      }
    } catch (err: any) {
      console.error('Facebook login error:', err);
      setError(err.message || 'Failed to initiate Facebook login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login with Facebook</h1>
          <p className="mt-2 text-gray-600">
            Securely log in to your account using your Facebook credentials.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center">
              {/* Facebook Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 w-6 mr-2"
                fill="white"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {loading ? 'Connecting...' : 'Continue with Facebook'}
            </div>
          </button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 