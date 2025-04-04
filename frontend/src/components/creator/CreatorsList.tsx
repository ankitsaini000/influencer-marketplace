'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCreators } from '@/services/api';
import { Star, CheckCircle, MessageSquare, Heart } from 'lucide-react';

// Define Creator interface for this component
interface Creator {
  _id: string;
  name: string;
  username?: string;
  bio: string;
  category: string;
  subcategory?: string;
  profileImage?: string;
  avatar?: string;
  rating: number;
  reviews: number;
  tags: string[];
  profileUrl?: string;
  price: number;
  verified?: boolean;
  level?: string;
  ordersInQueue?: number;
  followers?: {
    [key: string]: number | undefined;
    instagram?: number;
    facebook?: number;
    twitter?: number;
    youtube?: number;
    linkedin?: number;
  };
  socialInfo?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    followersCount?: {
      [key: string]: number;
    };
  };
}

// Mock data for testing - this will be replaced with API call
const mockCreators: Creator[] = [
  {
    _id: '1',
    name: 'Alex Johnson',
    bio: 'Digital content creator specializing in lifestyle and travel content with over 5 years of experience.',
    category: 'Lifestyle & Travel',
    rating: 4.9,
    followers: {
      instagram: 120000,
      facebook: 85000,
      twitter: 45000,
      youtube: 200000,
      linkedin: 15000
    },
    reviews: 142,
    verified: true,
    level: 'Level 2 Seller',
    ordersInQueue: 5,
    tags: ['lifestyle', 'travel', 'photography'],
    price: 299
  },
  {
    _id: '2',
    name: 'Sarah Williams',
    bio: 'Tech blogger and web developer creating engaging tutorials and product reviews.',
    category: 'Technology',
    rating: 4.7,
    followers: {
      instagram: 75000,
      facebook: 120000,
      twitter: 180000,
      youtube: 320000,
      linkedin: 90000
    },
    reviews: 98,
    verified: true,
    level: 'Top Rated',
    ordersInQueue: 3,
    tags: ['technology', 'web dev', 'programming'],
    price: 499
  },
  {
    _id: '3',
    name: 'Michael Chen',
    bio: 'Fashion influencer with a passion for sustainable brands and minimalist design.',
    category: 'Fashion',
    rating: 4.8,
    followers: {
      instagram: 350000,
      facebook: 220000,
      twitter: 150000,
      youtube: 280000,
      linkedin: 25000
    },
    reviews: 215,
    verified: true,
    level: 'Level 2 Seller',
    ordersInQueue: 8,
    tags: ['fashion', 'sustainability', 'design'],
    price: 349
  }
];

interface CreatorsListProps {
  creators?: Creator[];
}

