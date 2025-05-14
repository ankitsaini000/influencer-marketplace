"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Users, FileText, Mail, Settings, 
  CreditCard, Calendar, CheckCircle, DollarSign, MapPin,
  Phone, Star, ShoppingBag, Clock, Award, TrendingUp,
  Shield, Zap, Bell, ChevronRight, ChevronDown, Briefcase,
  MessageSquare, BadgeCheck, Globe, UserCheck, Gift,
  Image as ImageIcon, Activity, Eye, Heart, ThumbsUp, AlertCircle, X, Plus,
  ChevronLeft as ChevronLeftIcon
} from "lucide-react";
import RecentOrders from "./RecentOrders";

interface OverviewProps {
  brandName: string | null;
  setActiveTab: (tab: string) => void;
  memberSince: string;
  totalSpent: number;
  brandRating: number;
  completedOrders: number;
  pendingOrders: number;
  loadingStats: boolean;
  accountStatus: {
    email: boolean;
    phone: boolean;
    payment: boolean;
    identity: boolean;
    location: boolean;
  };
  topCreators: Array<{
    id: number | string;
    name: string;
    username: string;
    avatar: string;
    category: string;
    rating: number;
    engagement: string;
    completedProjects: number;
    profileUrl?: string;
  }>;
  fetchingCreators?: boolean;
  recentOrders: Array<{
    id: string;
    creator: string;
    service: string;
    date: string;
    amount: number;
    status: string;
    rating: number | null;
    creatorRating: number | null;
    feedback: string;
  }>;
  recentMessages: Array<{
    id: number;
    sender: string;
    avatar: string;
    preview: string;
    time: string;
    unread: boolean;
  }>;
  setSelectedOrder: (order: any) => void;
  setShowOrderDetail: (show: boolean) => void;
  setReplyingTo: (id: number | null) => void;
  replyingTo: number | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleSendReply: (messageId: number) => void;
  setShowPromotionModal: (show: boolean) => void;
}

export default function BrandDashboardOverview({ 
  brandName, 
  setActiveTab, 
  memberSince, 
  totalSpent, 
  brandRating, 
  completedOrders, 
  pendingOrders,
  loadingStats,
  accountStatus,
  topCreators,
  fetchingCreators,
  recentOrders,
  recentMessages,
  setSelectedOrder,
  setShowOrderDetail,
  setReplyingTo,
  replyingTo,
  replyText,
  setReplyText,
  handleSendReply,
  setShowPromotionModal
}: OverviewProps) {
  // Add state for tracking current slider position
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Function to handle slider scroll and update currentSlide
  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const scrollPosition = sliderRef.current.scrollLeft;
      const slideWidth = 300 + 16; // card width + margin
      const newSlide = Math.round(scrollPosition / slideWidth);
      setCurrentSlide(newSlide);
    }
  };
  
  // Attach scroll event handler
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleSliderScroll);
      return () => {
        slider.removeEventListener('scroll', handleSliderScroll);
      };
    }
  }, []);
  
  // Function to scroll to a specific slide
  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      const slideWidth = 300 + 16; // card width + margin
      sliderRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  };
  
  // Brand stats cards
  const renderStatsCards = () => {
    if (loadingStats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Member Since</p>
          <p className="text-lg font-medium">{memberSince}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Total Spent</p>
          <p className="text-lg font-medium">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Brand Rating</p>
          <div className="flex items-center">
            <p className="text-lg font-medium mr-1">{brandRating.toFixed(1)}</p>
            <div className="flex items-center">
              {Array(5).fill(0).map((_, index) => (
                <svg key={index} className={`w-4 h-4 ${index < Math.floor(brandRating) ? 'text-yellow-400' : 'text-gray-300'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Orders</p>
          <p className="text-lg font-medium">{completedOrders} <span className="text-sm text-gray-500">completed</span> / {pendingOrders} <span className="text-sm text-gray-500">pending</span></p>
        </div>
      </div>
    );
  };
  
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
        
        {fetchingCreators ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Finding top creators for you...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const newSlide = Math.max(currentSlide - 1, 0);
                scrollToSlide(newSlide);
              }}
              disabled={currentSlide === 0}
              aria-label="Previous creators"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            {/* Slider Container */}
            <div 
              id="creators-slider" 
              ref={sliderRef}
              className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory',
              }}
            >
              <style jsx global>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                
                /* Hide scrollbar for IE, Edge and Firefox */
                .hide-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
              `}</style>
              
              {topCreators.map((creator) => (
                <div key={creator.id} className="min-w-[300px] max-w-[300px] mx-2 first:ml-8 last:mr-8 snap-start">
                  <Link href={creator.profileUrl || `/creator/${creator.username.replace('@', '')}`} className="block">
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow h-full">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white relative">
                          {creator.avatar && creator.avatar !== '/avatars/default.jpg' ? (
                            <img 
                              src={creator.avatar} 
                              alt={creator.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails to load, show the initial letter
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`absolute inset-0 flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-xl ${creator.avatar && creator.avatar !== '/avatars/default.jpg' ? 'hidden' : ''}`}>
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
                </div>
              ))}
              
              {/* Empty card with "Find more creators" button */}
              <div className="min-w-[300px] max-w-[300px] mx-2 last:mr-8 snap-start">
                <Link href="/search" className="block w-full h-full">
                  <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-6 flex flex-col items-center justify-center h-full">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">Discover More Creators</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">Find the perfect creators for your upcoming campaigns</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center">
                      <Plus className="w-4 h-4 mr-1" />
                      Browse Creators
                    </button>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Pagination Dots */}
            <div className="flex justify-center mt-4 space-x-1.5">
              {[...Array(topCreators.length + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-purple-600 w-4' // Make active dot wider
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Right Arrow */}
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const newSlide = Math.min(currentSlide + 1, topCreators.length);
                scrollToSlide(newSlide);
              }}
              disabled={currentSlide === topCreators.length}
              aria-label="Next creators"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {/* Recent Orders */}
      <RecentOrders 
        setSelectedOrder={setSelectedOrder}
        setShowOrderDetail={setShowOrderDetail}
      />
      
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
      
      {/* Create Promotion card */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">Post a Promotion</h3>
          <CheckCircle className="w-5 h-5 text-blue-200" />
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
    </div>
  );
} 