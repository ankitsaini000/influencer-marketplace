"use client";

import {
  Home,
  Search,
  MessageSquare,
  Heart,
  User,
  Settings,
  LogOut,
  Menu,
  Star,
  LayoutDashboard,
  Briefcase,
  Edit2,
  Megaphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// import { checkUserRole } from '@/services/api';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const { logout, user, isAuthenticated, checkUserRole } = useAuth();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Redirect to login if not authenticated on dashboard pages
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      // Get current path
      const path = window.location.pathname;
      
      // Check if we're on a protected route
      const isProtectedRoute = 
        path.includes('/dashboard') || 
        path.includes('/creator-dashboard') || 
        path.includes('/brand-dashboard') ||
        path.includes('/profile') ||
        path.includes('/settings') ||
        path.includes('/messages');
      
      // Only redirect if we're on a protected route and not already on login/register
      if (isProtectedRoute && 
          !path.includes('/login') && 
          !path.includes('/register')) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  // Check user account type directly from backend
  useEffect(() => {
    const determineUserRole = async () => {
      setIsRoleLoading(true);
      try {
        if (!isAuthenticated) {
          console.log('User not authenticated, cannot determine role');
          setIsCreator(false);
          setIsBrand(false);
          setIsRoleLoading(false);
          return;
        }
        
        console.log('Checking user role directly from backend...');
        const role = await checkUserRole();
        console.log('Role determined from backend:', role);
        
        if (role === 'creator') {
          console.log('Setting role as creator');
          setIsCreator(true);
          setIsBrand(false);
        } else if (role === 'brand') {
          console.log('Setting role as brand');
          setIsBrand(true);
          setIsCreator(false);
        } else {
          console.log('No specific role found or role is client/user');
          setIsCreator(false);
          setIsBrand(false);
        }
      } catch (error) {
        console.error('Error determining user role:', error);
        // Fall back to localStorage as a last resort
        checkLocalStorageRoles();
      } finally {
        setIsRoleLoading(false);
      }
    };
    
    const checkLocalStorageRoles = () => {
      if (typeof window !== 'undefined') {
        try {
          // First check for explicit role indicators
          const userRole = localStorage.getItem('userRole');
          const isCreatorRole = userRole === 'creator';
          const isBrandRole = userRole === 'brand';
          
          // Log the initial role check
          console.log('Initial role check:', { userRole, isCreatorRole, isBrandRole });
          
          // Then check additional creator indicators
          const hasCreatorProfile = localStorage.getItem('creator_profile_exists') === 'true';
          const justPublished = localStorage.getItem('just_published') === 'true';
          const creatorUsername = localStorage.getItem('username');
          
          // And brand indicators
          const brandIndicator = localStorage.getItem('is_brand') === 'true';
          const brandAccountType = localStorage.getItem('account_type') === 'brand';
          const brandName = localStorage.getItem('brandName');
          
          // Check stored user data as a final fallback
          let userDataRole = null;
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              userDataRole = parsedUser.role;
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
          
          // Determine account types with clear precedence
          // Priority: explicit role > specific indicators > user data
          
          // Is this a brand?
          const brandStatus = isBrandRole || brandIndicator || brandAccountType || userDataRole === 'brand';
          setIsBrand(brandStatus);
          
          // Is this a creator? (and not a brand)
          const creatorStatus = !brandStatus && (
            isCreatorRole || 
            hasCreatorProfile || 
            justPublished || 
            (creatorUsername && creatorUsername.length > 0) ||
            userDataRole === 'creator'
          );
          setIsCreator(creatorStatus);
          
          // Extensive logging for debugging
          console.log('Account status determination:', { 
            // Creator indicators
            hasCreatorProfile,
            justPublished,
            creatorUsername,
            isCreatorRole,
            // Brand indicators
            brandIndicator,
            brandAccountType, 
            brandName,
            isBrandRole,
            // User data
            userDataRole,
            // Final determination
            isBrand: brandStatus,
            isCreator: creatorStatus 
          });
        } catch (error) {
          console.error('Error checking account type:', error);
        }
      }
    };
    
    // Only run this when authenticated status changes
    determineUserRole();
  }, [isAuthenticated, checkUserRole]);

  // Get user data from localStorage or API for profile display
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        try {
          setIsUserDataLoading(true);
          
          // Check if user is logged in from auth context
          if (!isAuthenticated || !user) {
            console.log('User not authenticated, showing guest info');
            setUserName("Guest");
            setUserEmail("guest@gmail.com");
            setIsUserDataLoading(false);
            return;
          }
          
          // We have authenticated user from context
          console.log('User authenticated, loading profile data', user);
          
          // Set data from user context
          if (user.fullName) {
            setUserName(user.fullName);
          } else if (user.email) {
            setUserName(user.email.split('@')[0]);
          }
          
          if (user.email) {
            setUserEmail(user.email);
          }
          
          // Try to fetch more complete user data if needed
          if (!user.fullName) {
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  if (userData.fullName) {
                    setUserName(userData.fullName);
                    localStorage.setItem('fullName', userData.fullName);
                  }
                  if (userData.email) {
                    setUserEmail(userData.email);
                    localStorage.setItem('email', userData.email);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsUserDataLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Redirect to login page
    router.push("/login");
  };

  const getCreatorProfileUrl = () => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      
      if (username) {
        return `/creator/${username}`;
      }
    }
    
    // Fallback to dashboard
    return '/creator-dashboard';
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Find Creators", href: "/find-creators", icon: Search },
    { name: "Available Promotions", href: "/available-promotions", icon: Megaphone },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Likes", href: "/liked-creators", icon: Heart },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar - Desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center py-6 mb-8 border-b border-gray-100">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-semibold text-purple-600">Influencer</span>
              <span className="text-2xl font-semibold text-gray-900">Market</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <ul className="space-y-4 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-100 group ${
                      pathname === item.href ? "text-purple-600" : "text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="ml-5 text-base">{item.name}</span>
                  </Link>
                </li>
              );
            })}
            {isRoleLoading ? (
              <li className="pt-2">
                <div className="h-12 bg-gray-200 rounded animate-pulse mt-4"></div>
              </li>
            ) : (
              <>
                <li className="pt-2">
                  {/* Show appropriate dashboard link based on account type */}
                  {isBrand ? (
                    <Link
                      href="/brand-dashboard"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="ml-5 text-base">Brand Dashboard</span>
                    </Link>
                  ) : isCreator ? (
                    <Link
                      href="/creator-dashboard"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="ml-5 text-base">Creator Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href="/become-creator"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <Star className="w-5 h-5" />
                      <span className="ml-5 text-base">Become a Creator</span>
                    </Link>
                  )}
                </li>
              </>
            )}
          </ul>
          
          {/* User Profile at bottom */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {isAuthenticated && user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User avatar"
                    className="object-cover w-full h-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
              </div>
              <div className="flex-1 min-w-0">
                {isUserDataLoading ? (
                  <>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {isAuthenticated ? userName : "Guest"}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {isAuthenticated ? userEmail : "guest@gmail.com"}
                    </p>
                  </>
                )}
              </div>
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Sign in"
                >
                  <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">→</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:hidden">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-grow p-0">
          {children}
        </main>
      </div>
    </div>
  );
};
