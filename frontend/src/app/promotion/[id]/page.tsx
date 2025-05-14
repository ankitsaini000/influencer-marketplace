"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { 
  ArrowLeft, Calendar, DollarSign, Briefcase, Clock, 
  Tag, CheckCircle, MessageSquare, Bookmark, BookmarkPlus, 
  Globe, Target, Layers, PaperclipIcon, Send, Users, Star, Heart,
  Mail, AlertCircle, Megaphone, Hash, ChevronRight, ChevronDown,
  BadgeCheck, Shield, Smartphone, Award, Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPromotionById } from "../../../services/api";

export default function PromotionPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch promotion data
  const fetchPromotion = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if ID is saved in localStorage
      if (typeof window !== 'undefined') {
        const savedPromos = JSON.parse(localStorage.getItem('savedPromotions') || '[]');
        setIsSaved(savedPromos.includes(params.id));
      }
      
      const response = await getPromotionById(params.id);
      setPromotion(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching promotion:', err);
      setError(err.message || 'Failed to load promotion details');
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPromotion();
  }, [fetchPromotion]);

  const toggleSavePromotion = () => {
    if (typeof window !== 'undefined') {
      const savedPromos = JSON.parse(localStorage.getItem('savedPromotions') || '[]');
      
      if (isSaved) {
        // Remove from saved list
        const updatedSavedPromos = savedPromos.filter((id: string) => id !== params.id);
        localStorage.setItem('savedPromotions', JSON.stringify(updatedSavedPromos));
      } else {
        // Add to saved list
        savedPromos.push(params.id);
        localStorage.setItem('savedPromotions', JSON.stringify(savedPromos));
      }
      
      setIsSaved(!isSaved);
    }
  };

  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !promotion) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 p-6 rounded-xl text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Promotion</h3>
            <p className="text-red-700 mb-4">{error || 'Promotion not found'}</p>
            <Link 
              href="/available-promotions"
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition inline-block"
            >
              Back to Promotions
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/available-promotions" 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Available Promotions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Promotion Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              {promotion.featured && (
                <div className="mb-4 inline-flex items-center bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 mr-1" /> Featured Promotion
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 relative overflow-hidden">
                    {promotion.brandId?.avatar ? (
                      <Image 
                        src={promotion.brandId.avatar}
                        alt={promotion.brandId?.username || 'Brand'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/48x48?text=B";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold">
                        {(promotion.brandId?.username || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold text-gray-900">{promotion.brandId?.username || "Brand"}</h2>
                      {promotion.brandId?.verified && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <BadgeCheck className="w-3 h-3 mr-1 text-blue-600" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Posted {promotion.createdAt ? formatDate(promotion.createdAt) : 'Recently'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleSavePromotion}
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {isSaved ? (
                    <Bookmark className="w-6 h-6 fill-blue-600 text-blue-600" />
                  ) : (
                    <BookmarkPlus className="w-6 h-6" />
                  )}
                </button>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{promotion.title}</h1>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span>Budget</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.budget || 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                    <span>Deadline</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.deadline ? formatDate(promotion.deadline) : 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-purple-600" />
                    <span>Platform</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.platform || 'Any'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Tag className="w-4 h-4 mr-1 text-amber-600" />
                    <span>Category</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.category || 'General'}</p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {promotion.tags && promotion.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'deliverables' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('deliverables')}
                >
                  Deliverables
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'requirements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('requirements')}
                >
                  Requirements
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{promotion.description || 'No description provided.'}</p>
                  </div>
                )}
                
                {activeTab === 'deliverables' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Expected Deliverables</h3>
                    
                    {promotion.deliverables && promotion.deliverables.length > 0 ? (
                      <ul className="space-y-2">
                        {promotion.deliverables.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No specific deliverables have been specified for this promotion.</p>
                    )}
                    
                    {promotion.promotionType && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Promotion Type</h4>
                        <p className="text-blue-700">{promotion.promotionType}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Creator Requirements</h3>
                    
                    {promotion.requirements ? (
                      <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-800">
                        {promotion.requirements}
                      </div>
                    ) : (
                      <p className="text-gray-600">No specific requirements have been specified for this promotion.</p>
                    )}
                    
                    {promotion.timeline && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                        <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-800">
                          {promotion.timeline}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Apply Button */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Link 
                  href={`/promotion/${params.id}/apply`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  Apply for this Promotion
                </Link>
                <p className="text-center text-gray-500 text-sm mt-2">
                  Application deadline: {promotion.deadline ? formatDate(promotion.deadline) : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About the Brand</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 relative overflow-hidden">
                  {promotion.brandId?.avatar ? (
                    <Image 
                      src={promotion.brandId.avatar}
                      alt={promotion.brandId?.username || 'Brand'}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/48x48?text=B";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold">
                      {(promotion.brandId?.username || 'B').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{promotion.brandId?.username || "Brand"}</h4>
                  <p className="text-sm text-gray-500">{promotion.brandId?.fullName || ""}</p>
                </div>
              </div>
              
              {promotion.aboutBrand && (
                <div className="mb-4">
                  <p className="text-gray-700 text-sm">{promotion.aboutBrand}</p>
                </div>
              )}
              
              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Status</h4>
                
                <div className={`flex items-center p-2 rounded-lg ${promotion.brandId?.verified ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <BadgeCheck className={`w-5 h-5 mr-3 ${promotion.brandId?.verified ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Identity Verified</p>
                    <p className="text-xs text-gray-500">
                      {promotion.brandId?.verified 
                        ? 'Brand identity has been verified' 
                        : 'Brand has not verified their identity yet'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-2 rounded-lg ${promotion.paymentVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <Shield className={`w-5 h-5 mr-3 ${promotion.paymentVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Verified</p>
                    <p className="text-xs text-gray-500">
                      {promotion.paymentVerified 
                        ? 'Payment method has been verified' 
                        : 'Brand has not verified their payment method'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-2 rounded-lg ${promotion.phoneVerified ? 'bg-teal-50' : 'bg-gray-50'}`}>
                  <Smartphone className={`w-5 h-5 mr-3 ${promotion.phoneVerified ? 'text-teal-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Verified</p>
                    <p className="text-xs text-gray-500">
                      {promotion.phoneVerified 
                        ? 'Phone number has been verified' 
                        : 'Brand has not verified their phone number'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Brand Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Brand Statistics</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                    <p className="font-medium text-gray-900">{promotion.successRate || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Response Time</p>
                    <p className="font-medium text-gray-900">{promotion.avgResponseTime || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Completed Projects</p>
                    <p className="font-medium text-gray-900">{promotion.pastProjects || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Followers</p>
                    <p className="font-medium text-gray-900">{promotion.brandFollowers || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Brand */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Brand
                </button>
              </div>
            </div>
            
            {/* Similar Promotions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Similar Promotions</h3>
              
              <div className="text-center py-8">
                <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No similar promotions found</p>
                <Link 
                  href="/available-promotions"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View all promotions
                </Link>
              </div>
            </div>
            
            {/* Past Collaborations */}
            {promotion.pastCollaborations && promotion.pastCollaborations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Past Collaborations</h3>
                
                <div className="space-y-3">
                  {promotion.pastCollaborations.map((collab: any, idx: number) => (
                    <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                        {collab.image ? (
                          <Image 
                            src={collab.image}
                            alt={collab.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-600 font-medium">
                            {collab.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{collab.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 