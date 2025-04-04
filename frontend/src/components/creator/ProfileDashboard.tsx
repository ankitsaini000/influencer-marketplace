import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface ProfileSection {
  name: string;
  path: string;
  icon: string;
  status: boolean;
}

const ProfileDashboard: React.FC = () => {
  const router = useRouter();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([]);
  const [remainingSteps, setRemainingSteps] = useState(0);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/creators/profile-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Create sections data regardless of completion status
        const sections: ProfileSection[] = [
          { name: 'Overview', path: '/creator/profile/overview', icon: 'info', status: true },
          { name: 'Pricing', path: '/creator/profile/pricing', icon: 'monetization_on', status: true },
          { name: 'Description', path: '/creator/profile/description', icon: 'description', status: true },
          { name: 'Requirements', path: '/creator/profile/requirements', icon: 'assignment', status: true },
          { name: 'Gallery', path: '/creator/profile/gallery', icon: 'collections', status: true },
          { name: 'Social', path: '/creator/profile/social', icon: 'share', status: true },
          { name: 'Personal Info', path: '/creator/profile/personal', icon: 'person', status: true }
        ];
        
        setProfileSections(sections);
        
        // Always 100% complete for the progress bar
        setCompletionPercentage(100);
        setRemainingSteps(0);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Creator Profile</h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/creator/profile/publish')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition"
          >
            <span className="material-icons mr-2">rocket_launch</span>
            Publish Profile
          </button>
        </div>
      </div>
      
      {/* Profile Completion Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Profile Completion</h2>
          <button
            onClick={() => router.push('/creator/profile/publish')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View Details
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{completionPercentage}% complete</span>
              {remainingSteps > 0 ? (
                <span>{remainingSteps} step{remainingSteps !== 1 ? 's' : ''} remaining</span>
              ) : (
                <span className="text-green-600 font-medium">Ready to publish!</span>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Quick Access Section Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileSections.map((section, index) => (
          <Link href={section.path} key={index}>
            <div 
              className={`bg-white rounded-lg shadow p-5 border-l-4 hover:shadow-md transition cursor-pointer ${
                section.status ? 'border-green-500' : 'border-amber-500'
              }`}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 ${section.status ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  <span className="material-icons">{section.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium">{section.name}</h3>
                  <p className="text-sm text-gray-500">
                    {section.status ? 'Completed' : 'Incomplete'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="material-icons text-gray-400">chevron_right</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Call to Action for Publishing */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-indigo-800 text-lg mb-2">Ready to Publish Your Profile?</h3>
        <p className="text-indigo-700 mb-4">
          Click the button below to publish your profile and start receiving client inquiries.
        </p>
        <button
          onClick={() => router.push('/creator/profile/publish')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md inline-flex items-center"
        >
          <span className="material-icons mr-2">rocket_launch</span>
          Publish Now
        </button>
      </div>
      
    </div>
  );
};

export default ProfileDashboard; 