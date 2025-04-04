"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { 
  LayoutDashboard, Users, FileText, Mail, Settings, 
  CreditCard, Calendar, CheckCircle, DollarSign, MapPin,
  Phone, Star, ShoppingBag, Clock, Award, TrendingUp,
  Shield, Zap, Bell, ChevronRight, ChevronDown, Briefcase,
  MessageSquare, BadgeCheck, Globe, UserCheck, Gift,
  Image as ImageIcon, Activity, Eye, Heart, ThumbsUp, AlertCircle, X,
  Plus, 
  Megaphone, 
  Hash, 
  Calendar as CalendarIcon, 
  PlusCircle,
  Sparkles as SparklesIcon,
  Target,
  Layers,
  Pencil
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BrandDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Mock data for demonstration
  const memberSince = "June 15, 2022";
  const totalSpent = 12450;
  const brandRating = 4.8;
  const completedOrders = 28;
  const pendingOrders = 3;
  const accountStatus = {
    email: true,
    phone: false,
    payment: true,
    identity: false,
    location: true
  };

  // Mock data for top creators
  const topCreators = [
    {
      id: 1,
      name: "Sophia Martinez",
      username: "@sophiastyle",
      avatar: "/avatars/sophia.jpg",
      category: "Fashion & Lifestyle",
      rating: 4.9,
      engagement: "5.2%",
      completedProjects: 8
    },
    {
      id: 2,
      name: "Alex Johnson",
      username: "@alextech",
      avatar: "/avatars/alex.jpg",
      category: "Tech & Gaming",
      rating: 4.7,
      engagement: "6.8%",
      completedProjects: 5
    },
    {
      id: 3,
      name: "Emma Williams",
      username: "@emmafoodie",
      avatar: "/avatars/emma.jpg",
      category: "Food & Cooking",
      rating: 4.8,
      engagement: "4.9%",
      completedProjects: 6
    }
  ];

  // Mock data for recent orders
  const recentOrders = [
    {
      id: "ORD-7829",
      creator: "Sophia Martinez",
      service: "Instagram Story + Post",
      date: "May 15, 2023",
      amount: 750,
      status: "completed",
      rating: 4.9,
      creatorRating: 5,
      feedback: "Great brand to work with, clear instructions and timely payment."
    },
    {
      id: "ORD-6391",
      creator: "Alex Johnson",
      service: "YouTube Review",
      date: "May 8, 2023",
      amount: 1200,
      status: "completed",
      rating: 4.8,
      creatorRating: 4,
      feedback: "Professional team, smooth collaboration process."
    },
    {
      id: "ORD-8912",
      creator: "Emma Williams",
      service: "Content Package",
      date: "April 29, 2023",
      amount: 950,
      status: "completed",
      rating: 4.7,
      creatorRating: 5,
      feedback: "Would definitely work with this brand again! Great communication."
    },
    {
      id: "ORD-9032",
      creator: "Ryan Cooper",
      service: "TikTok Promotion",
      date: "Today",
      amount: 600,
      status: "pending",
      rating: null,
      creatorRating: null,
      feedback: ""
    }
  ];

  // Mock data for recent messages
  const recentMessages = [
    {
      id: 1,
      sender: "Sophia Martinez",
      avatar: "/avatars/sophia.jpg",
      preview: "Hi! I've just uploaded the concept for your campaign. Let me know what you think!",
      time: "2h ago",
      unread: true
    },
    {
      id: 2,
      sender: "Alex Johnson",
      avatar: "/avatars/alex.jpg",
      preview: "Thank you for the detailed brief. I have a few questions about the product...",
      time: "Yesterday",
      unread: false
    },
    {
      id: 3,
      sender: "Emma Williams",
      avatar: "/avatars/emma.jpg",
      preview: "The photos from the shoot are ready! I'm really happy with how they turned out.",
      time: "2d ago",
      unread: false
    }
  ];

  // Add order detail state
  const [selectedOrder, setSelectedOrder] = useState<typeof recentOrders[0] | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Add message reply state
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Add the OTP verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStep, setVerificationStep] = useState<"input" | "verify" | "success">("input");

  // Add new state variables
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionStep, setPromotionStep] = useState(1);
  const [promotionData, setPromotionData] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    platform: "",
    deadline: "",
    promotionType: "",
    deliverables: [] as string[],
    tags: [] as string[],
    requirements: ""
  });
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Get brand name from localStorage or other state management
      const storedBrandName = localStorage.getItem('brandName');
      setBrandName(storedBrandName);
      setLoading(false);
    }
  }, []);

  const renderVerificationItem = (title: string, description: string, isVerified: boolean, icon: React.ReactNode, type: string) => (
    <div className="flex items-start p-4 bg-white rounded-xl border border-gray-100">
      <div className={`p-2 rounded-lg ${isVerified ? 'bg-green-100' : 'bg-orange-100'} mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {isVerified ? (
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> Pending
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-2 flex space-x-3">
          {!isVerified && (
            <button 
              onClick={() => {
                setSelectedVerification(type);
                setShowVerificationModal(true);
              }}
              className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center"
            >
              Complete Verification <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
          <button 
            onClick={() => {
              setSelectedVerification(type);
              setShowVerificationModal(true);
            }}
            className="text-sm text-gray-500 font-medium hover:text-gray-700 flex items-center"
          >
            {isVerified ? 'Edit' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 lg:col-span-2 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-12 -mr-12"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Welcome back, {brandName || 'Brand'}!</h1>
                      <div className="flex items-center mt-1 text-purple-100">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Member since {memberSince}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/30 rounded-md">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-purple-100">Total Spent</p>
                          <p className="font-bold text-xl">${totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/30 rounded-md">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-purple-100">Brand Rating</p>
                          <p className="font-bold text-xl">{brandRating} <span className="text-xs font-normal">/ 5</span></p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:col-span-1 col-span-2">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/30 rounded-md">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-purple-100">Completed Orders</p>
                          <p className="font-bold text-xl">{completedOrders}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Verification Status */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                    Account Verification
                  </h2>
                  <div className="text-sm text-gray-500">3/5 Complete</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-600" />
                      <span className={accountStatus.email ? "text-gray-900" : "text-gray-600"}>Email</span>
                    </div>
                    <div>
                      {accountStatus.email ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <button className="text-purple-600 hover:text-purple-800">Verify</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-600" />
                      <span className={accountStatus.phone ? "text-gray-900" : "text-gray-600"}>Phone</span>
                    </div>
                    <div>
                      {accountStatus.phone ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <button className="text-purple-600 hover:text-purple-800">Verify</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                      <span className={accountStatus.payment ? "text-gray-900" : "text-gray-600"}>Payment</span>
                    </div>
                    <div>
                      {accountStatus.payment ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <button className="text-purple-600 hover:text-purple-800">Verify</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-gray-600" />
                      <span className={accountStatus.identity ? "text-gray-900" : "text-gray-600"}>Identity</span>
                    </div>
                    <div>
                      {accountStatus.identity ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <button className="text-purple-600 hover:text-purple-800">Verify</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      <span className={accountStatus.location ? "text-gray-900" : "text-gray-600"}>Location</span>
                    </div>
                    <div>
                      {accountStatus.location ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <button className="text-purple-600 hover:text-purple-800">Verify</button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setActiveTab('verification')}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Complete Verification
                  </button>
                </div>
              </div>
            </div>
            
            {/* Top Creators */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Top Creators for Your Brand
                </h2>
                <Link href="/search" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topCreators.map((creator) => (
                  <Link href={`/creator/${creator.username.replace('@', '')}`} key={creator.id} className="block">
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white relative">
                          {/* Placeholder for avatar */}
                          <div className="absolute inset-0 flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-xl">
                            {creator.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{creator.username}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-gray-700 ml-1">{creator.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900">{creator.category}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600">Engagement:</span>
                          <span className="font-medium text-gray-900">{creator.engagement}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium text-gray-900">{creator.completedProjects} projects</span>
                        </div>
                        
                        <div className="mt-4 w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg flex items-center justify-center text-sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Creator Profile
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Orders
                </h2>
                <Link href="/orders" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Order ID</th>
                      <th className="py-3 px-4 text-left">Creator</th>
                      <th className="py-3 px-4 text-left">Service</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Creator Rating</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{order.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{order.creator}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{order.service}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{order.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">${order.amount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {order.creatorRating ? (
                            <div className="flex items-center justify-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 text-sm">{order.creatorRating}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetail(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Messages */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Messages
                </h2>
                <Link href="/messages" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                      {/* Placeholder for avatar */}
                      <div className="absolute inset-0 flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-xl">
                        {message.sender.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{message.sender}</h3>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">{message.time}</span>
                          {message.unread && (
                            <span className="ml-2 w-2 h-2 bg-purple-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{message.preview}</p>
                      
                      {replyingTo === message.id ? (
                        <div className="mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={2}
                          ></textarea>
                          <div className="flex justify-end mt-2 space-x-2">
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSendReply(message.id)}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <button 
                            onClick={() => setReplyingTo(message.id)}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "verification":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-600" />
                Account Verification
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderVerificationItem(
                  "Email Verification", 
                  "Verify your email to secure your account and receive important updates", 
                  accountStatus.email,
                  <Mail className="w-5 h-5 text-purple-600" />,
                  "email"
                )}
                
                {renderVerificationItem(
                  "Phone Verification", 
                  "Add and verify your phone number for additional security and communication", 
                  accountStatus.phone,
                  <Phone className="w-5 h-5 text-orange-600" />,
                  "phone"
                )}
                
                {renderVerificationItem(
                  "Payment Method", 
                  "Add a payment method to easily pay for creator collaborations", 
                  accountStatus.payment,
                  <CreditCard className="w-5 h-5 text-green-600" />,
                  "payment"
                )}
                
                {renderVerificationItem(
                  "Identity Verification", 
                  "Verify your identity to build trust with creators and unlock more features", 
                  accountStatus.identity,
                  <UserCheck className="w-5 h-5 text-blue-600" />,
                  "identity"
                )}
                
                {renderVerificationItem(
                  "Location Verification", 
                  "Confirm your business address for local collaborations and events", 
                  accountStatus.location,
                  <MapPin className="w-5 h-5 text-pink-600" />,
                  "location"
                )}
              </div>
            </div>
          </div>
        );
        
      case "promotions":
        return (
          <div className="space-y-6">
            {/* Promotions content */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
                  Promotion Posts
                </h2>
                <button 
                  onClick={() => setShowPromotionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Promotion
                </button>
              </div>
              
              {/* How it Works Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How Promotion Posts Work</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Pencil className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">1. Create a Post</h4>
                    <p className="text-sm text-gray-600">
                      Describe your promotion needs, budget, requirements, and deadlines. Be specific about what you're looking for.
                    </p>
                    <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="relative w-full h-40">
                        <Image 
                          src="/images/promotion-create.jpg" 
                          alt="Creating a promotion post form" 
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                            Create a detailed brief
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">2. Receive Applications</h4>
                    <p className="text-sm text-gray-600">
                      Creators who match your requirements will apply for your promotion opportunity with their portfolio and rates.
                    </p>
                    <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="relative w-full h-40">
                        <Image 
                          src="/images/promotion-applications.jpg" 
                          alt="Creators applying to your promotion" 
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                            Review creator profiles
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">3. Select and Collaborate</h4>
                    <p className="text-sm text-gray-600">
                      Review applications, select the best creators for your campaign, and start collaborating directly.
                    </p>
                    <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="relative w-full h-40">
                        <Image 
                          src="/images/promotion-collaborate.jpg" 
                          alt="Collaborating with creators" 
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                            Track your campaign results
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Your Promotion Posts */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Promotion Posts</h3>
                
                {/* Active Promotions */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Looking for lifestyle influencers for product launch</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          <span>Deadline: May 15, 2023</span>
                          <span className="mx-2">•</span>
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>Budget: $500-$1000</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #lifestyle
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #beauty
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #skincare
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">12</span> applications received
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                          View Applications
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Tech reviewers for new smartphone accessories</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          <span>Deadline: June 20, 2023</span>
                          <span className="mx-2">•</span>
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>Budget: $800-$1500</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #tech
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #review
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #gadgets
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">5</span> applications received
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                          View Applications
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Applications from Creators */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
                  
                  <div className="space-y-4">
                    {/* Application 1 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                        <div className="flex items-center">
                          <Megaphone className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium">Lifestyle influencers for product launch</span>
                        </div>
                        <span className="text-sm text-gray-500">Application received 2 hours ago</span>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center font-semibold text-purple-700">
                              S
                            </div>
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                  <Users className="w-4 h-4 mr-1" />
                                  <span>52.4K followers</span>
                                  <span className="mx-2">•</span>
                                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                                  <span>4.9 rating (18 reviews)</span>
                                </div>
                              </div>
                              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                                95% match
                              </span>
                            </div>
                            
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                "I've been a lifestyle content creator for 5 years with a focus on sustainable living and beauty products. I would love to showcase your new line to my engaged audience who values eco-friendly options..."
                              </p>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Proposed rate: $950
                              </span>
                              <span className="bg-green-50 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Available: Immediate
                              </span>
                              <span className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                Platform: Instagram
                              </span>
                            </div>
                            
                            <div className="mt-4 flex gap-3">
                              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                View Full Application
                              </button>
                              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                View Profile
                              </button>
                              <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                                Accept
                              </button>
                              <button className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200">
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Application 2 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                        <div className="flex items-center">
                          <Megaphone className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium">Lifestyle influencers for product launch</span>
                        </div>
                        <span className="text-sm text-gray-500">Application received 1 day ago</span>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center font-semibold text-blue-700">
                              M
                            </div>
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">Mike Chen</h4>
                                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                  <Users className="w-4 h-4 mr-1" />
                                  <span>28.7K followers</span>
                                  <span className="mx-2">•</span>
                                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                                  <span>4.7 rating (12 reviews)</span>
                                </div>
                              </div>
                              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                                82% match
                              </span>
                            </div>
                            
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                "I specialize in creating authentic lifestyle content with a focus on mindfulness and healthy living. My audience appreciates honest reviews and practical tips..."
                              </p>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Proposed rate: $750
                              </span>
                              <span className="bg-green-50 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Available: Next week
                              </span>
                              <span className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                Platform: Instagram, TikTok
                              </span>
                            </div>
                            
                            <div className="mt-4 flex gap-3">
                              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                View Full Application
                              </button>
                              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                View Profile
                              </button>
                              <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                                Accept
                              </button>
                              <button className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200">
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Link 
                        href="/brand/applications" 
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                      >
                        View All Applications <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
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

  // Functions for handling verification
  const handleVerificationSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock successful verification
    const updatedStatus = { ...accountStatus };
    if (selectedVerification === 'email') updatedStatus.email = true;
    if (selectedVerification === 'phone') updatedStatus.phone = true;
    if (selectedVerification === 'payment') updatedStatus.payment = true;
    if (selectedVerification === 'identity') updatedStatus.identity = true;
    if (selectedVerification === 'location') updatedStatus.location = true;
    
    // In a real app, you would update this via API
    // setAccountStatus(updatedStatus);
    
    // Close modal and clear selection
    setShowVerificationModal(false);
    setSelectedVerification(null);
  };

  // Function to handle message reply
  const handleSendReply = (messageId: number) => {
    if (!replyText.trim()) return;
    
    // In a real app, you would send this via API
    console.log(`Replying to message ${messageId}: ${replyText}`);
    
    // Reset state
    setReplyText("");
    setReplyingTo(null);
  };

  // Add a function to handle form changes
  const handlePromotionChange = (field: string, value: string) => {
    setPromotionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a function to add deliverables
  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setPromotionData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable("");
    }
  };

  // Add a function to remove deliverables
  const removeDeliverable = (index: number) => {
    setPromotionData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  // Add a function to add tags
  const addTag = () => {
    if (newTag.trim()) {
      setPromotionData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Add a function to remove tags
  const removeTag = (index: number) => {
    setPromotionData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Add a function to publish promotion
  const publishPromotion = () => {
    // In a real app, this would save to the backend
    console.log("Publishing promotion:", promotionData);
    
    // Show success alert or notification
    alert("Promotion posted successfully! Creators will be notified about this opportunity.");
    
    // Reset form and close modal
    setPromotionData({
      title: "",
      description: "",
      budget: "",
      category: "",
      platform: "",
      deadline: "",
      promotionType: "",
      deliverables: [],
      tags: [],
      requirements: ""
    });
    setPromotionStep(1);
    setShowPromotionModal(false);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Verification Banner */}
        {showVerificationBanner && !accountStatus.identity && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 relative">
            <button 
              onClick={() => setShowVerificationBanner(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
                <h3 className="font-medium text-gray-900 mb-1">Complete your account verification</h3>
                <p className="text-sm text-gray-600">Verify your identity to unlock all features and build trust with creators.</p>
            </div>
              <button 
                onClick={() => {
                  setActiveTab('verification');
                  setSelectedVerification('identity');
                }}
                className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Verify Now
              </button>
          </div>
        </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
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
              activeTab === 'verification' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
            onClick={() => setActiveTab('verification')}
          >
            <Shield className="w-5 h-5 mr-2" />
            Account Verification
          </button>
          <button 
            className={`px-5 py-3 rounded-lg flex items-center whitespace-nowrap ${
              activeTab === 'promotions' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
            onClick={() => setActiveTab('promotions')}
          >
            <Megaphone className="w-5 h-5 mr-2" />
            Promotions
          </button>
                </div>
        
        {/* Tab Content */}
        {renderTabContent()}

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedVerification === 'email' && 'Email Verification'}
                    {selectedVerification === 'phone' && 'Phone Verification'}
                    {selectedVerification === 'payment' && 'Payment Method'}
                    {selectedVerification === 'identity' && 'Identity Verification'}
                    {selectedVerification === 'location' && 'Location Verification'}
                  </h3>
                  <button 
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleVerificationSubmit}>
                  {selectedVerification === 'email' && (
                    <div className="space-y-4">
                      {verificationStep === "input" && (
                        <>
                <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                              type="email" 
                              className="w-full p-2.5 border border-gray-300 rounded-lg"
                              placeholder="your@email.com" 
                            />
                </div>
                          <p className="text-sm text-gray-500">We'll send a verification code to this email address.</p>
                          <button
                            type="button"
                            onClick={() => setVerificationStep("verify")}
                            className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Send Verification Code
                          </button>
                        </>
                      )}
                      
                      {verificationStep === "verify" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                            <div className="flex space-x-2">
                              {[...Array(6)].map((_, index) => (
                                <input
                                  key={index}
                                  type="text"
                                  maxLength={1}
                                  className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                                  value={verificationCode[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                      const newCode = verificationCode.split('');
                                      newCode[index] = value;
                                      setVerificationCode(newCode.join(''));
                                      
                                      // Auto-focus next input
                                      if (value && index < 5) {
                                        const inputs = document.querySelectorAll('input[maxLength="1"]');
                                        const nextInput = inputs[index + 1] as HTMLInputElement;
                                        if (nextInput) nextInput.focus();
                                      }
                                    }
                                  }}
                                />
                              ))}
              </div>
                            <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your email.</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerificationStep("input");
                                setVerificationCode("");
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              ← Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (verificationCode.length === 6) {
                                  setVerificationStep("success");
                                }
                              }}
                              disabled={verificationCode.length !== 6}
                              className={`px-4 py-2 rounded-lg text-white ${
                                verificationCode.length === 6 
                                  ? "bg-purple-600 hover:bg-purple-700" 
                                  : "bg-purple-400 cursor-not-allowed"
                              }`}
                            >
                              Verify Code
                            </button>
                          </div>
                          <div className="text-center mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                            <button
                              type="button"
                              className="text-sm text-purple-600 hover:text-purple-800"
                            >
                              Resend Code
                            </button>
                          </div>
                        </>
                      )}
                      
                      {verificationStep === "success" && (
                        <>
                          <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified Successfully!</h3>
                            <p className="text-sm text-gray-600 mb-4">Your email has been verified and your account is now more secure.</p>
                            <button
                              type="button"
                              onClick={() => {
                                handleVerificationSubmit(new Event('submit') as any);
                                setVerificationStep("input");
                                setVerificationCode("");
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              Continue
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {selectedVerification === 'phone' && (
                    <div className="space-y-4">
                      {verificationStep === "input" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input 
                              type="tel" 
                              className="w-full p-2.5 border border-gray-300 rounded-lg"
                              placeholder="+1 (555) 123-4567" 
                            />
                          </div>
                          <p className="text-sm text-gray-500">We'll send a verification code via SMS to this number.</p>
                          <button
                            type="button"
                            onClick={() => setVerificationStep("verify")}
                            className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Send Verification Code
                          </button>
                        </>
                      )}
                      
                      {verificationStep === "verify" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                            <div className="flex space-x-2">
                              {[...Array(6)].map((_, index) => (
                                <input
                                  key={index}
                                  type="text"
                                  maxLength={1}
                                  className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                                  value={verificationCode[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                      const newCode = verificationCode.split('');
                                      newCode[index] = value;
                                      setVerificationCode(newCode.join(''));
                                      
                                      // Auto-focus next input
                                      if (value && index < 5) {
                                        const inputs = document.querySelectorAll('input[maxLength="1"]');
                                        const nextInput = inputs[index + 1] as HTMLInputElement;
                                        if (nextInput) nextInput.focus();
                                      }
                                    }
                                  }}
                                />
          ))}
        </div>
                            <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your phone.</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerificationStep("input");
                                setVerificationCode("");
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              ← Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (verificationCode.length === 6) {
                                  setVerificationStep("success");
                                }
                              }}
                              disabled={verificationCode.length !== 6}
                              className={`px-4 py-2 rounded-lg text-white ${
                                verificationCode.length === 6 
                                  ? "bg-purple-600 hover:bg-purple-700" 
                                  : "bg-purple-400 cursor-not-allowed"
                              }`}
                            >
                              Verify Code
                            </button>
                          </div>
                          <div className="text-center mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                            <button
                              type="button"
                              className="text-sm text-purple-600 hover:text-purple-800"
                            >
                              Resend Code
                            </button>
                          </div>
                        </>
                      )}
                      
                      {verificationStep === "success" && (
                        <>
                          <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verified Successfully!</h3>
                            <p className="text-sm text-gray-600 mb-4">Your phone number has been verified and your account is now more secure.</p>
                            <button
                              type="button"
                              onClick={() => {
                                handleVerificationSubmit(new Event('submit') as any);
                                setVerificationStep("input");
                                setVerificationCode("");
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              Continue
                            </button>
        </div>
                        </>
                      )}
      </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Order Details: {selectedOrder.id}
                  </h3>
                  <button 
                    onClick={() => setShowOrderDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Creator</p>
                      <p className="font-medium">{selectedOrder.creator}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{selectedOrder.service}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">${selectedOrder.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedOrder.creatorRating && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium mb-2">Creator Rating & Feedback</h4>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < selectedOrder.creatorRating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-700">{selectedOrder.creatorRating}</span>
                      </div>
                      <p className="text-gray-600 text-sm italic">"{selectedOrder.feedback}"</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium mb-2">Deliverables</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-gray-200 rounded-lg p-3 flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Final Content.jpg</p>
                          <p className="text-gray-500 text-xs">2.4 MB</p>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3 flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Metrics.pdf</p>
                          <p className="text-gray-500 text-xs">1.2 MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowOrderDetail(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Contact Creator
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Promotion card in the dashboard grid (after the Find Creators card) */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">Post a Promotion</h3>
            <Megaphone className="w-5 h-5 text-blue-200" />
          </div>
          <p className="mb-4 text-blue-100">Create a promotion post to attract suitable creators for your marketing campaign</p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-200" />
              <span className="text-sm">Receive applications from relevant creators</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-200" />
              <span className="text-sm">Set your budget and requirements</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-200" />
              <span className="text-sm">Choose from interested creators</span>
            </div>
          </div>
          <button 
            onClick={() => setShowPromotionModal(true)}
            className="w-full py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Promotion
          </button>
        </div>

        {/* Promotion Modal */}
        {showPromotionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
                    Post a Promotion
                  </h3>
                  <button 
                    onClick={() => {
                      setShowPromotionModal(false);
                      setPromotionStep(1);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
                    {[1, 2, 3].map((step) => (
                      <div 
                        key={step}
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative ${
                          step < promotionStep 
                            ? 'bg-green-600 text-white' 
                            : step === promotionStep 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step < promotionStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span>{step}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-1 text-sm">
                    <span className={promotionStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Promotion Details
                    </span>
                    <span className={promotionStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Requirements
                    </span>
                    <span className={promotionStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Review & Publish
                    </span>
                  </div>
                </div>
                
                {/* Step 1: Basic Details */}
                {promotionStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Title *</label>
                      <input 
                        type="text" 
                        value={promotionData.title}
                        onChange={(e) => handlePromotionChange('title', e.target.value)}
                        placeholder="e.g. Looking for lifestyle influencers for our new product launch" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea 
                        rows={4}
                        value={promotionData.description}
                        onChange={(e) => handlePromotionChange('description', e.target.value)}
                        placeholder="Describe what you're looking for in this promotion. Include details about your product, brand values, and campaign objectives." 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range (USD) *</label>
                        <input 
                          type="text" 
                          value={promotionData.budget}
                          onChange={(e) => handlePromotionChange('budget', e.target.value)}
                          placeholder="e.g. $500-$1000" 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select 
                          value={promotionData.category}
                          onChange={(e) => handlePromotionChange('category', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                          <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                          <option value="Food & Cooking">Food & Cooking</option>
                          <option value="Travel & Adventure">Travel & Adventure</option>
                          <option value="Tech & Gaming">Tech & Gaming</option>
                          <option value="Fitness & Health">Fitness & Health</option>
                          <option value="Home & Decor">Home & Decor</option>
                          <option value="Business & Finance">Business & Finance</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                        <select 
                          value={promotionData.platform}
                          onChange={(e) => handlePromotionChange('platform', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a platform</option>
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Twitter">Twitter</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Multiple Platforms">Multiple Platforms</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                        <input 
                          type="date" 
                          value={promotionData.deadline}
                          onChange={(e) => handlePromotionChange('deadline', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type *</label>
                      <select 
                        value={promotionData.promotionType}
                        onChange={(e) => handlePromotionChange('promotionType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a promotion type</option>
                        <option value="Product Review">Product Review</option>
                        <option value="Brand Awareness">Brand Awareness</option>
                        <option value="Product Launch">Product Launch</option>
                        <option value="Unboxing">Unboxing</option>
                        <option value="Tutorial/How-to">Tutorial/How-to</option>
                        <option value="Giveaway/Contest">Giveaway/Contest</option>
                        <option value="Sponsored Content">Sponsored Content</option>
                        <option value="Affiliate Marketing">Affiliate Marketing</option>
                        <option value="Brand Ambassador">Brand Ambassador</option>
                        <option value="Event Promotion">Event Promotion</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Requirements */}
                {promotionStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Deliverables *</label>
                        <span className="text-xs text-gray-500">What should creators provide?</span>
                      </div>
                      
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={newDeliverable}
                          onChange={(e) => setNewDeliverable(e.target.value)}
                          placeholder="e.g. 1 Instagram post + 3 stories" 
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button 
                          onClick={addDeliverable}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {promotionData.deliverables.map((deliverable, index) => (
                          <div 
                            key={index} 
                            className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                          >
                            <Layers className="w-4 h-4" />
                            <span>{deliverable}</span>
                            <button 
                              onClick={() => removeDeliverable(index)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {promotionData.deliverables.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No deliverables added yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <span className="text-xs text-gray-500">Keywords related to your promotion</span>
                      </div>
                      
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="e.g. sustainable, vegan, eco-friendly" 
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button 
                          onClick={addTag}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {promotionData.tags.map((tag, index) => (
                          <div 
                            key={index} 
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                          >
                            <Hash className="w-3 h-3" />
                            <span>{tag}</span>
                            <button 
                              onClick={() => removeTag(index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {promotionData.tags.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No tags added yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Creator Requirements</label>
                      <textarea 
                        rows={4}
                        value={promotionData.requirements}
                        onChange={(e) => handlePromotionChange('requirements', e.target.value)}
                        placeholder="Describe any specific requirements for creators (e.g. follower count, engagement rate, audience demographics, etc.)" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Review & Publish */}
                {promotionStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Promotion Preview
                      </h4>
                      
                      <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{promotionData.title || "Untitled Promotion"}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>Deadline: {promotionData.deadline ? new Date(promotionData.deadline).toLocaleDateString() : "No deadline set"}</span>
                            <span className="mx-2">•</span>
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>Budget: {promotionData.budget || "Not specified"}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Category</span>
                            <span className="text-sm font-medium flex items-center">
                              <Target className="w-4 h-4 mr-1 text-blue-600" />
                              {promotionData.category || "Not specified"}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Platform</span>
                            <span className="text-sm font-medium flex items-center">
                              <Globe className="w-4 h-4 mr-1 text-blue-600" />
                              {promotionData.platform || "Not specified"}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Promotion Type</span>
                            <span className="text-sm font-medium flex items-center">
                              <Megaphone className="w-4 h-4 mr-1 text-blue-600" />
                              {promotionData.promotionType || "Not specified"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-5">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {promotionData.description || "No description provided."}
                          </p>
                        </div>
                        
                        <div className="mb-5">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h5>
                          {promotionData.deliverables.length > 0 ? (
                            <ul className="space-y-1">
                              {promotionData.deliverables.map((deliverable, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  {deliverable}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No deliverables specified</p>
                          )}
                        </div>
                        
                        {promotionData.requirements && (
                          <div className="mb-5">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Creator Requirements</h5>
                            <p className="text-sm text-gray-600">
                              {promotionData.requirements}
                            </p>
                          </div>
                        )}
                        
                        {promotionData.tags.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Tags</h5>
                            <div className="flex flex-wrap gap-2">
                              {promotionData.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
                                >
                                  <Hash className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Ready to publish?</h4>
                      <p className="text-sm text-blue-600 mb-3">
                        This promotion will be visible to relevant creators who match your requirements.
                        You'll be notified when creators apply for this opportunity.
                      </p>
                      
                      <button
                        onClick={publishPromotion}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Megaphone className="w-5 h-5" />
                        Publish Promotion
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  {promotionStep > 1 ? (
                    <button
                      onClick={() => setPromotionStep(prev => prev - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      Previous Step
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPromotionModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {promotionStep < 3 && (
                    <button
                      onClick={() => setPromotionStep(prev => prev + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 