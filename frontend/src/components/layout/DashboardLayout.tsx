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

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const { logout, user } = useAuth();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Check user account type
  useEffect(() => {
    setIsRoleLoading(true);
    
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
            // If we have user data but no explicit role set, set it now
            if (parsedUser.role && !userRole) {
              if (parsedUser.role === 'creator') {
                localStorage.setItem('userRole', 'creator');
                localStorage.setItem('creator_profile_exists', 'true');
                if (parsedUser.username || parsedUser.name) {
                  localStorage.setItem('username', parsedUser.username || 
                    parsedUser.name.toLowerCase().replace(/\s+/g, '_'));
                }
              } else if (parsedUser.role === 'brand') {
                localStorage.setItem('userRole', 'brand');
                localStorage.setItem('is_brand', 'true');
                localStorage.setItem('account_type', 'brand');
                if (parsedUser.name) {
                  localStorage.setItem('brandName', parsedUser.name);
                }
              }
            }
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
      } finally {
        setIsRoleLoading(false);
      }
    }
  }, []);

  // Get user data from localStorage or API for profile display
  useEffect(() => {
    const loadUserData = () => {
      if (typeof window !== 'undefined') {
        try {
          // First, try to get user data directly from localStorage (set during login/signup)
          const userFullName = localStorage.getItem('fullName');
          const userDisplayName = localStorage.getItem('displayName');
          const firstName = localStorage.getItem('firstName');
          const lastName = localStorage.getItem('lastName');
          const name = localStorage.getItem('name');
          const email = localStorage.getItem('email');
          
          // Set the name with priority order
          if (userFullName) {
            setUserName(userFullName);
          } else if (userDisplayName) {
            setUserName(userDisplayName);
          } else if (firstName && lastName) {
            setUserName(`${firstName} ${lastName}`);
          } else if (firstName) {
            setUserName(firstName);
          } else if (name) {
            setUserName(name);
          } else if (localStorage.getItem('username')) {
            setUserName(localStorage.getItem('username') || "User");
          }
          
          // Set the email if available
          if (email) {
            setUserEmail(email);
          }
          
          // Try to get user data from userData object in localStorage
          const userDataStr = localStorage.getItem('userData');
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              
              // If no name was found earlier, try from userData
              if (!userFullName && !userDisplayName && !firstName && !name) {
                if (userData.fullName) setUserName(userData.fullName);
                else if (userData.name) setUserName(userData.name);
                else if (userData.displayName) setUserName(userData.displayName);
                else if (userData.firstName && userData.lastName) 
                  setUserName(`${userData.firstName} ${userData.lastName}`);
                else if (userData.firstName) setUserName(userData.firstName);
                else if (userData.username) setUserName(userData.username);
              }
              
              // If no email was found earlier, try from userData
              if (!email && userData.email) {
                setUserEmail(userData.email);
              }
            } catch (e) {
              console.error('Error parsing userData:', e);
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
  }, []);

  const handleLogout = () => {
    // Clear all authentication related data
    if (typeof window !== 'undefined') {
      // Auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Creator-specific data
      localStorage.removeItem('creator_profile_exists');
      localStorage.removeItem('just_published');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      
      // Brand-specific data
      localStorage.removeItem('is_brand');
      localStorage.removeItem('account_type');
      localStorage.removeItem('brandName');
      
      // Any profile data with creator_ prefix
      const username = localStorage.getItem('username');
      if (username) {
        localStorage.removeItem(`creator_${username}`);
      }
      
      console.log('User logged out, all auth data cleared');
    }
    
    // Redirect to login page instead of home page
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
    { name: "Likes", href: "/likes", icon: Heart },
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
                {user?.avatar ? (
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
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
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
                      {userName}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
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
