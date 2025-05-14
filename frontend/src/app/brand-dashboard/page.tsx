"use client";

import { useState, useEffect, FormEvent } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import BrandDashboardOverview from "../../components/brand-dashboard/BrandDashboardOverview";
import BrandVerification from "../../components/brand-dashboard/BrandVerification";
import BrandPromotions from "../../components/brand-dashboard/BrandPromotions";
import OrderDetailModal from "../../components/brand-dashboard/OrderDetailModal";
import PromotionModal from "../../components/brand-dashboard/PromotionModal";
import VerificationModal from "../../components/brand-dashboard/VerificationModal";
import { AlertCircle, X } from "lucide-react";
import { createPromotion, getPublishedCreators, getFilteredCreators, getBrandDashboardStats } from "../../services/api";

export default function BrandDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [fetchingCreators, setFetchingCreators] = useState(false);
  const [topCreators, setTopCreators] = useState<any[]>([]);
  
  // Dashboard stats state with initial values
  const [dashboardStats, setDashboardStats] = useState({
    totalSpent: 0,
    brandRating: 4.5,
    completedOrders: 0,
    pendingOrders: 0,
    memberSince: ""
  });
  
  // Loading state for dashboard stats
  const [loadingStats, setLoadingStats] = useState(true);

  // Mock data for account status
  const accountStatus = {
    email: true,
    phone: false,
    payment: true,
    identity: false,
    location: true
  };

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

  // Add promotion state variables
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
      
      // Fetch dashboard stats
      const fetchDashboardStats = async () => {
        try {
          const response = await getBrandDashboardStats();
          if (response.success && response.data) {
            setDashboardStats({
              totalSpent: response.data.totalSpent,
              brandRating: response.data.brandRating,
              completedOrders: response.data.completedOrders,
              pendingOrders: response.data.pendingOrders,
              memberSince: response.data.memberSince
            });
            console.log('Dashboard stats loaded successfully');
          } else {
            console.error('Failed to load dashboard stats:', response.error);
          }
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        } finally {
          setLoadingStats(false);
          setLoading(false);
        }
      };
      
      fetchDashboardStats();
    }
  }, []);

  useEffect(() => {
    const fetchTopCreators = async () => {
      setFetchingCreators(true);
      try {
        // Fetch creators from API
        const creatorsData = await getPublishedCreators();
        
        // Sort creators by rating or other relevant criteria to get the "top" ones
        const sortedCreators = [...creatorsData].sort((a, b) => {
          // Sort by rating first (descending)
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          
          // Then by number of reviews (descending)
          return (b.reviews || 0) - (a.reviews || 0);
        });
        
        // Take only the top 3 creators
        const topThreeCreators = sortedCreators.slice(0, 3);
        
        // Format the data to match the expected format for the UI
        const formattedCreators = topThreeCreators.map((creator, index) => {
          const fullName = creator.personalInfo?.fullName || 
                         creator.userId?.fullName || 
                         `${creator.personalInfo?.firstName || ''} ${creator.personalInfo?.lastName || ''}`.trim() ||
                         creator.username || 
                         'Creator';
                         
          const username = creator.username || 
                         creator.personalInfo?.username ||
                         creator.userId?.username || 
                         `user_${index}`;
                         
          // Clean up username for URL purposes
          const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
          
          const category = creator.professionalInfo?.category || 
                         creator.professionalInfo?.expertise || 
                         creator.category || 
                         'Content Creator';
                         
          const avatar = creator.personalInfo?.profileImage || 
                       creator.personalInfo?.profilePicture || 
                       creator.avatar || 
                       creator.userId?.avatar || 
                       '/avatars/default.jpg';
                       
          const rating = creator.rating || 4.8;
          
          // Calculate engagement rate (if available) or use a default
          const engagement = creator.engagementRate || 
                           creator.engagement || 
                           `${(Math.random() * 5 + 2).toFixed(1)}%`;
                           
          const completedProjects = creator.completedProjects || 
                                  creator.completedOrders || 
                                  Math.floor(Math.random() * 10) + 3;
          
          return {
            id: creator._id || `creator-${index + 1}`,
            name: fullName,
            username: username.startsWith('@') ? username : `@${username}`,
            profileUrl: `/creator/${cleanUsername}`,
            avatar: avatar,
            category: category,
            rating: rating,
            engagement: engagement,
            completedProjects: completedProjects
          };
        });
        
        console.log('Fetched and formatted top creators:', formattedCreators);
        setTopCreators(formattedCreators);
      } catch (error) {
        console.error('Error fetching top creators:', error);
        // Fallback to mock data if API fails
        // Keep existing mock data for fallback
      } finally {
        setFetchingCreators(false);
      }
    };
    
    fetchTopCreators();
  }, []);

  // Mock data for top creators - this will be used as fallback if API fails
  const mockTopCreators = [
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

  // Use fetched data or fallback to mock data
  const displayTopCreators = topCreators.length > 0 ? topCreators : mockTopCreators;

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
  const publishPromotion = async () => {
    try {
      // Show loading indicator or notification
      console.log("Preparing to publish promotion...");
      
      // Validate data
      if (!promotionData.title || !promotionData.description || !promotionData.budget || 
          !promotionData.category || !promotionData.platform || !promotionData.deadline || 
          !promotionData.promotionType) {
        alert("Please fill in all required fields");
        return;
      }
      
      // Format data for API
      const formattedData = {
        ...promotionData,
        status: 'active' // Set as active immediately
      };
      
      // Call API
      const response = await createPromotion(formattedData);
      console.log("Promotion created successfully:", response);
      
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
    } catch (error: any) {
      console.error("Error creating promotion:", error);
      alert("Error publishing promotion: " + (error.message || "Unknown error occurred"));
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

  // Render the appropriate component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <BrandDashboardOverview
            brandName={brandName}
            setActiveTab={setActiveTab}
            memberSince={dashboardStats.memberSince || "January 1, 2023"}
            totalSpent={dashboardStats.totalSpent}
            brandRating={dashboardStats.brandRating}
            completedOrders={dashboardStats.completedOrders}
            pendingOrders={dashboardStats.pendingOrders}
            loadingStats={loadingStats}
            accountStatus={accountStatus}
            topCreators={displayTopCreators}
            fetchingCreators={fetchingCreators}
            recentOrders={recentOrders}
            recentMessages={recentMessages}
            setSelectedOrder={setSelectedOrder}
            setShowOrderDetail={setShowOrderDetail}
            setReplyingTo={setReplyingTo}
            replyingTo={replyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            handleSendReply={handleSendReply}
            setShowPromotionModal={setShowPromotionModal}
          />
        );
      
      case "verification":
        return (
          <BrandVerification
            accountStatus={accountStatus}
            setSelectedVerification={setSelectedVerification}
            setShowVerificationModal={setShowVerificationModal}
          />
        );
      
      case "promotions":
        return (
          <BrandPromotions
            setShowPromotionModal={setShowPromotionModal}
            setPromotionStep={setPromotionStep}
            setPromotionData={setPromotionData}
            promotionData={promotionData}
          />
        );
        
      default:
        return null;
    }
  };

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
            Promotions
          </button>
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}

        {/* Modals */}
        <VerificationModal
          showVerificationModal={showVerificationModal}
          setShowVerificationModal={setShowVerificationModal}
          selectedVerification={selectedVerification}
          handleVerificationSubmit={handleVerificationSubmit}
        />
        
        <OrderDetailModal
          showOrderDetail={showOrderDetail}
          setShowOrderDetail={setShowOrderDetail}
          selectedOrder={selectedOrder}
        />
        
        <PromotionModal
          showPromotionModal={showPromotionModal}
          setShowPromotionModal={setShowPromotionModal}
          promotionStep={promotionStep}
          setPromotionStep={setPromotionStep}
          promotionData={promotionData}
          handlePromotionChange={handlePromotionChange}
          newDeliverable={newDeliverable}
          setNewDeliverable={setNewDeliverable}
          newTag={newTag}
          setNewTag={setNewTag}
          addDeliverable={addDeliverable}
          removeDeliverable={removeDeliverable}
          addTag={addTag}
          removeTag={removeTag}
          publishPromotion={publishPromotion}
        />
      </div>
    </DashboardLayout>
  );
} 