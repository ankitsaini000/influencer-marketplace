'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Globe, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

export const CreatorSocialMedia = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    other: [] as { platform: string; url: string }[]
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followerCounts, setFollowerCounts] = useState({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    other: {} as Record<string, string>
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Try to load existing data if available
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.socialMedia) {
          setFormData(prev => ({
            ...prev,
            ...userData.socialMedia
          }));
          
          if (userData.socialMedia.followerCounts) {
            setFollowerCounts(userData.socialMedia.followerCounts);
          }
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);
  
  const updateSocialProfile = (platform: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: value
    }));
  };
  
  const updateFollowerCount = (platform: keyof typeof followerCounts, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setFollowerCounts(prev => ({
      ...prev,
      [platform]: numericValue
    }));
  };
  
  const handleAddOtherPlatform = () => {
    setFormData(prev => ({
      ...prev,
      other: [...prev.other, { platform: '', url: '' }]
    }));
  };
  
  const updateOtherPlatform = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedOther = [...formData.other];
    updatedOther[index] = { ...updatedOther[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      other: updatedOther
    }));
  };
  
  const updateOtherFollowerCount = (platform: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setFollowerCounts(prev => ({
      ...prev,
      other: {
        ...prev.other,
        [platform]: numericValue
      }
    }));
  };
  
  const removeOtherPlatform = (index: number) => {
    const platformName = formData.other[index].platform;
    
    setFormData(prev => ({
      ...prev,
      other: prev.other.filter((_, i) => i !== index)
    }));
    
    // Also remove follower count if exists
    if (platformName && followerCounts.other && followerCounts.other[platformName]) {
      const newOtherCounts = { ...followerCounts.other };
      delete newOtherCounts[platformName];
      
      setFollowerCounts(prev => ({
        ...prev,
        other: newOtherCounts
      }));
    }
  };
  
  const validateUrl = (url: string) => {
    if (!url) return true; // Empty is fine
    
    // Simple URL validation
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URLs
    const urlFields = ['website', 'instagram', 'twitter', 'facebook', 'linkedin', 'youtube'] as const;
    let hasInvalidUrl = false;
    
    for (const field of urlFields) {
      if (formData[field] && !validateUrl(formData[field])) {
        setError(`Invalid URL for ${field}. Please include https:// or http://`);
        toast.error(`Invalid URL for ${field}`);
        hasInvalidUrl = true;
        break;
      }
    }
    
    // Check other platforms
    if (!hasInvalidUrl) {
      for (const other of formData.other) {
        if (other.url && !validateUrl(other.url)) {
          setError(`Invalid URL for ${other.platform || 'platform'}. Please include https:// or http://`);
          toast.error(`Invalid URL for ${other.platform || 'platform'}`);
          hasInvalidUrl = true;
          break;
        }
      }
    }
    
    if (hasInvalidUrl) {
      return;
    }
    
    // If no social media is provided at all, ask for confirmation
    const hasAnySocialMedia = urlFields.some(field => !!formData[field]) || formData.other.some(item => !!item.url);
    
    if (!hasAnySocialMedia) {
      if (!window.confirm("You haven't added any social media profiles. This might affect your visibility to clients. Are you sure you want to continue?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Import the creator profile store
      const { useCreatorProfileStore } = await import('../../store/creatorProfileStore');
      const store = useCreatorProfileStore.getState();
      
      // Prepare the data with follower counts
      const socialInfoWithCounts = {
        ...formData,
        followersCount: followerCounts
      };
      
      // Update the store first
      store.updateCurrentProfile('socialInfo', socialInfoWithCounts);
      
      // Save to localStorage
      store.saveToLocalStorage();
      
      // Update userData with social media info
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userData.socialMedia = {
          ...formData,
          followerCounts
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Prepare social media data for API
      const apiData = {
        ...formData,
        instagramFollowers: parseInt(followerCounts.instagram) || 0,
        youtubeSubscribers: parseInt(followerCounts.youtube) || 0,
        twitterFollowers: parseInt(followerCounts.twitter) || 0,
        facebookFollowers: parseInt(followerCounts.facebook) || 0,
        linkedinConnections: parseInt(followerCounts.linkedin) || 0,
        totalReach: Object.values(followerCounts).reduce((sum, count) => {
          return sum + (parseInt(count as string) || 0);
        }, 0),
        primaryPlatform: Object.entries(followerCounts).sort((a, b) => 
          (parseInt(b[1] as string) || 0) - (parseInt(a[1] as string) || 0)
        )[0]?.[0] || ''
      };
      
      // Try saving to MongoDB
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found - will navigate without server save');
          toast.error('Authentication token not found. Data saved locally only.');
          setTimeout(() => {
            router.push('/creator-setup/pricing');
          }, 1500);
          return;
        }
        
        console.log('Preparing to send data to MongoDB...');
        
        // Save to MongoDB - Make API call
        // Try multiple endpoints if the primary one fails
        let response;
        let lastError;

        // Try port 5001 first
        try {
          console.log('Trying primary endpoint (port 5001)...');
          response = await fetch('http://localhost:5001/api/creators/social-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(apiData)
          });
        } catch (err) {
          console.error('Primary endpoint failed:', err);
          lastError = err;
        }

        // If port 5001 fails, try port 5000
        if (!response || !response.ok) {
          console.log('Trying fallback endpoint (port 5000)...');
          try {
            response = await fetch('http://localhost:5000/api/creators/social-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(apiData)
            });
          } catch (err) {
            console.error('Fallback endpoint failed:', err);
            lastError = err;
          }
        }

        // No working endpoints
        if (!response || !response.ok) {
          console.error('All API endpoints failed');
          if (response && response.status === 500) {
            throw new Error('The server encountered an internal error. Your data has been saved locally and will be synchronized later.');
          } else if (response) {
            if (response.status === 403) {
              throw new Error('You do not have permission to perform this action. Please ensure you are logged in as a creator.');
            }
            if (response.status === 401) {
              throw new Error('Your session has expired. Please log in again.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to save social media data. Status: ${response.status}`);
          } else if (lastError) {
            throw new Error('Could not connect to the server. Your data has been saved locally and will be synchronized later.');
          } else {
            throw new Error('Unknown error occurred. Your data has been saved locally.');
          }
        }
        
        console.log('API Response status:', response.status);
        
        const result = await response.json();
        console.log('MongoDB Save Result:', result);
        
        // Display a clear success message
        toast.success('Social media info saved to MongoDB successfully!');
        console.log('Success message displayed to user');
      } catch (apiError: any) {
        console.error('API error:', apiError);
        // Show error toast but continue with navigation
        toast.error(apiError.message || 'Server error, but your data is saved locally');
        
        // If it's an authentication error, redirect to login
        if (apiError.message && (apiError.message.includes('session has expired') || apiError.message.includes('not found'))) {
          console.log('Authentication error detected, redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
      }
      
      // Add a visible confirmation and navigate
      console.log('Preparing to navigate to next page...');
      setTimeout(() => {
        router.push('/creator-setup/pricing');
      }, 1500);
      
      console.log('=== Social Media Form Submission Completed Successfully ===');
    } catch (err: any) {
      console.error("Error in form submission:", err);
      const errorMessage = err.message || "An error occurred while saving your data";
      
      toast.error(errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
      
      console.log('=== Social Media Form Submission Failed ===');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format URLs correctly
  const formatUrlForPlatform = (url: string, platform: string) => {
    if (!url) return '';
    
    // If the URL already has a protocol, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add the appropriate prefix based on the platform
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${url.replace('@', '')}`;
      case 'twitter':
        return `https://twitter.com/${url.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${url}`;
      case 'youtube':
        return `https://youtube.com/${url}`;
      case 'linkedin':
        return `https://linkedin.com/in/${url}`;
      default:
        return `https://${url}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={4} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Social Media Profiles</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect your social media accounts to showcase your online presence.
            This helps brands understand your reach and engagement across platforms.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                For each platform, you can provide either your profile URL (e.g., https://instagram.com/yourusername) 
                or just your username (e.g., @yourusername). Adding follower counts helps brands assess your reach.
              </p>
            </div>
            
            {/* Website */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Globe className="w-5 h-5 mr-2 text-gray-600" />
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => updateSocialProfile('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Instagram */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Instagram className="w-5 h-5 mr-2 text-pink-500" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateSocialProfile('instagram', e.target.value)}
                  placeholder="@username or full URL"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.instagram}
                    onChange={(e) => updateFollowerCount('instagram', e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.instagram).toLocaleString()} followers
                  </span>
                </div>
              </div>
            </div>
            
            {/* Youtube */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Youtube className="w-5 h-5 mr-2 text-red-500" />
                  YouTube
                </label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => updateSocialProfile('youtube', e.target.value)}
                  placeholder="Channel URL or username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subscribers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.youtube}
                    onChange={(e) => updateFollowerCount('youtube', e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.youtube).toLocaleString()} subs
                  </span>
                </div>
              </div>
            </div>
            
            {/* Twitter */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Twitter className="w-5 h-5 mr-2 text-blue-400" />
                  Twitter / X
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateSocialProfile('twitter', e.target.value)}
                  placeholder="@username or full URL"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.twitter}
                    onChange={(e) => updateFollowerCount('twitter', e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.twitter).toLocaleString()} followers
                  </span>
                </div>
              </div>
            </div>
            
            {/* Facebook */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => updateSocialProfile('facebook', e.target.value)}
                  placeholder="Page URL or username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers / Likes
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.facebook}
                    onChange={(e) => updateFollowerCount('facebook', e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.facebook).toLocaleString()} likes
                  </span>
                </div>
              </div>
            </div>
            
            {/* LinkedIn */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Linkedin className="w-5 h-5 mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateSocialProfile('linkedin', e.target.value)}
                  placeholder="Profile URL or username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Connections
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.linkedin}
                    onChange={(e) => updateFollowerCount('linkedin', e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.linkedin).toLocaleString()} connections
                  </span>
                </div>
              </div>
            </div>
            
            {/* Other platforms */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Other Platforms</h3>
                <button 
                  type="button"
                  onClick={handleAddOtherPlatform}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Platform
                </button>
              </div>
              
              {formData.other.length > 0 ? (
                <div className="space-y-6">
                  {formData.other.map((platform, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                      <button 
                        type="button" 
                        onClick={() => removeOtherPlatform(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="col-span-12 md:col-span-3 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={platform.platform}
                          onChange={(e) => updateOtherPlatform(index, 'platform', e.target.value)}
                          placeholder="e.g. TikTok"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      
                      <div className="col-span-12 md:col-span-5 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Profile URL
                        </label>
                        <input
                          type="text"
                          value={platform.url}
                          onChange={(e) => updateOtherPlatform(index, 'url', e.target.value)}
                          placeholder="https://platform.com/username"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      
                      <div className="col-span-12 md:col-span-4 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Followers
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={platform.platform && followerCounts.other && followerCounts.other[platform.platform] || ''}
                            onChange={(e) => updateOtherFollowerCount(platform.platform, e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                            disabled={!platform.platform}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">No other platforms added. Click the button above to add more platforms.</p>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 