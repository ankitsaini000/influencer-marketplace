'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FacebookLoginButton from '@/components/FacebookLoginButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // Prevent navigation to login page if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'creator') {
        router.push('/creator-dashboard');
      } else if (userRole === 'brand') {
        router.push('/brand-dashboard');
      } else {
        // If role is not set, default to brand dashboard
        localStorage.setItem('userRole', 'brand');
        router.push('/brand-dashboard');
      }
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    
    try {
      await login(email, password);
      
      // Force a slight delay to allow state updates to complete
      setTimeout(() => {
        // Redirection based on role in localStorage
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'creator') {
          router.push('/creator-dashboard');
        } else if (userRole === 'brand') {
          router.push('/brand-dashboard');
        } else {
          // If role is not set, default to brand dashboard
          localStorage.setItem('userRole', 'brand');
          router.push('/brand-dashboard');
        }
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Specific handling for network-related errors
      if (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('Network Error') ||
          err.code === 'ERR_NETWORK' || 
          err.code === 'ERR_CONNECTION_REFUSED')) {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLoginError = (err: Error) => {
    setError(err.message || "Facebook login failed. Please try again.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div>
            <FacebookLoginButton 
              className="w-full"
              onLoginError={handleFacebookLoginError}
            />
          </div>
          
          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
} 