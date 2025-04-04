"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { 
  Search, Filter, Briefcase, Star, Clock, ChevronDown, 
  DollarSign, Calendar, Tag, CheckCircle, MessageSquare,
  Bookmark, BookmarkPlus, ThumbsUp, Heart, Users, Megaphone,
  Hash, ArrowUp, ArrowDown, Globe, Target, Sliders, X, AlertCircle,
  Sparkles, TrendingUp, Shield, BadgeCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AvailablePromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    platform: "",
    minBudget: "",
    maxBudget: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedPromotions, setSavedPromotions] = useState<string[]>([]);
  const [hoveredPromo, setHoveredPromo] = useState<string | null>(null);

  // Mock data for demonstration
  const categories = [
    "All Categories",
    "Fashion & Lifestyle",
    "Beauty & Personal Care",
    "Food & Cooking",
    "Travel & Adventure",
    "Tech & Gaming",
    "Fitness & Health",
    "Home & Decor",
    "Business & Finance",
    "Entertainment"
  ];

  const platforms = [
    "All Platforms",
    "Instagram",
    "TikTok",
    "YouTube",
    "Twitter",
    "Facebook",
    "Multiple Platforms"
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "highest-budget", label: "Highest Budget" },
    { value: "deadline", label: "Deadline (Soonest)" },
    { value: "relevance", label: "Relevance to You" }
  ];

  // Updated mock promotions data with verification fields
  const promotions = [
    {
      id: "promo1",
      brandId: "brand1",
      brandName: "Fitness Glow",
      brandLogo: "/images/brand-logos/fitness-glow.jpg",
      title: "Fitness Influencers Needed for Workout Supplements Campaign",
      description: "We're launching a new line of plant-based pre-workout supplements and need fitness creators to showcase their workout routine using our products.",
      category: "Fitness & Health",
      platform: "Instagram",
      budget: "$500-$800",
      deadline: "May 30, 2023",
      posted: "3 days ago",
      tags: ["fitness", "supplements", "workout", "health"],
      applicationsCount: 18,
      promotionType: "Product Review",
      deliverables: [
        "1 Instagram Post",
        "3 Instagram Stories",
        "Before/After Results"
      ],
      requirements: "Minimum 10K followers, engagement rate >3%, fitness/health niche audience",
      brandVerified: true,
      paymentVerified: true,
      phoneVerified: true,
      featured: true
    },
    {
      id: "promo2",
      brandId: "brand2",
      brandName: "TechGadgets",
      brandLogo: "/images/brand-logos/techgadgets.jpg",
      title: "Tech Reviewers for New Smartphone Accessories",
      description: "Looking for tech creators to review our new smartphone accessories including power banks, wireless chargers, and cases.",
      category: "Tech & Gaming",
      platform: "YouTube",
      budget: "$800-$1500",
      deadline: "June 15, 2023",
      posted: "1 week ago",
      tags: ["tech", "smartphone", "accessories", "review"],
      applicationsCount: 24,
      promotionType: "Product Review",
      deliverables: [
        "10-15 minute YouTube Review",
        "Product Unboxing",
        "Feature Highlights"
      ],
      requirements: "Tech-focused channel with minimum 20K subscribers, previous tech review experience",
      brandVerified: true,
      paymentVerified: true,
      phoneVerified: false,
      featured: false
    },
    {
      id: "promo3",
      brandId: "brand3",
      brandName: "BeautyEssence",
      brandLogo: "/images/brand-logos/beautyessence.jpg",
      title: "Skincare Routine with Our New Serum",
      description: "We're looking for beauty creators to incorporate our new vitamin C serum into their skincare routine and showcase the results.",
      category: "Beauty & Personal Care",
      platform: "TikTok",
      budget: "$300-$700",
      deadline: "May 25, 2023",
      posted: "2 days ago",
      tags: ["beauty", "skincare", "serum", "routine"],
      applicationsCount: 31,
      promotionType: "Product Integration",
      deliverables: [
        "3 TikTok Videos",
        "Day/Night Routine Features",
        "First Impressions"
      ],
      requirements: "Beauty content creators with 8K+ followers, skin care focus",
      brandVerified: true,
      paymentVerified: false,
      phoneVerified: true,
      featured: true
    },
    {
      id: "promo4",
      brandId: "brand4",
      brandName: "TravelNomad",
      brandLogo: "/images/brand-logos/travelnomad.jpg",
      title: "Travel Essentials Backpack Campaign",
      description: "Showcase our multi-functional travel backpack in your next adventure or travel content. We want to highlight durability and versatility.",
      category: "Travel & Adventure",
      platform: "Multiple Platforms",
      budget: "$1000-$2000",
      deadline: "July 10, 2023",
      posted: "5 days ago",
      tags: ["travel", "backpack", "adventure", "gear"],
      applicationsCount: 12,
      promotionType: "Brand Ambassador",
      deliverables: [
        "1 Instagram Post",
        "1 YouTube Video",
        "3 Instagram Stories",
        "Travel Highlights"
      ],
      requirements: "Travel creators with good engagement, regular travel content, minimum 30K followers across platforms",
      brandVerified: false,
      paymentVerified: true,
      phoneVerified: true,
      featured: false
    },
    {
      id: "promo5",
      brandId: "brand5",
      brandName: "HomeChef",
      brandLogo: "/images/brand-logos/homechef.jpg",
      title: "Cooking with Our Premium Kitchenware",
      description: "Create cooking content using our premium knife set and cookware. Show how our tools make cooking easier and more enjoyable.",
      category: "Food & Cooking",
      platform: "Instagram",
      budget: "$400-$900",
      deadline: "June 5, 2023",
      posted: "1 day ago",
      tags: ["cooking", "kitchenware", "food", "chef"],
      applicationsCount: 9,
      promotionType: "Product Integration",
      deliverables: [
        "2 Recipe Videos",
        "5 Instagram Stories",
        "Product Showcase"
      ],
      requirements: "Food content creators, cooking focus, minimum 15K followers",
      brandVerified: false,
      paymentVerified: false,
      phoneVerified: true,
      featured: false
    },
    {
      id: "promo6",
      brandId: "brand6",
      brandName: "EcoFashion",
      brandLogo: "/images/brand-logos/ecofashion.jpg",
      title: "Sustainable Fashion Haul and Styling",
      description: "Looking for fashion creators to showcase our sustainable clothing line with a focus on versatility and eco-friendly materials.",
      category: "Fashion & Lifestyle",
      platform: "TikTok",
      budget: "$600-$1200",
      deadline: "June 20, 2023",
      posted: "4 days ago",
      tags: ["fashion", "sustainable", "eco-friendly", "style"],
      applicationsCount: 22,
      promotionType: "Sponsored Content",
      deliverables: [
        "3 TikTok Videos",
        "Styling Tips",
        "Material Highlights"
      ],
      requirements: "Fashion-focused creators with minimum 20K followers, previous fashion haul experience",
      brandVerified: true,
      paymentVerified: true,
      phoneVerified: true,
      featured: true
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
      // Get username from localStorage in real app
      setUsername("CreatorUser");
    }, 1000);
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      platform: "",
      minBudget: "",
      maxBudget: "",
      sortBy: "newest"
    });
  };

  const toggleSavePromotion = (promoId: string) => {
    if (savedPromotions.includes(promoId)) {
      setSavedPromotions(prev => prev.filter(id => id !== promoId));
    } else {
      setSavedPromotions(prev => [...prev, promoId]);
    }
  };

  // Filter promotions based on user selections
  const filteredPromotions = promotions.filter(promo => {
    if (filters.category && filters.category !== "All Categories" && promo.category !== filters.category) {
      return false;
    }
    if (filters.platform && filters.platform !== "All Platforms" && promo.platform !== filters.platform) {
      return false;
    }
    
    // Budget filtering would go here in a real app
    
    return true;
  });

  // Sort promotions based on user selection
  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    // Always show featured promotions first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    switch (filters.sortBy) {
      case "highest-budget":
        // This is a simplified sorting that would need real budget values
        return parseInt(b.budget.replace(/\D/g, '')) - parseInt(a.budget.replace(/\D/g, ''));
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "relevance":
        // In a real app, this would use the creator's profile to determine relevance
        return b.applicationsCount - a.applicationsCount;
      case "newest":
      default:
        // Simple mock sorting by "posted" field
        return a.posted.includes("day") ? -1 : 1;
    }
  });

  // Function to estimate match percentage based on creator profile
  const getMatchPercentage = (promo: typeof promotions[0]) => {
    // In a real app, this would compare the promotion requirements with the creator's profile
    // For now, return a random percentage for demonstration
    return Math.floor(Math.random() * 41) + 60; // Random number between 60-100
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
        {/* Header with gradient background */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-md">
          <h1 className="text-3xl font-bold mb-3 flex items-center">
            <Megaphone className="w-8 h-8 mr-3" />
            Available Promotions
            <span className="ml-3 text-sm bg-white text-purple-700 px-3 py-1 rounded-full font-normal">
              {sortedPromotions.length} Opportunities
            </span>
          </h1>
          <p className="text-purple-100">
            Discover brand promotion opportunities that match your creator profile. Apply to collaborate with brands that align with your content.
          </p>
        </div>

        {/* Search and Filters with enhanced styling */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for promotions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>
            
            {/* Filter Button */}
            <button 
              className="flex items-center gap-2 px-4 py-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-purple-700"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none pl-4 pr-10 py-3 border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 hover:bg-purple-50 transition-colors duration-200"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Platform Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                  >
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>
                
                {/* Budget Range Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
                      <input 
                        type="number" 
                        placeholder="Min"
                        className="w-full pl-9 p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
                      <input 
                        type="number" 
                        placeholder="Max"
                        className="w-full pl-9 p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={filters.maxBudget}
                        onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Stats */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-700">
            <span className="font-medium">{sortedPromotions.length}</span> promotions found
          </p>
          <div className="flex items-center text-sm bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-full border border-purple-100">
            <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
            <span className="text-purple-800">Showing opportunities that match your profile</span>
          </div>
        </div>
        
        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedPromotions.map(promo => {
            const matchPercentage = getMatchPercentage(promo);
            
            return (
              <div 
                key={promo.id} 
                className={`relative bg-white rounded-xl overflow-hidden border ${promo.featured ? 'border-purple-300' : 'border-gray-200'} 
                  ${hoveredPromo === promo.id ? 'shadow-xl scale-[1.02]' : 'shadow-sm hover:shadow-md'} 
                  transition-all duration-300 ease-in-out`}
                onMouseEnter={() => setHoveredPromo(promo.id)}
                onMouseLeave={() => setHoveredPromo(null)}
              >
                {/* Featured Badge */}
                {promo.featured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" /> Featured
                    </div>
                  </div>
                )}
                
                {/* Brand Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mr-3 relative overflow-hidden">
                      {/* Brand Logo */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-indigo-200 text-purple-700 font-semibold">
                        {promo.brandName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">{promo.brandName}</h3>
                        {promo.brandVerified && (
                          <span className="ml-1 text-purple-600">
                            <BadgeCheck className="w-4 h-4 inline" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{promo.posted}</p>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => toggleSavePromotion(promo.id)}
                      className={`text-gray-400 hover:text-purple-600 transition-colors duration-200 
                        ${savedPromotions.includes(promo.id) ? 'animate-pulse' : ''}`}
                    >
                      {savedPromotions.includes(promo.id) ? (
                        <Bookmark className="w-5 h-5 fill-purple-600 text-purple-600" />
                      ) : (
                        <BookmarkPlus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Match Percentage */}
                {matchPercentage >= 80 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 flex items-center border-b border-green-100">
                    <ThumbsUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800 font-medium">
                      {matchPercentage}% match with your profile
                    </span>
                  </div>
                )}
                
                {/* Promotion Content */}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700">{promo.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{promo.description}</p>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg p-2 hover:bg-purple-50 transition-colors duration-200">
                      <DollarSign className="w-4 h-4 text-purple-500 mr-1.5" />
                      <span>{promo.budget}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg p-2 hover:bg-purple-50 transition-colors duration-200">
                      <Briefcase className="w-4 h-4 text-purple-500 mr-1.5" />
                      <span>{promo.promotionType}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg p-2 hover:bg-purple-50 transition-colors duration-200">
                      <Calendar className="w-4 h-4 text-purple-500 mr-1.5" />
                      <span>Due {promo.deadline}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg p-2 hover:bg-purple-50 transition-colors duration-200">
                      <Globe className="w-4 h-4 text-purple-500 mr-1.5" />
                      <span>{promo.platform}</span>
                    </div>
                  </div>
                  
                  {/* Verification Badges */}
                  <div className="flex space-x-2 mb-4">
                    {promo.brandVerified && (
                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3 h-3 mr-1" /> Brand Verified
                      </span>
                    )}
                    {promo.paymentVerified && (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3 mr-1" /> Payment Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {promo.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 px-2 py-1 rounded-full text-xs flex items-center
                          hover:from-purple-100 hover:to-indigo-100 transition-colors duration-200 cursor-pointer"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/promotion-details/${promo.id}`}
                      className="flex-1 text-center py-2.5 border border-purple-300 rounded-lg text-purple-700 bg-white hover:bg-purple-50 text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/apply-promotion/${promo.id}`}
                      className="flex-1 text-center py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 text-sm font-medium transition-colors duration-200 shadow-sm"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add this to your global styles or inline here
// (In a real app, you would add this to a global CSS file)
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
`; 