export default function CreatorsList({ creators: propCreators }: CreatorsListProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);
  
  useEffect(() => {
    const loadCreators = async () => {
      try {
        // If creators were passed as props, use those
        if (propCreators && propCreators.length > 0) {
          setCreators(propCreators);
          setLoading(false);
          return;
        }
        
        // Get real data from MongoDB API
        const response = await getCreators();
        
        console.log('API response:', response);
        
        if (response && response.data) {
          if ('data' in response.data && Array.isArray(response.data.data)) {
            setCreators(response.data.data);
          } else if (Array.isArray(response.data)) {
          setCreators(response.data);
          } else {
            console.error('API response format is not as expected, using mock data:', response);
            setCreators(mockCreators);
            setUseMock(true);
          }
        } else {
          console.error('API response is missing data property, using mock data:', response);
          setCreators(mockCreators);
          setUseMock(true);
        }
      } catch (err: any) {
        console.error('API error, using mock data:', err);
        setError('Could not load real data. Displaying mock creators.');
        setCreators(mockCreators);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadCreators();
  }, [propCreators]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="grid grid-cols-1 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator._id} creator={creator} />
          ))}
        </div>
      </div>
    );
  }

  if (creators.length === 0 && !useMock) {
    return <div className="text-center py-10">No creators found.</div>;
  }
  
  return (
    <div className="space-y-6">
      {creators.map((creator) => (
        <CreatorCard key={creator._id} creator={creator} />
      ))}
      {useMock && (
        <div className="text-center text-sm mt-4 text-gray-500">
          Using mock data for demonstration purposes.
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  // Format follower numbers
  const formatCount = (count: number = 0) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Get followers from either direct followers object or from socialInfo.followersCount
  const getFollowersCount = (creator: Creator, platform: string): number => {
    if (creator.followers && creator.followers[platform]) {
      return creator.followers[platform] || 0;
    }
    
    if (creator.socialInfo && creator.socialInfo.followersCount) {
      return creator.socialInfo.followersCount[platform] || 0;
    }
    
    return 0;
  };

  // Calculate total followers
  const totalFollowers = ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin']
    .reduce((sum, platform) => sum + getFollowersCount(creator, platform), 0);
  
  const formattedTotal = formatCount(totalFollowers);

  // Get the appropriate image source
  const imageSource = creator.profileImage || creator.avatar || 'https://via.placeholder.com/150';

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      {/* Cover and Profile Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300"></div>
        
        {/* Profile Section */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          {/* Avatar */}
          <div className="rounded-full w-24 h-24 overflow-hidden bg-white border-4 border-white shadow-lg -mt-12">
            <img 
              src={imageSource} 
                  alt={creator.name} 
                  className="w-full h-full object-cover"
                />
          </div>
          
          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">{creator.name}</h2>
              {creator.verified && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">{creator.category} {creator.subcategory ? `• ${creator.subcategory}` : ''}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {creator.rating}
              </div>
              {creator.level && (
                <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center">
                  {creator.level}
                </div>
              )}
              {creator.reviews > 0 && (
                <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center">
                  {creator.reviews} Reviews
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
          <span>Social Media Presence</span>
          <span className="text-purple-600 font-medium">{formattedTotal} Total Followers</span>
              </div>
        <div className="grid grid-cols-5 gap-2">
          {/* Instagram */}
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-pink-500 font-medium">Instagram</div>
            <div className="text-sm">{formatCount(getFollowersCount(creator, 'instagram'))}</div>
            </div>
            
          {/* Facebook */}
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-blue-600 font-medium">Facebook</div>
            <div className="text-sm">{formatCount(getFollowersCount(creator, 'facebook'))}</div>
          </div>
          
          {/* Twitter */}
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-blue-400 font-medium">Twitter</div>
            <div className="text-sm">{formatCount(getFollowersCount(creator, 'twitter'))}</div>
              </div>
              
          {/* YouTube */}
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-red-600 font-medium">YouTube</div>
            <div className="text-sm">{formatCount(getFollowersCount(creator, 'youtube'))}</div>
                </div>
          
          {/* LinkedIn */}
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-blue-700 font-medium">LinkedIn</div>
            <div className="text-sm">{formatCount(getFollowersCount(creator, 'linkedin'))}</div>
              </div>
            </div>
          </div>

      {/* Bio Section */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-700">{creator.bio}</p>
      </div>
      
      {/* Packages Preview */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Services & Packages</h3>
          <Link 
            href={`/creator/${creator._id}`}
            className="text-purple-600 hover:underline text-sm font-medium"
          >
            View All Services
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-1">Basic</h4>
            <p className="text-lg font-bold mb-2">$499</p>
            <p className="text-sm text-gray-600 line-clamp-2">Basic package includes social media promotion and basic content creation.</p>
          </div>
          <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
            <h4 className="font-medium mb-1">Standard</h4>
            <p className="text-lg font-bold mb-2">$899</p>
            <p className="text-sm text-gray-600 line-clamp-2">Standard package includes all basic features plus professional video editing and analytics report.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-1">Premium</h4>
            <p className="text-lg font-bold mb-2">$1,499</p>
            <p className="text-sm text-gray-600 line-clamp-2">Premium package includes all standard features plus exclusive branding and dedicated account manager.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 