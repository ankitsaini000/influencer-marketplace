'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Creator } from '@/services/api';

// Mock data
const mockCreators: Creator[] = [
  {
    _id: '1',
    name: 'John Doe',
    bio: 'Fashion influencer with 5+ years of experience',
    category: 'Fashion',
    rating: 4.8
  },
  {
    _id: '2',
    name: 'Jane Smith',
    bio: 'Travel blogger and photographer',
    category: 'Travel',
    rating: 4.6
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    bio: 'Tech reviewer and gaming enthusiast',
    category: 'Technology',
    rating: 4.9
  }
];

export default function MockCreatorsList() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with a delay
    const timer = setTimeout(() => {
      setCreators(mockCreators);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator) => (
        <div key={creator._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                {creator.avatar ? (
                  <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500 font-bold text-lg">
                    {creator.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{creator.name}</h3>
                <p className="text-sm text-gray-500">{creator.category}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">{creator.bio}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{creator.rating.toFixed(1)}</span>
              </div>
              <Link 
                href={`/creator/${creator._id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 