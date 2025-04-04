import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaRocket, FaShare, FaLink, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PublishProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [publishedUrl, setPublishedUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/creators/profile-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/creators/publish', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPublishedUrl(response.data.data.profileUrl || '/creator/profile');
        setShowSuccessModal(true);
        toast.success('Your profile has been published successfully!');
      }
    } catch (error) {
      console.error('Error publishing profile:', error);
      toast.error('Failed to publish profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/creator/profile');
  };
  
  const handleViewProfile = () => {
    router.push(publishedUrl);
    setShowSuccessModal(false);
  };
  
  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${publishedUrl}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => toast.success('Profile URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL'));
  };
  
  const shareOnSocial = (platform: string) => {
    if (typeof window === 'undefined') return;
    
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${publishedUrl}`;
    const text = "Check out my creator profile!";
    
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Publish Your Profile</h1>
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Profile
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-8">
              <h3 className="font-semibold text-indigo-800 mb-3 text-lg">Ready to Go Live</h3>
              <p className="text-indigo-700 mb-4">
                Publishing your profile will make it visible to potential clients on our platform. You can edit your profile anytime after publishing.
              </p>
              
              <div className="bg-white rounded-lg border border-indigo-100 p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Profile Summary</h4>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{profileData.basicInfo?.title || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{profileData.basicInfo?.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Basic Package</p>
                    <p className="font-medium">${profileData.pricing?.packages?.basic?.price || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gallery Items</p>
                    <p className="font-medium">
                      {((profileData.gallery?.images?.length || 0) + 
                       (profileData.gallery?.videos?.length || 0) + 
                       (profileData.gallery?.portfolioLinks?.length || 0)) || '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-indigo-600">
                Click the publish button below to make your profile visible to clients.
              </p>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-md font-medium text-white shadow-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="mr-2"><FaRocket size={16} /></span> Publish Profile
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle size={32} color="#10b981" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  Your profile has been successfully published and is now live on our platform. Share your profile with your network!
                </p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Your profile URL:</p>
                  <div className="flex items-center justify-center">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm mr-2 truncate max-w-[200px]">
                      {typeof window !== 'undefined' ? window.location.origin : ''}{publishedUrl}
                    </code>
                    <button 
                      onClick={copyToClipboard}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Copy URL"
                    >
                      <FaLink size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Share your profile:</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => shareOnSocial('facebook')}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      >
                        <FaFacebook size={20} />
                      </button>
                      <button 
                        onClick={() => shareOnSocial('twitter')}
                        className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600"
                      >
                        <FaTwitter size={20} />
                      </button>
                      <button 
                        onClick={() => shareOnSocial('linkedin')}
                        className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800"
                      >
                        <FaLinkedin size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-2">
                    <button
                      onClick={handleViewProfile}
                      className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-md hover:bg-indigo-700 transition"
                    >
                      View Your Profile
                    </button>
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublishProfile; 