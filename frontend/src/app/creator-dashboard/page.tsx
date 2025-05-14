"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { LayoutDashboard, Users, FileText, Settings, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";

// Import components from new locations
import DashboardMetrics from "../../components/creator-dashboard/DashboardMetrics";
import PerformanceStats from "../../components/creator-dashboard/PerformanceStats";
import OrdersList from "../../components/creator-dashboard/OrdersList";
import RevenueBreakdown from "../../components/creator-dashboard/RevenueBreakdown";
import AccountSettings from "../../components/creator-dashboard/AccountSettings";
import SocialMediaFollowers from "../../components/creator-dashboard/SocialMediaFollowers";
import { fetchCreatorProfile, fetchDashboardMetrics } from "../../services/creatorDashboardApi";

export default function CreatorDashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced state for creator metrics with new fields
  const [creatorMetrics, setCreatorMetrics] = useState({
    followers: 28750,
    totalEarnings: 24570,
    completedProjects: 37,
    responseRate: 97,
    tierProgress: 73,
    profileViews: 0,
    totalSocialFollowers: 0,
    profileCompleteness: 85,
    ratings: {
      average: 4.8,
      count: 32
    }
  });

  // Added state for creator profile with social media info
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [socialMediaLoading, setSocialMediaLoading] = useState(true);
  
  // Enhanced performance data with more detailed analytics
  const [performanceData, setPerformanceData] = useState({
    views: [125, 156, 134, 189, 210, 245, 232, 278, 264, 301, 343, 312, 356, 380, 412, 445, 429, 476, 498, 512, 535, 563, 542, 587, 612, 635, 658, 680, 663, 698],
    likes: [24, 32, 28, 45, 52, 67, 58, 72, 69, 84, 92, 88, 97, 103, 112, 124, 118, 136, 142, 153, 147, 158, 152, 167, 178, 184, 192, 201, 195, 213],
    messages: [5, 8, 6, 11, 14, 17, 15, 19, 18, 22, 25, 23, 27, 30, 33, 35, 32, 37, 39, 42, 40, 43, 41, 46, 48, 51, 53, 56, 54, 59],
    earnings: [120, 160, 140, 220, 260, 320, 280, 340, 320, 400, 440, 420, 480, 520, 560, 620, 580, 660, 700, 740, 710, 780, 750, 820, 860, 900, 940, 980, 920, 1020],
    dates: Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    })
  });
  
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'Primary Account', bank: 'Chase Bank', number: '****3456', isDefault: true },
  ]);
  
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      senderName: 'Alex Johnson', 
      senderImg: null, 
      date: '2023-05-18', 
      preview: "Hi, I'm interested in working with you on...",
      unread: true
    },
    { 
      id: 2, 
      senderName: 'Sarah Williams', 
      senderImg: null, 
      date: '2023-05-17', 
      preview: "Thanks for the quick response! I'd like to...",
      unread: true
    },
    { 
      id: 3, 
      senderName: 'David Rodriguez', 
      senderImg: null, 
      date: '2023-05-16', 
      preview: "The completed project looks amazing! I...",
      unread: false
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-2023-156',
      clientName: 'Rexon Media Group',
      date: '2023-05-10',
      service: 'Instagram Campaign',
      status: 'completed' as const,
      amount: 850,
      platform: 'Instagram',
      promotionType: 'Product Launch',
      deliveryDate: '2023-05-18',
      description: 'A series of Instagram posts and stories promoting the new product launch for Rexon Media Group.',
      clientFeedback: 'Excellent work! The campaign exceeded our expectations.',
      deliverables: ['Instagram post', 'Story highlight', 'Instagram reel']
    }
  ]);
  
  const [promotionRevenueData, setPromotionRevenueData] = useState([
    { type: 'Product Launch', amount: 8550, color: 'purple' },
    { type: 'Brand Awareness', amount: 6720, color: 'indigo' },
    { type: 'Product Review', amount: 12480, color: 'blue' },
    { type: 'Seasonal Campaign', amount: 4250, color: 'pink' },
    { type: 'Influencer Takeover', amount: 3800, color: 'orange' }
  ]);
  
  // Function to handle adding a bank account
  const handleAddBankAccount = (accountData: any) => {
    const newAccount = {
      id: bankAccounts.length + 1,
      name: accountData.name,
      bank: accountData.bank,
      number: '*****' + accountData.accountNumber.slice(-4),
      isDefault: accountData.isDefault || bankAccounts.length === 0
    };
    
    const updatedAccounts = [...bankAccounts];
    
    if (newAccount.isDefault) {
      updatedAccounts.forEach(acc => acc.isDefault = false);
    }
    
    setBankAccounts([...updatedAccounts, newAccount]);
  };
  
  // Handle API response errors with appropriate messages
  const handleApiError = (status: number, message: string) => {
    let errorMsg = '';
    
    switch (status) {
      case 401:
        errorMsg = 'Authentication failed. Please log in again.';
        // Optionally redirect to login page
        break;
      case 403:
        errorMsg = 'You do not have permission to access this data.';
        break;
      case 404:
        errorMsg = 'Dashboard data not found. You may need to complete your profile first.';
        break;
      case 500:
        errorMsg = 'Server error. Please try again later.';
        break;
      default:
        errorMsg = message || 'An error occurred while fetching data.';
    }
    
    setError(errorMsg);
    console.error(`API Error (${status}): ${errorMsg}`);
    return errorMsg;
  };

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      console.log('Fetching dashboard data from:', `${API_BASE_URL}/creators/dashboard`);
      
      const response = await fetch(`${API_BASE_URL}/creators/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle response errors with status codes
      if (!response.ok) {
        const errorMsg = handleApiError(response.status, `Failed to fetch data: ${response.status} ${response.statusText}`);
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      
      // Validate the received data format
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received from API');
      }
      
      console.log('✅ Dashboard data fetched successfully!');
      
      if (data && data.data) {
        // Update metrics with validation
        const dashboardData = data.data;
        
        if (dashboardData.metrics) {
          setCreatorMetrics({
            followers: Number(dashboardData.metrics.followers) || creatorMetrics.followers,
            totalEarnings: Number(dashboardData.metrics.totalEarnings) || creatorMetrics.totalEarnings,
            completedProjects: Number(dashboardData.metrics.completedProjects) || creatorMetrics.completedProjects,
            responseRate: Number(dashboardData.metrics.responseRate) || creatorMetrics.responseRate,
            tierProgress: Number(dashboardData.metrics.tierProgress) || creatorMetrics.tierProgress,
            profileViews: Number(dashboardData.metrics.profileViews) || creatorMetrics.profileViews,
            totalSocialFollowers: Number(dashboardData.metrics.totalSocialFollowers) || creatorMetrics.totalSocialFollowers,
            profileCompleteness: Number(dashboardData.metrics.profileCompleteness) || creatorMetrics.profileCompleteness,
            ratings: dashboardData.metrics.ratings || creatorMetrics.ratings
          });
          console.log('✅ Creator metrics updated successfully');
          
          // Generate realistic performance data based on metrics if performance data is provided
          if (dashboardData.performanceData) {
            setPerformanceData(dashboardData.performanceData);
            console.log('✅ Performance data updated from API');
          }
        } else {
          console.warn('Metrics data not found in API response');
        }
        
        // Update orders if available with validation
        if (dashboardData.orders && Array.isArray(dashboardData.orders)) {
          // Validate each order to ensure it has the required fields
          const validOrders = dashboardData.orders.filter((order: {
            id: string;
            clientName: string;
            date: string;
            service: string;
            status: string;
            amount: number;
            platform?: string;
            promotionType?: string;
            deliveryDate?: string;
            description?: string;
            clientFeedback?: string;
            deliverables?: string[];
          }) => {
            return order.id && order.clientName && order.date && 
                   order.service && order.status && typeof order.amount === 'number';
          }).map((order: {
            id: string;
            clientName: string;
            date: string;
            service: string;
            status: string;
            amount: number;
            platform?: string;
            promotionType?: string;
            deliveryDate?: string;
            description?: string;
            clientFeedback?: string;
            deliverables?: string[];
          }) => ({
            ...order,
            status: (order.status === 'completed' || 
                     order.status === 'pending' || 
                     order.status === 'in_progress' || 
                     order.status === 'delivered' || 
                     order.status === 'cancelled') ? order.status : 'pending'
          } as const));
          
          if (validOrders.length !== dashboardData.orders.length) {
            console.warn(`${dashboardData.orders.length - validOrders.length} orders were filtered out due to invalid format`);
          }
          
          if (validOrders.length > 0) {
            setOrders(validOrders);
            console.log(`✅ ${validOrders.length} orders updated successfully`);
          }
        } else {
          console.log('No orders data found in API response or data is not in array format');
        }
      } else {
        console.warn('Response data structure is not as expected');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error && typeof error === 'object') {
        if (!error.status && navigator.onLine === false) {
          setError('Network connection lost. Please check your internet connection.');
        } else if (!error.status) {
          setError('An unexpected error occurred. Please try again later.');
        }
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  // New function to fetch creator profile data with social media info
  const fetchCreatorProfileData = async () => {
    try {
      setSocialMediaLoading(true);
      const response = await fetchCreatorProfile();
      
      if (response && response.success && response.data) {
        setCreatorProfile(response.data);
        
        // Update creator metrics with profile data
        const socialMedia = response.data.socialMedia?.socialProfiles || {};
        let totalFollowers = 0;
        
        if (socialMedia.instagram?.followers) totalFollowers += socialMedia.instagram.followers;
        if (socialMedia.twitter?.followers) totalFollowers += socialMedia.twitter.followers;
        if (socialMedia.facebook?.followers) totalFollowers += socialMedia.facebook.followers;
        if (socialMedia.linkedin?.connections) totalFollowers += socialMedia.linkedin.connections;
        if (socialMedia.youtube?.subscribers) totalFollowers += socialMedia.youtube.subscribers;
        
        // Update metrics with social media data
        setCreatorMetrics(prev => ({
          ...prev,
          totalSocialFollowers: totalFollowers,
          profileViews: response.data.metrics?.profileViews || prev.profileViews
        }));
        
        console.log('✅ Creator profile with social media data loaded successfully');
        console.log(`✅ Total social media followers: ${totalFollowers}`);
      } else {
        console.warn('Invalid creator profile data structure received');
      }
    } catch (error: any) {
      console.error('Error fetching creator profile data:', error);
      setError('Failed to load social media data. Please try again later.');
    } finally {
      setSocialMediaLoading(false);
    }
  };
  
  // Effect to fetch user data
  useEffect(() => {
    const getUserData = () => {
      const userDataStr = localStorage.getItem('userData');
      
      if (!userDataStr) {
        console.warn('User data not found in local storage');
        return;
      }
      
      try {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.username) {
          setUsername(userData.username);
          console.log('✅ Username set from local storage:', userData.username);
        } else {
          console.warn('Username not found in user data');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    };
    
    getUserData();
  }, []);
  
  // Effect to fetch dashboard data on component mount
  useEffect(() => {
    // Set loading state
    setLoading(true);
    setError(null);
    setSocialMediaLoading(true);
    
    // Create a function to fetch all data
    const fetchAllData = async () => {
      try {
        // Fetch dashboard data
        await fetchDashboardData();
        
        // Fetch creator profile data with social media info
        await fetchCreatorProfileData();
        
        console.log('✅ All dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardMetrics metrics={creatorMetrics} />
            
            {/* Add Social Media Followers component */}
            {creatorProfile && (
              <SocialMediaFollowers 
                socialProfiles={creatorProfile.socialMedia?.socialProfiles} 
                loading={socialMediaLoading} 
              />
            )}
            
            <PerformanceStats performanceData={performanceData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueBreakdown promotionRevenueData={promotionRevenueData} />
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id}
                          className={`p-4 border rounded-lg ${message.unread ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {message.senderImg ? (
                                <img src={message.senderImg} alt={message.senderName} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                                  {message.senderName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {message.senderName}
                                {message.unread && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{message.preview}</p>
                              <p className="text-xs text-gray-400 mt-1">{message.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-3">
                        <Link
                          href="/messages"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          View all messages
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <OrdersList orders={orders} />
          </div>
        );
      case 'orders':
        return <OrdersList orders={orders} />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <PerformanceStats performanceData={performanceData} />
            <RevenueBreakdown promotionRevenueData={promotionRevenueData} />
          </div>
        );
      case 'settings':
        return <AccountSettings bankAccounts={bankAccounts} onAddBankAccount={handleAddBankAccount} />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <FileText className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {username || 'Creator'}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href="/messages"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Link>
            <Link
              href="/creator-profile-edit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start">
            <div className="text-red-600 mr-3 flex-shrink-0 pt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => {setError(null); setLoading(true); fetchDashboardData(); fetchCreatorProfileData().finally(() => setLoading(false));}}
                className="text-sm text-red-600 hover:text-red-800 mt-1 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
} 