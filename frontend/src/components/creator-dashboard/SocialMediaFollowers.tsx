"use client";

import React, { useState, useEffect } from 'react';
import { 
  Instagram, Twitter, Facebook, Linkedin, Youtube, ExternalLink
} from 'lucide-react';

interface SocialMediaProfile {
  url?: string;
  handle?: string;
  followers?: number;
  subscribers?: number;
  connections?: number;
}

interface SocialMediaProfiles {
  instagram?: SocialMediaProfile;
  twitter?: SocialMediaProfile;
  facebook?: SocialMediaProfile;
  linkedin?: SocialMediaProfile;
  youtube?: SocialMediaProfile;
  website?: { url?: string };
}

interface SocialMediaFollowersProps {
  socialProfiles?: SocialMediaProfiles;
  loading?: boolean;
}

const SocialMediaFollowers: React.FC<SocialMediaFollowersProps> = ({ 
  socialProfiles, 
  loading = false 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Format large numbers (e.g., 1.2M, 450K)
  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get follower count based on platform
  const getFollowerCount = (platform: string): number => {
    if (!socialProfiles) return 0;
    
    switch (platform) {
      case 'instagram':
        return socialProfiles.instagram?.followers || 0;
      case 'twitter':
        return socialProfiles.twitter?.followers || 0;
      case 'facebook':
        return socialProfiles.facebook?.followers || 0;
      case 'linkedin':
        return socialProfiles.linkedin?.connections || 0;
      case 'youtube':
        return socialProfiles.youtube?.subscribers || 0;
      default:
        return 0;
    }
  };

  // Get appropriate label for the count (followers/subscribers/connections)
  const getCountLabel = (platform: string): string => {
    switch (platform) {
      case 'youtube':
        return 'Subscribers';
      case 'linkedin':
        return 'Connections';
      default:
        return 'Followers';
    }
  };
  
  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    if (selectedPlatform === platform) {
      setSelectedPlatform(null);
    } else {
      setSelectedPlatform(platform);
      // Automatically expand to detail view when selecting a platform
      if (!expanded) {
        setExpanded(true);
      }
    }
  };

  // Calculate total followers across all platforms
  const calculateTotalFollowers = (): number => {
    if (!socialProfiles) return 0;
    
    let total = 0;
    if (socialProfiles.instagram?.followers) total += socialProfiles.instagram.followers;
    if (socialProfiles.twitter?.followers) total += socialProfiles.twitter.followers;
    if (socialProfiles.facebook?.followers) total += socialProfiles.facebook.followers;
    if (socialProfiles.linkedin?.connections) total += socialProfiles.linkedin.connections;
    if (socialProfiles.youtube?.subscribers) total += socialProfiles.youtube.subscribers;
    
    return total;
  };

  const totalFollowers = calculateTotalFollowers();
  
  // Get platform data in a structured way
  const getPlatformData = () => {
    const platforms = [
      { 
        id: 'instagram', 
        name: 'Instagram', 
        icon: <Instagram className="h-8 w-8 text-pink-500" />,
        count: getFollowerCount('instagram'),
        label: getCountLabel('instagram'),
        color: 'ring-pink-500',
        hoverColor: 'hover:bg-pink-50',
        iconColor: 'text-pink-500',
        bgColor: 'bg-pink-50',
        url: socialProfiles?.instagram?.url,
        handle: socialProfiles?.instagram?.handle
      },
      { 
        id: 'twitter', 
        name: 'Twitter', 
        icon: <Twitter className="h-8 w-8 text-blue-400" />,
        count: getFollowerCount('twitter'),
        label: getCountLabel('twitter'),
        color: 'ring-blue-400',
        hoverColor: 'hover:bg-blue-50',
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-50',
        url: socialProfiles?.twitter?.url,
        handle: socialProfiles?.twitter?.handle
      },
      { 
        id: 'facebook', 
        name: 'Facebook', 
        icon: <Facebook className="h-8 w-8 text-blue-600" />,
        count: getFollowerCount('facebook'),
        label: getCountLabel('facebook'),
        color: 'ring-blue-600',
        hoverColor: 'hover:bg-blue-50',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        url: socialProfiles?.facebook?.url,
        handle: socialProfiles?.facebook?.handle
      },
      { 
        id: 'linkedin', 
        name: 'LinkedIn', 
        icon: <Linkedin className="h-8 w-8 text-blue-700" />,
        count: getFollowerCount('linkedin'),
        label: getCountLabel('linkedin'),
        color: 'ring-blue-700',
        hoverColor: 'hover:bg-blue-50',
        iconColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        url: socialProfiles?.linkedin?.url,
        handle: socialProfiles?.linkedin?.handle
      },
      { 
        id: 'youtube', 
        name: 'YouTube', 
        icon: <Youtube className="h-8 w-8 text-red-600" />,
        count: getFollowerCount('youtube'),
        label: getCountLabel('youtube'),
        color: 'ring-red-600',
        hoverColor: 'hover:bg-red-50',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        url: socialProfiles?.youtube?.url,
        handle: socialProfiles?.youtube?.handle
      }
    ];
    
    return platforms.filter(platform => platform.url);
  };
  
  const platforms = getPlatformData();
  
  // Don't render anything if we don't have any social profiles with followers
  if (platforms.length === 0 && !loading) {
    return null;
  }
  
  // Open the platform URL in a new tab
  const openPlatformUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Followers</h3>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {expanded ? 'Compact View' : 'Detailed View'}
            </button>
          </div>
          <span className="text-sm font-medium text-purple-600">{formatNumber(totalFollowers)} Total</span>
        </div>
        
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          expanded ? (
            <div className="space-y-4">
              {platforms.map(platform => (
                <div 
                  key={platform.id}
                  className={`rounded-lg border ${platform.hoverColor} transition-all cursor-pointer ${
                    selectedPlatform === platform.id ? `${platform.bgColor} border-transparent` : 'border-gray-200'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {platform.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{platform.name}</h4>
                          {platform.handle && (
                            <p className="text-sm text-gray-500">{platform.handle}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatNumber(platform.count)}</p>
                        <p className="text-xs text-gray-500">{platform.label}</p>
                      </div>
                    </div>
                    
                    {platform.url && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPlatformUrl(platform.url);
                          }}
                          className={`text-xs ${platform.iconColor} flex items-center gap-1`}
                        >
                          <span>Visit Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {platforms.map(platform => (
                <div 
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`rounded-lg border cursor-pointer transition-all ${
                    selectedPlatform === platform.id ? `ring-2 ${platform.color} border-transparent` : 'hover:shadow-md border-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-center p-4">
                    {platform.icon}
                    <span className="mt-2 text-sm font-medium">{platform.name}</span>
                    {(selectedPlatform === platform.id || (platform.count > 0 && selectedPlatform === null)) && (
                      <div className="mt-3 text-center">
                        <p className="text-lg font-bold">{formatNumber(platform.count)}</p>
                        <p className="text-xs text-gray-500">{platform.label}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SocialMediaFollowers; 