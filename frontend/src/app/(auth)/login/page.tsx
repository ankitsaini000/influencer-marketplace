'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, setCreatorStatus, setBrandStatus, getCreatorByUsername } from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
          
          if (response.user.role === "creator") {
            console.log("Creator account detected, setting up creator role");
            
            setCreatorStatus(false);
            
            let username = '';
            
            if (response.user.username) {
              username = response.user.username;
              localStorage.setItem("username", username);
            } else if (response.user.name) {
              username = response.user.name.toLowerCase().replace(/\s+/g, '_');
              localStorage.setItem("username", username);
              console.log(`Generated username: ${username} from name: ${response.user.name}`);
            }
            
            if (username) {
              try {
                console.log(`Checking if profile exists for ${username}`);
                const { data: creatorData } = await getCreatorByUsername(username);
                
                if (creatorData) {
                  console.log("Creator profile found, marking as published");
                  localStorage.setItem(`creator_${username}`, JSON.stringify(creatorData));
                  localStorage.setItem('creator_profile_exists', 'true');
                  localStorage.setItem('just_published', 'true');
                } else {
                  console.log("No profile data found - new creator account");
                  localStorage.removeItem('creator_profile_exists');
                  localStorage.removeItem('just_published');
                }
              } catch (profileError) {
                console.error("Error checking creator profile:", profileError);
                localStorage.removeItem('creator_profile_exists');
                localStorage.removeItem('just_published');
              }
            }
            
            router.push("/creator-dashboard");
            return;
          } else if (response.user.role === "brand") {
            console.log("Brand account detected");
            setBrandStatus();
            
            if (response.user.name) {
              localStorage.setItem("brandName", response.user.name);
            }
            
            router.push("/brand-dashboard");
            return;
          }
        }
        
        router.push("/dashboard");
      } else {
        setError("Invalid login response");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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