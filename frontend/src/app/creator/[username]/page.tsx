"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { getCreatorByUsername } from '../../../services/api';
import { 
  Star, 
  Heart, 
  Share2, 
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Link as LinkIcon,
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Image as ImageIcon,
  X
} from 'lucide-react';

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentSocialSlide, setCurrentSocialSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [priceExpanded, setPriceExpanded] = useState<string | null>('basic');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState<'contact' | 'custom'>('contact');
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any>(null);

  useEffect(() => {
    const fetchCreator = async () => {
      setLoading(true);
      try {
        const response = await getCreatorByUsername(username);
        if (response && response.data) {
          console.log('Creator data:', response.data);
          setCreator(response.data);
        } else {
          setError(response.error || 'Creator not found');
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
        setError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCreator();
    }
  }, [username]);

  // Mock data for demonstration
  const mockSocialCounts = {
    instagram: 680000,
    facebook: 13900000,
    twitter: 12000000,
    youtube: 100000,
    linkedin: 21200000
  };

  const socialMediaPlatforms = [
    { 
      name: 'instagram', 
      icon: <Instagram className="h-6 w-6 text-pink-500" />, 
      followers: mockSocialCounts.instagram,
      url: 'https://instagram.com/username'
    },
    { 
      name: 'facebook', 
      icon: <Facebook className="h-6 w-6 text-blue-600" />, 
      followers: mockSocialCounts.facebook,
      url: 'https://facebook.com/username'
    },
    { 
      name: 'twitter', 
      icon: <Twitter className="h-6 w-6 text-blue-400" />, 
      followers: mockSocialCounts.twitter,
      url: 'https://twitter.com/username'
    },
    { 
      name: 'youtube', 
      icon: <Youtube className="h-6 w-6 text-red-600" />, 
      followers: mockSocialCounts.youtube,
      url: 'https://youtube.com/c/username'
    },
    { 
      name: 'linkedin', 
      icon: <Linkedin className="h-6 w-6 text-blue-700" />, 
      followers: mockSocialCounts.linkedin,
      url: 'https://linkedin.com/in/username'
    }
  ];

  const mockPricingPackages = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: 499,
      description: 'Perfect for small brands and startups',
      features: [
        '1 social media post',
        'Basic content creation',
        '1 revision included',
        'Delivery within 7 days'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard Package',
      price: 999,
      description: 'Ideal for growing brands',
      features: [
        '3 social media posts',
        'Professional content creation',
        '3 revisions included',
        'Delivery within 5 days',
        'Basic analytics report'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 2499,
      description: 'Complete solution for established brands',
      features: [
        '5 social media posts',
        'Premium content creation',
        'Unlimited revisions',
        'Delivery within 3 days',
        'Comprehensive analytics report',
        'Strategy consultation call'
      ],
      popular: false
    }
  ];

  const mockReviews = [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'Jan 20, 2024',
      rating: 5,
      text: 'Working with this creator was an incredible experience. The quality of work exceeded my expectations and the communication was clear throughout the entire process.'
    },
    {
      id: '2',
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Dec 15, 2023',
      rating: 4,
      text: 'Great work overall. The creator was responsive and delivered on time. Would definitely work with them again.'
    },
    {
      id: '3',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      date: 'Nov 30, 2023',
      rating: 5,
      text: 'Exceptional talent and professionalism. Our campaign performance exceeded targets by 35% thanks to their creative direction.'
    }
  ];

  const mockPortfolio = [
    {
      id: '1',
      title: 'Fashion Campaign',
      image: 'https://images.unsplash.com/photo-1542902089-176c2c4e2081',
      category: 'photography'
    },
    {
      id: '2',
      title: 'Product Video Ad',
      image: 'https://images.unsplash.com/photo-1602992708402-6071ccb58805',
      category: 'video'
    },
    {
      id: '3',
      title: 'Social Media Campaign',
      image: 'https://images.unsplash.com/photo-1596637510451-e88ce55a8379',
      category: 'social'
    },
    {
      id: '4',
      title: 'Brand Story',
      image: 'https://images.unsplash.com/photo-1532102235608-dc8a83d39c13',
      category: 'branding'
    },
    {
      id: '5',
      title: 'Website Redesign',
      image: 'https://images.unsplash.com/photo-1554978771-f462f1fb8946',
      category: 'web'
    },
    {
      id: '6',
      title: 'Mobile App Promo',
      image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca',
      category: 'video'
    }
  ];

  const portfolioCategories = [
    { id: 'all', name: 'All Works' },
    { id: 'photography', name: 'Photography' },
    { id: 'video', name: 'Video' },
    { id: 'social', name: 'Social Media' },
    { id: 'branding', name: 'Branding' },
    { id: 'web', name: 'Web Design' }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const nextSocialSlide = () => {
    setCurrentSocialSlide((prev) => (prev >= 4 ? 0 : prev + 1));
  };
  
  const prevSocialSlide = () => {
    setCurrentSocialSlide((prev) => (prev <= 0 ? 4 : prev - 1));
  };

  const handleSocialMediaClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredPortfolio = portfolioFilter === 'all' 
    ? mockPortfolio 
    : mockPortfolio.filter(item => item.category === portfolioFilter);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };
  
  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleContactClick = () => {
    setSelectedMessageType('contact');
    setMessageSubject('');
    setMessageText('');
    setIsMessageModalOpen(true);
  };

  const handleCustomChatClick = () => {
    setSelectedMessageType('custom');
    setMessageSubject('Custom Service Request');
    setMessageText('');
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = () => {
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      // Here you would normally send a message via API
      console.log('Message sent:', {
        type: selectedMessageType,
        subject: messageSubject,
        message: messageText,
        to: username
      });
      setIsSending(false);
      setIsMessageModalOpen(false);
      // Show success toast or notification
      alert('Message sent successfully!');
    }, 1000);
  };

  const handlePortfolioItemClick = (item: any) => {
    setSelectedPortfolioItem(item);
    setPortfolioModalOpen(true);
  };

  const closePortfolioModal = () => {
    setPortfolioModalOpen(false);
    setSelectedPortfolioItem(null);
  };

  useEffect(() => {
    // Add CSS to hide scrollbars but keep functionality
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
        <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
          </div>
        </DashboardLayout>
    );
  }

  if (error) {
    return (
        <DashboardLayout>
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
        </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout>
      {/* Banner Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="h-60 w-full relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="w-28 h-28 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  {/* <div className="absolute -top-2 -right-2 bg-purple-500 text-white p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div> */}
                </div>
                
                {/* Profile Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {creator?.personalInfo?.fullName || 'Bhuvan Bam'}
                    </h1>
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                      Level 2 Seller
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1 text-blue-500 fill-blue-500" />
                      Top Rated
                    </div>
                    <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Available for events
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-1">
                    @{creator?.personalInfo?.username || username || 'bhuvanbam'}
                  </p>
                  
                  <p className="text-gray-700 text-sm mt-2">
                    {creator?.basicInfo?.title || 'Entertainment / Comedy'}
                  </p>
                  
                  {/* Action Buttons - 40px height */}
                  <div className="flex gap-2 mt-4">
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 h-[40px] text-xs rounded shadow-sm transition flex items-center"
                      onClick={handleContactClick}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Contact Me
                    </button>
                    
                    <button 
                      className={`border ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-600'} 
                      hover:bg-gray-50 px-3 h-[40px] text-xs rounded transition flex items-center`}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    
                    <button 
                      className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 h-[40px] text-xs rounded transition flex items-center"
                      onClick={handleShareClick}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Container - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-sm mt-4 mx-4 sm:mx-0 overflow-hidden">
              <div className="grid grid-cols-4 divide-x divide-gray-100">
                <div className="flex flex-col items-center justify-center py-3 px-2">
                  <div className="flex items-center mb-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="font-bold text-lg text-gray-900">4.9</span>
                  </div>
                  <span className="text-gray-500 text-xs">(902)</span>
                </div>
                <div className="flex flex-col items-center justify-center py-3 px-2">
                  <div className="text-purple-600 font-bold flex flex-col items-center">
                    <span className="text-purple-600 font-bold">Top</span>
                    <span className="text-purple-600 font-bold">1%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-3 px-2">
                  <span className="text-lg font-bold text-gray-900">3</span>
                  <div className="text-gray-500 text-xs text-center">
                    <span>Orders in</span>
                    <span className="block">Queue</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-3 px-2">
                  <span className="font-bold text-lg text-gray-900">5.0M</span>
                  <span className="text-gray-500 text-xs">avg/platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Media Section - Separate Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Presence</h3>
            <div className="flex items-center text-purple-600">
              <Users className="w-4 h-4 mr-1" />
              <span className="font-semibold">54.6M Total Followers</span>
            </div>
          </div>
          
          {/* Desktop View - Grid Layout */}
          <div className="hidden md:grid md:grid-cols-5 gap-3">
            {[
              { name: 'Instagram', icon: <Instagram className="h-8 w-8 text-pink-500" />, followers: 5000000, color: 'bg-white hover:bg-pink-50 border-pink-100', hoverColor: 'pink' },
              { name: 'Facebook', icon: <Facebook className="h-8 w-8 text-blue-600" />, followers: 22000000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'blue' },
              { name: 'Twitter', icon: <Twitter className="h-8 w-8 text-blue-400" />, followers: 9000000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'lightblue' },
              { name: 'YouTube', icon: <Youtube className="h-8 w-8 text-red-600" />, followers: 21400000, color: 'bg-white hover:bg-red-50 border-red-100', hoverColor: 'red' },
              { name: 'LinkedIn', icon: <Linkedin className="h-8 w-8 text-blue-700" />, followers: 2100000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'darkblue' }
            ].map((platform) => (
              <div 
                key={platform.name}
                className={`${platform.color} border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md group relative overflow-hidden`}
                onClick={() => handleSocialMediaClick(`https://${platform.name.toLowerCase()}.com/bhuvanbam`)}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-${platform.hoverColor}-200 opacity-0 group-hover:opacity-20 -translate-x-8 -translate-y-8 transition-all duration-300`}></div>
                <div className="flex flex-col items-center">
                  {platform.icon}
                  <span className="mt-2 font-medium text-sm text-gray-700">{platform.name}</span>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-lg font-bold text-gray-900">{formatNumber(platform.followers)}</p>
                  <p className="text-xs text-gray-500">{platform.name === 'YouTube' ? 'Subscribers' : platform.name === 'LinkedIn' ? 'Connections' : 'Followers'}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile View - Slider - Improved design */}
          <div className="md:hidden relative">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={prevSocialSlide}
                className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 focus:outline-none z-10"
                aria-label="Previous social platform"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentSocialSlide ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentSocialSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextSocialSlide}
                className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 focus:outline-none z-10"
                aria-label="Next social platform"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSocialSlide * 100}%)` }}
              >
                {[
                  { name: 'Instagram', icon: <Instagram className="h-10 w-10 text-pink-500" />, followers: 5000000, color: 'bg-white hover:bg-pink-50 border-pink-100', hoverColor: 'pink' },
                  { name: 'Facebook', icon: <Facebook className="h-10 w-10 text-blue-600" />, followers: 22000000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'blue' },
                  { name: 'Twitter', icon: <Twitter className="h-10 w-10 text-blue-400" />, followers: 9000000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'lightblue' },
                  { name: 'YouTube', icon: <Youtube className="h-10 w-10 text-red-600" />, followers: 21400000, color: 'bg-white hover:bg-red-50 border-red-100', hoverColor: 'red' },
                  { name: 'LinkedIn', icon: <Linkedin className="h-10 w-10 text-blue-700" />, followers: 2100000, color: 'bg-white hover:bg-blue-50 border-blue-100', hoverColor: 'darkblue' }
                ].map((platform) => (
                  <div 
                    key={platform.name}
                    className="min-w-full border rounded-lg px-6 py-5 cursor-pointer transition-all hover:shadow-md relative overflow-hidden flex flex-col items-center"
                    onClick={() => handleSocialMediaClick(`https://${platform.name.toLowerCase()}.com/bhuvanbam`)}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${platform.hoverColor}-200 opacity-0 group-hover:opacity-20 -translate-x-16 -translate-y-16 transition-all duration-300`}></div>
                    {platform.icon}
                    <span className="font-medium text-gray-900 mt-3">{platform.name}</span>
                    <div className="mt-2 text-center">
                      <p className="text-xl font-bold text-gray-900">{formatNumber(platform.followers)}</p>
                      <p className="text-xs text-gray-500">{platform.name === 'YouTube' ? 'Subscribers' : platform.name === 'LinkedIn' ? 'Connections' : 'Followers'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Content */}
          <div className="w-full lg:w-2/3">
            {/* About Section - more responsive */}
            <section className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900">About Me</h2>
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                {creator?.description?.detailed || 
                `I'm a creative director and content creator with over 8 years of experience working with global brands.
                My work focuses on authentic storytelling that resonates with audiences and drives engagement.
                Specializing in lifestyle, tech, and fashion niches, I help brands connect with their ideal customers
                through compelling visual narratives and strategic content.`}
              </p>
              
              <div className="mt-4 sm:mt-6">
                <h3 className="text-md sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {['Content Creation', 'Social Media Strategy', 'Brand Storytelling', 'Photography', 'Video Production'].map((tag) => (
                    <span key={tag} className="bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
            
            {/* Make Reviews Section more responsive */}
            <section className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">Client Reviews</h2>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900">4.9</span>
                  <span className="ml-1 text-gray-500 text-sm">(102 reviews)</span>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 sm:pb-6 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-2 sm:mb-3">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <img 
                          src={review.avatar} 
                          alt={review.name} 
                          className="w-8 sm:w-10 h-8 sm:h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{review.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 sm:w-4 h-3 sm:h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">{review.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <button className="text-purple-600 font-medium text-sm sm:text-base hover:text-purple-700">
                  View All Reviews
                </button>
              </div>
            </section>
            
            {/* Portfolio Section - more responsive */}
            <section className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                {/* Remove the video upload button */}
                {/*<button 
                  onClick={() => setIsVideoUploadModalOpen(true)}
                  className="flex items-center px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                  </svg>
                  Upload Video
                </button>*/}
              </div>
              
              {/* Portfolio Filters - scrollable on mobile */}
              <div className="flex overflow-x-auto pb-2 mb-4 sm:mb-6 hide-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {portfolioCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                        portfolioFilter === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setPortfolioFilter(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Portfolio Grid - with videos and clickable items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: '1', title: 'Fashion Campaign', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3', category: 'photography', isVideo: false, client: 'Vogue', description: 'Summer fashion campaign highlighting sustainable clothing', date: 'Jun 15, 2023', services: ['Photography', 'Direction', 'Styling'] },
                  { id: '2', title: 'Product Video Ad', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3', category: 'video', isVideo: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', client: 'Apple Inc.', description: 'Product showcase for the latest tech gadget', date: 'Mar 22, 2023', services: ['Video Production', 'Motion Graphics', 'Sound Design'] },
                  { id: '3', title: 'Social Media Campaign', image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3', category: 'social', isVideo: false, client: 'Nike', description: 'Integrated social media campaign for product launch', date: 'Apr 10, 2023', services: ['Content Strategy', 'Social Media Management', 'Creative Direction'] },
                  { id: '4', title: 'Brand Story', image: 'https://images.unsplash.com/photo-1569937372578-d108318de32f?ixlib=rb-4.0.3', category: 'branding', isVideo: false, client: 'Starbucks', description: 'Visual storytelling project to highlight brand values', date: 'Feb 28, 2023', services: ['Brand Strategy', 'Storytelling', 'Visual Design'] },
                  { id: '5', title: 'Website Redesign', image: 'https://images.unsplash.com/photo-1554978771-f462f1fb8946', category: 'web', isVideo: false, client: 'Microsoft', description: 'Complete website redesign focused on user experience', date: 'May 12, 2023', services: ['UI/UX Design', 'Front-end Development', 'Conversion Optimization'] },
                  { id: '6', title: 'Mobile App Promo', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3', category: 'video', isVideo: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', client: 'Spotify', description: 'Promotional video for mobile app features', date: 'Jul 05, 2023', services: ['Video Production', 'App Demonstration', 'Motion Design'] },
                ].filter(item => portfolioFilter === 'all' ? true : item.category === portfolioFilter).map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handlePortfolioItemClick(item)}
                  >
                    <div className="relative w-full h-40 sm:h-48">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                              <path d="M8 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm5.25.75a.75.75 0 00-1.5 0v12a.75.75 0 001.5 0V6z" />
                              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zm10.5 0a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 sm:p-4 w-full">
                        <h3 className="text-white font-medium text-sm sm:text-base">{item.title}</h3>
                        <p className="text-gray-300 text-xs sm:text-sm capitalize">{item.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <button className="text-purple-600 font-medium text-sm sm:text-base hover:text-purple-700">
                  View Complete Portfolio
                </button>
              </div>
            </section>
          </div>
          
          {/* Right Column - Make Pricing Packages more responsive */}
          <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              {/* Pricing Tabs */}
              <div className="flex border-b">
                <button 
                  className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base text-center ${priceExpanded === 'basic' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                  onClick={() => setPriceExpanded('basic')}
                >
                  Basic
                </button>
                <button 
                  className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base text-center ${priceExpanded === 'standard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                  onClick={() => setPriceExpanded('standard')}
                >
                  Standard
                </button>
                <button 
                  className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base text-center ${priceExpanded === 'premium' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                  onClick={() => setPriceExpanded('premium')}
                >
                  Premium
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {priceExpanded === 'basic' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">BASIC PROMO</h2>
                      <div className="text-2xl font-bold text-gray-900">₹868</div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Basic Package Only Laptop-scenes Includes, Background Music, Logo, and 720HD Video
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">14 Days</p>
                          <p className="text-sm text-gray-500">Delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">1</p>
                          <p className="text-sm text-gray-500">Revision</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {['Sponsored Content', 'Targeted Reach', 'Dynamic transitions', 'Flexibility', 'Loyalty Programs', 'Creative Content'].map((feature) => (
                        <div key={feature} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <button className="w-full text-center text-purple-600 mt-4 font-medium">
                      Compare Packages
                    </button>
                  </div>
                )}
                
                {priceExpanded === 'standard' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">STANDARD PROMO</h2>
                      <div className="text-2xl font-bold text-gray-900">₹1,299</div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Standard Package includes all Basic features plus 1080HD Video, 2 scenes, and professional editing
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">10 Days</p>
                          <p className="text-sm text-gray-500">Delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">3</p>
                          <p className="text-sm text-gray-500">Revisions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {['Sponsored Content', 'Targeted Reach', 'Dynamic transitions', 'Flexibility', 'Loyalty Programs', 'Creative Content', 'Premium Quality', 'Advanced Effects'].map((feature) => (
                        <div key={feature} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <button className="w-full text-center text-purple-600 mt-4 font-medium">
                      Compare Packages
                    </button>
                  </div>
                )}
                
                {priceExpanded === 'premium' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">PREMIUM PROMO</h2>
                      <div className="text-2xl font-bold text-gray-900">₹2,499</div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Premium Package includes all features plus 4K Video, unlimited scenes, and professional sound design
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">7 Days</p>
                          <p className="text-sm text-gray-500">Delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-lg font-semibold">Unlimited</p>
                          <p className="text-sm text-gray-500">Revisions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {['Sponsored Content', 'Targeted Reach', 'Dynamic transitions', 'Flexibility', 'Loyalty Programs', 'Creative Content', 'Premium Quality', 'Advanced Effects', 'Priority Support', 'Brand Strategy'].map((feature) => (
                        <div key={feature} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <button className="w-full text-center text-purple-600 mt-4 font-medium">
                      Compare Packages
                    </button>
                  </div>
                )}
                
                {/* Custom Chat Option */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Need something custom?</h3>
                    <p className="text-gray-600 text-sm mb-3">Don't see what you need in our packages? Let's discuss a custom solution tailored to your requirements.</p>
                    <button 
                      className="w-full bg-white border border-purple-200 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center"
                      onClick={handleCustomChatClick}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Custom Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">About Us</h3>
              <p className="text-gray-600 text-sm">
                Connect with top creators and influencers to boost your brand's reach and engagement. Our platform makes collaboration easy and effective.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">For Creators</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">How it Works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Create Profile</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Resources</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">For Brands</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Find Creators</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Collaboration Tips</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Case Studies</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Brand Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 Creator Marketplace. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share this profile</h3>
              <button onClick={closeShareModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Share this creator's profile with your network</p>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-medium">Facebook</span>
                </button>
                
                <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <Twitter className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-medium">Twitter</span>
                </button>
                
                <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  <Youtube className="w-6 h-6 text-red-600" />
                  <span className="text-xs font-medium">YouTube</span>
                </button>
                
                <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors">
                  <Instagram className="w-6 h-6 text-pink-600" />
                  <span className="text-xs font-medium">Instagram</span>
                </button>
                
                <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <Linkedin className="w-6 h-6 text-blue-700" />
                  <span className="text-xs font-medium">LinkedIn</span>
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <input 
                    type="text" 
                    value={`https://influencermarket.com/creator/${username}`} 
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-gray-600"
                    readOnly
                  />
                  <button className="ml-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Sidebar Toggle Button - Fixed to the side */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 md:hidden">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="bg-purple-600 text-white p-2 rounded-r-md shadow-md"
          aria-label="Toggle sidebar"
        >
          {mobileSidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Bhuvan Bam</h3>
                  <p className="text-xs text-gray-500">@bhuvanbam</p>
                </div>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {['About', 'Services', 'Portfolio', 'Reviews', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="flex items-center p-2 rounded-md hover:bg-purple-50 text-gray-700 hover:text-purple-700">
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t">
            <button className="w-full bg-purple-600 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Now
            </button>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {selectedMessageType === 'contact' ? 'Contact Creator' : 'Request Custom Service'}
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                {selectedMessageType === 'contact' 
                  ? 'Send a message to connect with this creator' 
                  : 'Let us know what custom service you need'}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Enter subject"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center ${
                    (!messageText.trim() || isSending) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Detail Modal */}
      {portfolioModalOpen && selectedPortfolioItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            {/* Close button */}
            <button 
              onClick={closePortfolioModal} 
              className="absolute top-4 right-4 bg-black/50 rounded-full p-1 text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Left side - Media */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center h-64 md:h-auto">
              {selectedPortfolioItem.isVideo ? (
                <video 
                  src={selectedPortfolioItem.videoUrl} 
                  controls 
                  className="max-w-full max-h-full" 
                  autoPlay
                />
              ) : (
                <img 
                  src={selectedPortfolioItem.image} 
                  alt={selectedPortfolioItem.title} 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            
            {/* Right side - Info */}
            <div className="w-full md:w-2/5 p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPortfolioItem.title}</h2>
              <p className="text-gray-600 mb-6">{selectedPortfolioItem.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Client</h3>
                  <p className="text-gray-900 font-medium">{selectedPortfolioItem.client}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Completion Date</h3>
                  <p className="text-gray-900">{selectedPortfolioItem.date}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Services Provided</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPortfolioItem.services.map((service: string) => (
                      <span key={service} className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Category</h3>
                  <p className="text-gray-900 capitalize">{selectedPortfolioItem.category}</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  View Project
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
                  <Heart className="w-4 h-4 mr-1" />
                  Like Project
                </button>
              </div>
            </div>
          </div>
            </div>
          )}
      </DashboardLayout>
  );
} 