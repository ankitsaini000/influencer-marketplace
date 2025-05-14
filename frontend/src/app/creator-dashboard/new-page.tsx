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

export default function CreatorDashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for data
  const [creatorMetrics, setCreatorMetrics] = useState({
    followers: 28750,
    totalEarnings: 24570,
    completedProjects: 37,
    responseRate: 97,
    tierProgress: 73
  });
  
  const [performanceData, setPerformanceData] = useState({
    views: [125, 156, 134, 189, 210, 245, 232, 278, 264, 301, 343, 312, 356, 380],
    likes: [24, 32, 28, 45, 52, 67, 58, 72, 69, 84, 92, 88, 97, 103],
    messages: [5, 8, 6, 11, 14, 17, 15, 19, 18, 22, 25, 23, 27, 30],
    earnings: [120, 160, 140, 220, 260, 320, 280, 340, 320, 400, 440, 420, 480, 520]
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
      status: 'completed',
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
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(`${API_BASE_URL}/creators/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched dashboard data:', data);
      
      if (data && data.data) {
        // Update metrics and orders with the data
        const dashboardData = data.data;
        
        setCreatorMetrics({
          followers: dashboardData.metrics.followers || creatorMetrics.followers,
          totalEarnings: dashboardData.metrics.totalEarnings || creatorMetrics.totalEarnings,
          completedProjects: dashboardData.metrics.completedProjects || creatorMetrics.completedProjects,
          responseRate: dashboardData.metrics.responseRate || creatorMetrics.responseRate,
          tierProgress: dashboardData.metrics.tierProgress || creatorMetrics.tierProgress
        });
        
        // Update orders if available
        if (dashboardData.orders && Array.isArray(dashboardData.orders)) {
          setOrders(dashboardData.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Load user data and fetch dashboard data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get username from localStorage
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        // Try to extract username from user object
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const name = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : null);
            if (name) {
              setUsername(name);
              localStorage.setItem('username', name);
            }
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
      
      // Fetch dashboard data
      fetchDashboardData();
      
      setLoading(false);
    }
  }, []);

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardMetrics metrics={creatorMetrics} />
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
                    <div className="space-y-3">
                      {messages.map(message => (
                        <Link 
                          href="/messages" 
                          key={message.id}
                          className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center">
                                {message.senderImg ? (
                                  <img src={message.senderImg} alt={message.senderName} className="w-10 h-10 rounded-full" />
                                ) : (
                                  <span className="text-gray-600 font-semibold">{message.senderName.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <p className="font-medium text-gray-900 text-sm">{message.senderName}</p>
                                  {message.unread && (
                                    <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{message.preview}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(message.date).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Link href="/messages" className="text-sm text-blue-600 hover:text-blue-800">
                      View all messages
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No new notifications</p>
                  </div>
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
        return <div>Unknown tab</div>;
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