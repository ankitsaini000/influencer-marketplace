"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { 
  LayoutDashboard, Users, FileText, Settings, Star, 
  TrendingUp, CreditCard, MessageSquare, BarChart2, 
  DollarSign, ThumbsUp, Eye, Clock, ChevronDown,
  Mail, Calendar, CheckCircle, AlertCircle, User,
  Award, Zap, Crown, BadgeCheck, Target, TrendingDown,
  Package, ShoppingBag, Filter, ChevronRight, Plus, X,
  Globe, Pencil, Trash2, ArrowDownLeft, ArrowUpRight,
  ChevronLeft, Flag, MousePointer, ShoppingCart, Search,
  RefreshCw, Phone, Video, MoreVertical, Paperclip, Send,
  Bell, Smartphone,
  Copy
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Simple Chart component
const PerformanceChart = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data) || 1;
  const height = 100;

  return (
    <div className="flex items-end h-[100px] gap-1 w-full">
      {data.map((value, i) => (
        <div 
          key={i} 
          className="flex-1"
          style={{
            height: `${(value / max) * height}px`,
            backgroundColor: color,
            minWidth: '8px',
            borderRadius: '3px'
          }}
        />
      ))}
    </div>
  );
};

export default function CreatorDashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Creator metrics data
  const [creatorMetrics, setCreatorMetrics] = useState({
    followers: 28750,
    totalEarnings: 24570,
    completedProjects: 37,
    responseRate: 97,
    tierProgress: 73 // percentage to next tier
  });
  
  // Calculate influencer tier based on followers
  const getInfluencerTier = (followers: number) => {
    if (followers < 10000) return { name: 'Nano Influencer', icon: <Users className="w-5 h-5 text-blue-500" />, color: 'blue' };
    if (followers < 50000) return { name: 'Micro Influencer', icon: <Award className="w-5 h-5 text-indigo-500" />, color: 'indigo' };
    if (followers < 500000) return { name: 'Macro Influencer', icon: <Zap className="w-5 h-5 text-purple-500" />, color: 'purple' };
    if (followers < 1000000) return { name: 'Mega Influencer', icon: <Crown className="w-5 h-5 text-yellow-500" />, color: 'yellow' };
    return { name: 'Celebrity Influencer', icon: <BadgeCheck className="w-5 h-5 text-red-500" />, color: 'red' };
  };
  
  // Calculate service tier based on completed projects and earnings
  const getServiceTier = (completedProjects: number, earnings: number) => {
    if (completedProjects < 10 || earnings < 5000) {
      return { 
        name: 'Rising Star', 
        level: 1,
        icon: <Target className="w-5 h-5 text-emerald-500" />, 
        color: 'emerald',
        benefits: ['Basic analytics', 'Standard promotion', 'Basic support']
      };
    }
    if (completedProjects < 30 || earnings < 20000) {
      return { 
        name: 'Established Creator', 
        level: 2,
        icon: <TrendingUp className="w-5 h-5 text-orange-500" />, 
        color: 'orange',
        benefits: ['Advanced analytics', 'Preferred promotion', 'Priority support', 'Early access features']
      };
    }
    return { 
      name: 'Elite Creator', 
      level: 3,
      icon: <Crown className="w-5 h-5 text-purple-500" />, 
      color: 'purple',
      benefits: ['Premium analytics', 'Featured promotion', 'Dedicated support', 'Custom branding options', 'Exclusive networking events']
    };
  };
  
  // Get current tiers
  const influencerTier = getInfluencerTier(creatorMetrics.followers);
  const serviceTier = getServiceTier(creatorMetrics.completedProjects, creatorMetrics.totalEarnings);
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Mock data for dashboard
  const [performanceData, setPerformanceData] = useState({
    views: [125, 156, 134, 189, 210, 245, 232, 278, 264, 301, 343, 312, 356, 380],
    likes: [24, 32, 28, 45, 52, 67, 58, 72, 69, 84, 92, 88, 97, 103],
    messages: [5, 8, 6, 11, 14, 17, 15, 19, 18, 22, 25, 23, 27, 30],
    earnings: [120, 160, 140, 220, 260, 320, 280, 340, 320, 400, 440, 420, 480, 520]
  });
  
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'Primary Account', bank: 'Chase Bank', number: '****3456', isDefault: true },
  ]);
  
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      clientName: 'Jennifer Smith', 
      clientImg: null, 
      rating: 5, 
      date: '2023-05-15', 
      comment: 'Excellent work! Delivered exactly what I needed ahead of schedule.',
      project: 'Instagram Ad Campaign'
    },
    { 
      id: 2, 
      clientName: 'Michael Brown', 
      clientImg: null, 
      rating: 4, 
      date: '2023-04-28', 
      comment: 'Great communication and quality work. Will hire again!',
      project: 'YouTube Promotion'
    },
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

  const [showBankForm, setShowBankForm] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    isDefault: false
  });
  
  // Orders state
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
      clientFeedback: 'Excellent work! The campaign exceeded our expectations and we saw a 30% increase in engagement.',
      deliverables: [
        'Instagram feed post with product showcase',
        'Instagram story highlight with product features',
        'Instagram reel demonstrating product usage'
      ],
      metrics: {
        impressions: 12500,
        engagement: 2340,
        clicks: 875,
        conversion: 320
      }
    },
    {
      id: 'ORD-2023-142',
      clientName: 'Green Valley Brands',
      date: '2023-04-25',
      service: 'TikTok Content Series',
      status: 'completed',
      amount: 1250,
      platform: 'TikTok',
      promotionType: 'Brand Awareness',
      deliveryDate: '2023-05-02',
      description: 'A series of TikTok videos to increase brand awareness for Green Valley Brands.',
      clientFeedback: 'Love your creativity! Our brand recognition definitely improved.',
      deliverables: [
        'TikTok trend video featuring brand',
        'Day-in-the-life video using products',
        'TikTok challenge with branded hashtag'
      ],
      metrics: {
        impressions: 35000,
        engagement: 5600,
        clicks: 1200,
        conversion: 450
      }
    },
    {
      id: 'ORD-2023-137',
      clientName: 'Modern Living Co.',
      date: '2023-04-15',
      service: 'YouTube Product Review',
      status: 'completed',
      amount: 1600,
      platform: 'YouTube',
      promotionType: 'Product Review',
      deliveryDate: '2023-04-26'
    },
    {
      id: 'ORD-2023-129',
      clientName: 'Fitness First',
      date: '2023-04-05',
      service: 'Instagram Story Series',
      status: 'completed',
      amount: 950,
      platform: 'Instagram',
      promotionType: 'Seasonal Campaign',
      deliveryDate: '2023-04-10'
    },
    {
      id: 'ORD-2023-118',
      clientName: 'Tech Innovations Inc.',
      date: '2023-03-22',
      service: 'YouTube Unboxing',
      status: 'completed',
      amount: 1400,
      platform: 'YouTube',
      promotionType: 'Product Review',
      deliveryDate: '2023-03-30'
    }
  ]);
  
  // Promotion revenue data
  const [promotionRevenueData, setPromotionRevenueData] = useState([
    { type: 'Product Launch', amount: 8550, color: 'purple' },
    { type: 'Brand Awareness', amount: 6720, color: 'indigo' },
    { type: 'Product Review', amount: 12480, color: 'blue' },
    { type: 'Seasonal Campaign', amount: 4250, color: 'pink' },
    { type: 'Influencer Takeover', amount: 3800, color: 'orange' }
  ]);

  // Calculate promotion type revenue from orders
  const calculatePromotionRevenue = () => {
    const revenueByPromotion: Record<string, number> = {};
    orders.forEach(order => {
      if (!revenueByPromotion[order.promotionType]) {
        revenueByPromotion[order.promotionType] = 0;
      }
      revenueByPromotion[order.promotionType] += order.amount;
    });
    return revenueByPromotion;
  };

  // Get promotion color
  const getPromotionColor = (promotionType: string) => {
    const promotion = promotionRevenueData.find(p => p.type === promotionType);
    return promotion ? promotion.color : 'gray';
  };

  // Function to add a new bank account
  const handleAddBankAccount = () => {
    // Simple validation check
    if (!newBankAccount.name || !newBankAccount.bank || !newBankAccount.accountNumber || !newBankAccount.routingNumber) {
      alert('Please fill all required fields');
      return;
    }
    
    // Create new account with random ID
    const newAccount = {
      id: bankAccounts.length + 1,
      name: newBankAccount.name,
      bank: newBankAccount.bank,
      number: '*****' + newBankAccount.accountNumber.slice(-4),
      isDefault: newBankAccount.isDefault || bankAccounts.length === 0 // Make first account default
    };
    
    // Update bank accounts
    const updatedAccounts = [...bankAccounts];
    
    // If the new account is default, remove default from others
    if (newAccount.isDefault) {
      updatedAccounts.forEach(acc => acc.isDefault = false);
    }
    
    setBankAccounts([...updatedAccounts, newAccount]);
    
    // Reset form
    setNewBankAccount({
      name: '',
      bank: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking',
      isDefault: false
    });
    
    // Hide form
    setShowBankForm(false);
  };
  
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Image src="/instagram-icon.png" alt="Instagram" width={16} height={16} className="rounded" />;
      case 'TikTok': return <Image src="/tiktok-icon.png" alt="TikTok" width={16} height={16} className="rounded" />;
      case 'YouTube': return <Image src="/youtube-icon.png" alt="YouTube" width={16} height={16} className="rounded" />;
      default: return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  // State for selected order viewing
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Get username from localStorage or other state management
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        console.log('Found username:', storedUsername);
      } else {
        // Try to extract username from user object
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.username) {
              setUsername(user.username);
              localStorage.setItem('username', user.username);
            } else if (user.name) {
              const derivedUsername = user.name.toLowerCase().replace(/\s+/g, '_');
              setUsername(derivedUsername);
              localStorage.setItem('username', derivedUsername);
            }
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
      setLoading(false);
    }
  }, []);

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Creator Status Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Creator Status</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Influencer Tier Card */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-blue-500/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-blue-500/10 rounded-full"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-gray-500 text-sm">Influencer Status</p>
                      <div className="flex items-center mt-1">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          {influencerTier.icon}
                        </div>
                        <h3 className="text-xl font-bold">{influencerTier.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Based on {formatNumber(creatorMetrics.followers)} followers</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 mb-1">Next tier at</div>
                      <div className="text-sm font-medium">
                        {influencerTier.name === 'Nano Influencer' ? '10,000' : 
                         influencerTier.name === 'Micro Influencer' ? '50,000' : 
                         influencerTier.name === 'Macro Influencer' ? '500,000' : 
                         influencerTier.name === 'Mega Influencer' ? '1,000,000' : '∞'} followers
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative z-10">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Current</span>
                      <span>Next Tier</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${creatorMetrics.tierProgress}%` }}
                      ></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500">Current Growth</div>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500 font-medium">+842</span>
                          <span className="text-xs text-gray-500 ml-1">this month</span>
                        </div>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                        <div className="text-xs text-gray-500">Engagement Rate</div>
                        <div className="flex items-center mt-1">
                          <span className="text-gray-800 font-medium">4.8%</span>
                          <div className="flex items-center ml-2">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500 ml-1">+0.6%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Service Tier Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 border border-emerald-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-emerald-500/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-emerald-500/10 rounded-full"></div>
                  
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Creator Level</p>
                      <div className="flex items-center mt-1">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          {serviceTier.icon}
                        </div>
                        <h3 className="text-xl font-bold">{serviceTier.name}</h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Level progress visualization */}
                  <div className="mb-4 relative z-10">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-emerald-500"
                        style={{ width: `${serviceTier.level * 33.33}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Rising Star</span>
                      <span>Established Creator</span>
                      <span>Elite Creator</span>
                    </div>
                  </div>
                  
                  {/* Level criteria */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-100 mb-4 relative z-10">
                    <p className="text-sm font-medium text-gray-700 mb-2">Level Criteria</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 text-emerald-500 mr-2" />
                        <span>
                          <span className="font-medium">{creatorMetrics.completedProjects}</span> Projects
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-500 mr-2" />
                        <span>
                          <span className="font-medium">${formatNumber(creatorMetrics.totalEarnings)}</span> Earnings
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Level benefits */}
                  <div className="relative z-10">
                    <p className="text-xs text-gray-500 mb-2">Your Level Benefits</p>
                    <div className="grid grid-cols-1 gap-2">
                      {serviceTier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center py-1 px-2 rounded bg-white/70 backdrop-blur-sm border border-emerald-100">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Next level promotion */}
                  {serviceTier.level < 3 && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100 relative z-10">
                      <p className="text-sm font-medium">Next Level: {serviceTier.level === 1 ? 'Established Creator' : 'Elite Creator'}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-600">
                        <Package className="w-3 h-3 mr-1" />
                        <span className="mr-4">
                          Need {serviceTier.level === 1 ? '30' : '50'} projects
                        </span>
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span>
                          Need ${serviceTier.level === 1 ? '20,000' : '50,000'} earnings
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Total Earnings Section */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Total Earnings</h4>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 bg-purple-500/5 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-purple-500/5 rounded-full"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-gray-500 text-sm">Lifetime Earnings</p>
                          <h3 className="text-3xl font-bold">${formatNumber(creatorMetrics.totalEarnings)}</h3>
                          <div className="flex items-center text-sm mt-1">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-500 font-medium">+$2,145</span>
                            <span className="text-gray-500 ml-1">this month</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-200">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                          <p className="text-xs text-gray-500">Avg. per Project</p>
                          <p className="text-lg font-semibold">$664</p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                          <p className="text-xs text-gray-500">This Month</p>
                          <p className="text-lg font-semibold">$2,145</p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                          <p className="text-xs text-gray-500">Last Month</p>
                          <p className="text-lg font-semibold">$1,890</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 h-full">
                        <p className="text-sm font-medium mb-3">Revenue by Promotions</p>
                        <div className="space-y-3">
                          {promotionRevenueData.map((promotion, index) => (
                            <div key={index}>
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span>{promotion.type}</span>
                                <span className="font-medium">${promotion.amount.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-${promotion.color}-500`} 
                                     style={{ 
                                       width: `${(promotion.amount / promotionRevenueData.reduce((sum, p) => sum + p.amount, 0)) * 100}%`,
                                       backgroundColor: promotion.color === 'purple' ? '#8b5cf6' : 
                                                        promotion.color === 'indigo' ? '#6366f1' : 
                                                        promotion.color === 'blue' ? '#3b82f6' : 
                                                        promotion.color === 'pink' ? '#ec4899' : 
                                                        promotion.color === 'orange' ? '#f97316' : '#9ca3af'
                                     }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Total Views</p>
                    <h3 className="text-2xl font-bold">3,245</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+12.5%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Total Likes</p>
                    <h3 className="text-2xl font-bold">854</h3>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+8.2%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Messages</p>
                    <h3 className="text-2xl font-bold">28</h3>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+15.7%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Earnings</p>
                    <h3 className="text-2xl font-bold">$2,457</h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+22.3%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
            
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Views</h3>
                  <select className="text-sm border rounded-md px-2 py-1 bg-gray-50">
                    <option>Last 14 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <PerformanceChart data={performanceData.views} color="#3b82f6" />
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>May 1</span>
                  <span>May 7</span>
                  <span>May 14</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
                  <select className="text-sm border rounded-md px-2 py-1 bg-gray-50">
                    <option>Last 14 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <PerformanceChart data={performanceData.earnings} color="#10b981" />
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>May 1</span>
                  <span>May 7</span>
                  <span>May 14</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">Your profile was viewed 28 times</p>
                    <p className="text-sm text-gray-500">Yesterday</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-green-50 rounded-full">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">You received a payment of $450</p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-purple-50 rounded-full">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">New message from Alex Johnson</p>
                    <p className="text-sm text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'orders':
        return (
          <div className="space-y-6">
            {selectedOrder ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 bg-purple-500/5 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-indigo-500/5 rounded-full"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="mr-3 p-2 rounded-lg bg-purple-100">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    Order Details
                  </h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Order summary card */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-100 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-2">
                      <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm mr-3 border border-purple-100">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-medium text-purple-800">{selectedOrder.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2">
                      <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm mr-3 border border-purple-100">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="font-medium text-indigo-800">{selectedOrder.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2">
                      <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm mr-3 border border-purple-100">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-green-700">${selectedOrder.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-500/5 rounded-full"></div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      Order Information
                    </h4>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg mr-3">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Service</p>
                          <div className="flex items-center">
                            <span className="mr-2">{getPlatformIcon(selectedOrder.platform)}</span>
                            <p className="font-medium text-gray-800">{selectedOrder.service}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-lg mr-3">
                          <Target className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Promotion Type</p>
                          <p className="font-medium text-gray-800 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 bg-${getPromotionColor(selectedOrder.promotionType)}-500`}></span>
                            {selectedOrder.promotionType}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg mr-3">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                          <p className="font-medium text-gray-800">{selectedOrder.deliveryDate}</p>
                        </div>
                      </div>
                      
                      {selectedOrder.description && (
                        <div className="flex items-start mt-4 pt-4 border-t border-gray-100">
                          <div className="flex-shrink-0 p-2 bg-purple-50 rounded-lg mr-3">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Description</p>
                            <p className="text-sm text-gray-700">{selectedOrder.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-green-500/5 rounded-full"></div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <BarChart2 className="w-4 h-4 text-green-600 mr-2" />
                      Performance Metrics
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-blue-700">Impressions</p>
                          <Eye className="w-3 h-3 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-blue-800">{selectedOrder.metrics?.impressions?.toLocaleString() || '0'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-purple-700">Engagement</p>
                          <ThumbsUp className="w-3 h-3 text-purple-600" />
                        </div>
                        <p className="text-lg font-bold text-purple-800">{selectedOrder.metrics?.engagement?.toLocaleString() || '0'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-indigo-700">Clicks</p>
                          <MousePointer className="w-3 h-3 text-indigo-600" />
                        </div>
                        <p className="text-lg font-bold text-indigo-800">{selectedOrder.metrics?.clicks?.toLocaleString() || '0'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-green-700">Conversion</p>
                          <ShoppingCart className="w-3 h-3 text-green-600" />
                        </div>
                        <p className="text-lg font-bold text-green-800">{selectedOrder.metrics?.conversion?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                    
                    {selectedOrder.clientFeedback && (
                      <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-2 bg-yellow-50 rounded-lg mr-3">
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Client Feedback</p>
                            <p className="text-sm italic text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                              "{selectedOrder.clientFeedback}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-purple-500/5 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-indigo-500/5 rounded-full"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="mr-3 p-2 rounded-lg bg-indigo-100">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    Orders & Promotions
                  </h3>
                  <div className="flex space-x-2">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg flex items-center text-sm transition-colors duration-200">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </button>
                    <select className="bg-gray-100 text-gray-700 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-indigo-500">
                      <option>All Time</option>
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>
                </div>
                
                <div className="relative overflow-x-auto rounded-lg border border-gray-200 mb-4 relative z-10">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium">Client</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Promotion</th>
                        <th className="px-4 py-3 font-medium">Delivery</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.id} className={`border-b border-gray-200 hover:bg-indigo-50/30 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className="p-1.5 bg-gray-100 rounded-md mr-2">
                                {getPlatformIcon(order.platform)}
                              </span>
                              <span className="font-medium text-gray-800">{order.service}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{order.clientName}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">${order.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 bg-${getPromotionColor(order.promotionType)}-500`}></span>
                              <span className="text-gray-700">{order.promotionType}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{order.deliveryDate}</td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium flex items-center justify-end w-full"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 relative z-10">
                  <div>
                    Showing <span className="font-medium">{orders.length}</span> orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 font-medium">1</span>
                    <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'bank':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-green-500/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-blue-500/5 rounded-full"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="mr-3 p-2 rounded-lg bg-green-100">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  Banking & Payments
                </h3>
                <button 
                  onClick={() => setShowBankForm(!showBankForm)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 font-medium px-4 py-2 rounded-lg flex items-center text-sm transition-colors duration-200 border border-green-200"
                >
                  {showBankForm ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </>
                  )}
                </button>
              </div>
              
              {bankAccounts.length > 0 ? (
                <div className="grid gap-4 relative z-10">
                  {bankAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className={`p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                        account.isDefault ? 
                        'bg-gradient-to-r from-green-50 to-green-100 border border-green-200' : 
                        'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl mr-4 ${
                          account.isDefault ? 'bg-white text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">{account.name}</h4>
                            {account.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{account.bank}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 sm:items-center">
                        <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Account Number</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-800">{account.number}</p>
                            <button className="ml-2 text-gray-400 hover:text-gray-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center relative z-10">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Bank Accounts</h4>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Add your bank account to receive payments from your promotions and creator services.
                  </p>
                  <button 
                    onClick={() => setShowBankForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg inline-flex items-center text-sm transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bank Account
                  </button>
                </div>
              )}
              
              {/* Recent Transactions */}
              {bankAccounts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 relative z-10">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-600 mr-2" />
                    Recent Transactions
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between py-3 px-2">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Payment from Green Valley Brands</p>
                          <p className="text-xs text-gray-500">May 15, 2023</p>
                        </div>
                      </div>
                      <p className="font-medium text-green-600">+$1,250.00</p>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 px-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Payment from Rexon Media Group</p>
                          <p className="text-xs text-gray-500">May 10, 2023</p>
                        </div>
                      </div>
                      <p className="font-medium text-green-600">+$850.00</p>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 px-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Withdrawal to Bank Account</p>
                          <p className="text-xs text-gray-500">May 5, 2023</p>
                        </div>
                      </div>
                      <p className="font-medium text-blue-600">-$1,600.00</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {showBankForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-green-500/5 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-blue-500/5 rounded-full"></div>
                
                <div className="mb-6 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="mr-3 p-2 rounded-lg bg-green-100">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    Add Bank Account
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Enter your bank details to receive payments directly to your account.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      id="name"
                      value={newBankAccount.name}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, name: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g. Primary Account"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      id="bank"
                      value={newBankAccount.bank}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, bank: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g. Chase Bank"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      id="accountNumber"
                      value={newBankAccount.accountNumber}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                    <input
                      type="text"
                      id="routingNumber"
                      value={newBankAccount.routingNumber}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, routingNumber: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter routing number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                      id="accountType"
                      value={newBankAccount.accountType}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, accountType: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newBankAccount.isDefault}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, isDefault: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">Set as default payment account</label>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3 justify-end relative z-10">
                  <button
                    onClick={() => setShowBankForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBankAccount}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Account
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-yellow-500/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-orange-500/5 rounded-full"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="mr-3 p-2 rounded-lg bg-yellow-100">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  Reviews & Feedback
                </h3>
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-medium text-yellow-800">4.8</span>
                  <span className="text-sm text-gray-600 ml-1">average rating</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                <div className="bg-gradient-to-b from-orange-50 to-yellow-50 rounded-xl p-4 border border-yellow-200 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                    <Star className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-200 fill-yellow-200'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Based on {reviews.length} reviews</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h4>
                  
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center mb-2">
                        <div className="flex items-center w-10">
                          <span className="text-xs font-medium text-gray-700">{rating}</span>
                          <Star className="w-3 h-3 text-yellow-500 ml-1" />
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-9 text-right">{count} ({Math.round(percentage)}%)</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Review Statistics</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Communication</div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-1">4.9</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : star === 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Delivery Time</div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-1">4.7</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : star === 5 ? 'text-yellow-200 fill-yellow-200' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Quality</div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-1">4.9</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : star === 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Value</div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-1">4.6</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : star === 5 ? 'text-yellow-200 fill-yellow-200' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-800 mb-4 flex items-center relative z-10">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                Recent Reviews
              </h4>
              
              <div className="space-y-4 relative z-10">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold border border-yellow-200">
                          {review.clientName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{review.clientName}</div>
                          <div className="text-xs text-gray-500">{review.date} • {review.project}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}.0</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                    
                    <div className="mt-3 flex justify-between">
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Helpful
                        </button>
                        <button className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Reply
                        </button>
                      </div>
                      
                      <div>
                        <button className="inline-flex items-center px-2 py-1 bg-yellow-50 hover:bg-yellow-100 rounded text-xs text-yellow-700 border border-yellow-200">
                          <Flag className="w-3 h-3 mr-1" />
                          Highlight Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {reviews.length > 0 && (
                <div className="mt-5 text-center relative z-10">
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium">
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load More Reviews
                  </button>
                </div>
              )}
              
              {reviews.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center relative z-10">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-4">
                    <Star className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    You haven't received any reviews yet. Complete orders and ask your clients to leave reviews.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 bg-blue-500/5 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 -mb-10 -ml-10 bg-indigo-500/5 rounded-full"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="mr-3 p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  Messages & Inquiries
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center">
                    <Mail className="w-4 h-4 text-blue-600 mr-1.5" />
                    <span className="text-sm font-medium text-blue-700">2</span>
                    <span className="text-xs text-gray-600 ml-1">unread</span>
                  </div>
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                <div className="lg:col-span-1 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Conversations</h4>
                    <div className="flex">
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500">
                        <Filter className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 ml-1">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 flex items-start hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${message.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-blue-200 flex-shrink-0">
                          {message.senderName.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className={`font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                              {message.date.split('-')[2]}/{message.date.split('-')[1]}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${message.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                            {message.preview}
                          </p>
                        </div>
                        {message.unread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="lg:col-span-2 border border-gray-200 rounded-xl flex flex-col">
                  <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-blue-200">
                        A
                      </div>
                      <h4 className="font-medium text-gray-800 ml-2">Alex Johnson</h4>
                    </div>
                    <div className="flex">
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 ml-1">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 ml-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                    <div className="flex flex-col space-y-4">
                      {/* Date separator */}
                      <div className="flex items-center justify-center">
                        <div className="bg-gray-200 h-px flex-1"></div>
                        <span className="px-2 text-xs text-gray-500">May 18, 2023</span>
                        <div className="bg-gray-200 h-px flex-1"></div>
                      </div>
                      
                      {/* Received message */}
                      <div className="flex items-end">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-blue-200">
                          A
                        </div>
                        <div className="ml-2 max-w-xs bg-white rounded-lg rounded-bl-none p-3 shadow-sm border border-gray-200">
                          <p className="text-gray-800 text-sm">Hi, I'm interested in working with you on an Instagram campaign for our new summer collection. Would you be available for a brief call to discuss the details?</p>
                          <span className="text-xs text-gray-500 float-right mt-1">10:24 AM</span>
                        </div>
                      </div>
                      
                      {/* Sent message */}
                      <div className="flex items-end justify-end">
                        <div className="max-w-xs bg-blue-600 rounded-lg rounded-br-none p-3 shadow-sm text-white">
                          <p className="text-sm">Hello! Thanks for reaching out. I'd be happy to discuss your campaign.</p>
                          <span className="text-xs text-blue-100 float-right mt-1">10:30 AM</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-end">
                        <div className="max-w-xs bg-blue-600 rounded-lg rounded-br-none p-3 shadow-sm text-white">
                          <p className="text-sm">I'm available for a call tomorrow between 1-4pm EST. Would that work for you?</p>
                          <span className="text-xs text-blue-100 float-right mt-1">10:31 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center">
                      <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border-0 focus:ring-0 text-sm p-2"
                      />
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {messages.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center relative z-10">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h4>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    You haven't received any messages yet. When clients send you messages, they'll appear here.
                  </p>
                </div>
              )}
              
              <div className="mt-6 border-t border-gray-200 pt-5 relative z-10">
                <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                  <Bell className="w-4 h-4 text-gray-600 mr-2" />
                  Notification Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300">
                        <div className="absolute w-4 h-4 bg-white rounded-full left-0.5 top-0.5 peer-checked:right-0.5 peer-checked:left-auto transition-all duration-300"></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300">
                        <div className="absolute w-4 h-4 bg-white rounded-full left-0.5 top-0.5 peer-checked:right-0.5 peer-checked:left-auto transition-all duration-300"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
      
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            <p className="text-purple-100">Welcome back, {username || 'Creator'}</p>
            </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link 
              href="/creator-profile-edit" 
              className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
            <Link 
              href={username ? `/creator/${username}` : "#"}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Your Profile
            </Link>
                </div>
                </div>
      
        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 -mx-4 px-4">
            <button 
              className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Dashboard Overview
            </button>
            <button 
              className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <Package className="w-5 h-5 mr-2" />
              Orders
            </button>
            <button 
              className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeTab === 'bank' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => setActiveTab('bank')}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Bank Accounts
            </button>
            <button 
              className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeTab === 'reviews' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star className="w-5 h-5 mr-2" />
              Reviews
            </button>
            <button 
              className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeTab === 'messages' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Messages
            </button>
        </div>

          {/* Content Area */}
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
} 
