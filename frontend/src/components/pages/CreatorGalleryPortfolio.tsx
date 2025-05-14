'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Upload, X, Plus, FileVideo, HelpCircle, UserCheck, Info } from 'lucide-react';
import { Image as LucideImage } from 'lucide-react';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { toast } from 'react-hot-toast';
import { saveGalleryPortfolio, upgradeToCreator, checkUserRoleAndId } from '@/api/api';

export const CreatorGalleryPortfolio = () => {
  const router = useRouter();
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<Array<{ title: string; url: string }>>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<Array<{
    id: string;
    title: string;
    image: string;
    category: string;
    client?: string;
    description?: string;
    isVideo?: boolean;
    videoUrl?: string;
    promotionType?: string;
    clientFeedback?: string;
    projectDate?: string;
  }>>([]);
  
  const [newItem, setNewItem] = useState({
    title: '',
    image: '',
    category: 'photography',
    client: '',
    description: '',
    isVideo: false,
    videoUrl: '',
    promotionType: '',
    clientFeedback: '',
    projectDate: '',
  });
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'portfolio'
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categories for portfolio items
  const categories = [
    { id: 'photography', name: 'Photography' },
    { id: 'video', name: 'Video' },
    { id: 'design', name: 'Design' },
    { id: 'branding', name: 'Branding' },
    { id: 'social', name: 'Social Media' },
    { id: 'web', name: 'Web Development' }
  ];
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  useEffect(() => {
    // Load existing gallery data from local storage if available
    const savedGalleryData = localStorage.getItem('creatorGallery');
    if (savedGalleryData) {
      try {
        const parsedData = JSON.parse(savedGalleryData);
        setGalleryImages(parsedData.images || []);
        setGalleryVideos(parsedData.videos || []);
        setPortfolioLinks(parsedData.portfolioLinks || []);
      } catch (e) {
        console.error('Error parsing saved gallery data', e);
      }
    }
    
    // Load existing portfolio data from local storage if available
    const savedPortfolioData = localStorage.getItem('creatorPortfolio');
    if (savedPortfolioData) {
      try {
        const parsedData = JSON.parse(savedPortfolioData);
        setPortfolioItems(parsedData);
      } catch (e) {
        console.error('Error parsing saved portfolio data', e);
      }
    }
  }, []);
  
  // Add this helper function after your useState definitions
  const compressImage = async (base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a browser built-in Image to load the base64 string
        const img = new window.Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
        
        img.src = base64Image;
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Helper function to clear unnecessary storage
  const clearOldStorageData = () => {
    try {
      console.log('Attempting to clear storage to make room...');
      
      // Find all keys to clear except critical data
      const keysToPreserve = ['token', 'userRole', 'username', 'userData'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.some(k => key.includes(k))) {
          keysToRemove.push(key);
        }
      }
      
      // Log what we're clearing
      console.log(`Clearing ${keysToRemove.length} items from localStorage`);
      
      // Remove items
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      
      return true;
    } catch (e) {
      console.error("Error clearing old storage data:", e);
      return false;
    }
  };
  
  // Replace this gallery image upload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      console.log(`Processing ${files.length} gallery files`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Limit number of files to process
      const maxFiles = 5;
      const filesToProcess = Array.from(files).slice(0, maxFiles);
      
      if (files.length > maxFiles) {
        toast.error(`Only the first ${maxFiles} files will be processed to save storage space.`);
      }
      
      // Process files
      Array.from(filesToProcess).forEach(file => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds the 5MB limit.`);
          errorCount++;
          return;
        }
        
        console.log('Processing file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB', 'Type:', file.type);
        
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const result = reader.result as string;
          
          if (file.type.startsWith('image/')) {
            // Compress the image before storing
            const img = new window.Image();
            img.onload = () => {
              // Calculate new dimensions while maintaining aspect ratio
              let width = img.width;
              let height = img.height;
              
              if (width > 800) {
                height = (height * 800) / width;
                width = 800;
              }
              
              // Create canvas and draw resized image
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                console.error('Could not get canvas context');
                errorCount++;
                return;
              }
              
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert to base64 with reduced quality
              const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
              console.log('Original size:', Math.round(result.length/1024), 'KB');
              console.log('Compressed size:', Math.round(compressedImage.length/1024), 'KB');
              
              setGalleryImages(prev => [...prev, compressedImage]);
              successCount++;
              console.log(`Added compressed image: ${file.name}`);
              
              // Check if all files have been processed
              if (successCount + errorCount === filesToProcess.length) {
                setIsUploading(false);
                if (successCount > 0) {
                  toast.success(`Successfully added ${successCount} files to your gallery.`);
                }
              }
            };
            
            img.onerror = () => {
              console.error('Error compressing image:', file.name);
              errorCount++;
              
              // Check if all files have been processed
              if (successCount + errorCount === filesToProcess.length) {
                setIsUploading(false);
              }
            };
            
            img.src = result;
          } else if (file.type.startsWith('video/')) {
            setGalleryVideos(prev => [...prev, result]);
            successCount++;
            console.log(`Added video: ${file.name}`);
            
            // Check if all files have been processed
            if (successCount + errorCount === filesToProcess.length) {
              setIsUploading(false);
              if (successCount > 0) {
                toast.success(`Successfully added ${successCount} files to your gallery.`);
              }
            }
          } else {
            console.error('Unsupported file type:', file.type);
            errorCount++;
            
            // Check if all files have been processed
            if (successCount + errorCount === filesToProcess.length) {
              setIsUploading(false);
            }
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file:', file.name);
          errorCount++;
          
          // Check if all files have been processed
          if (successCount + errorCount === filesToProcess.length) {
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeVideo = (index: number) => {
    setGalleryVideos(prev => prev.filter((_, i) => i !== index));
  };
  
  const addPortfolioLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      // Validate URL
      try {
        new URL(newLink.url);
        setPortfolioLinks([...portfolioLinks, { ...newLink }]);
        setNewLink({ title: '', url: '' });
      } catch (e) {
        setErrors({ ...errors, url: 'Please enter a valid URL' });
        return;
      }
    }
  };
  
  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index));
  };
  
  // Replace this portfolio image upload function
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Check file size before processing (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Maximum size is 5MB.');
        setIsUploading(false);
        return;
      }
      
      console.log('Processing portfolio image:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      try {
        const result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsDataURL(file);
        });
        
        // Compress the image
        const compressedImage = await compressImage(result, 800, 0.6);
        console.log('Original size:', Math.round(result.length/1024), 'KB');
        console.log('Compressed size:', Math.round(compressedImage.length/1024), 'KB');
        
        setNewItem({ ...newItem, image: compressedImage });
        setIsUploading(false);
        
        // Clear any previous errors
        if (errors.image) {
          const newErrors = { ...errors };
          delete newErrors.image;
          setErrors(newErrors);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to load image. Please try again with a different file.');
        setIsUploading(false);
      }
    }
  };
  
  const validatePortfolioItem = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newItem.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newItem.client?.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!newItem.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!newItem.promotionType?.trim()) {
      newErrors.promotionType = 'Promotion type is required';
    }
    
    if (newItem.isVideo) {
      if (!newItem.videoUrl?.trim()) {
        newErrors.videoUrl = 'Video URL is required';
      } else {
        // Basic URL validation
        try {
          new URL(newItem.videoUrl);
        } catch (e) {
          newErrors.videoUrl = 'Please enter a valid URL';
        }
      }
    } else {
      if (!newItem.image) {
        newErrors.image = 'Please upload an image';
      }
    }
    
    console.log('Portfolio validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddPortfolioItem = () => {
    if (validatePortfolioItem()) {
      const newId = Date.now().toString();
      const updatedItems = [...portfolioItems, { id: newId, ...newItem }];
      setPortfolioItems(updatedItems);
      
      // Reset form
      setNewItem({
        title: '',
        image: '',
        category: 'photography',
        client: '',
        description: '',
        isVideo: false,
        videoUrl: '',
        promotionType: '',
        clientFeedback: '',
        projectDate: '',
      });
      
      setIsAddingItem(false);
    }
  };
  
  const handleRemovePortfolioItem = (id: string) => {
    const updatedItems = portfolioItems.filter(item => item.id !== id);
    setPortfolioItems(updatedItems);
  };
  
  // Finally, update the handleSubmit function to send data to the backend
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create a very simplified version of the data to send to the server
      // This will be much lighter and have fewer potential issues
      const simpleData = {
        images: galleryImages.map((img: any) => typeof img === 'string' ? img : (img as any).url || '').filter(Boolean),
        videos: galleryVideos.map((vid: any) => typeof vid === 'string' ? vid : (vid as any).url || '').filter(Boolean),
        portfolioLinks: portfolioLinks.map(link => typeof link === 'string' ? link : link.url || '').filter(Boolean),
        // Format portfolio items properly to match the backend schema
        portfolio: portfolioItems.map(item => ({
          id: item.id || `portfolio-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: item.title || 'Portfolio Item',
          image: item.image || '',
          category: item.category || 'general',
          client: item.client || 'Client',
          description: item.description || '',
          isVideo: Boolean(item.isVideo),
          videoUrl: item.videoUrl || '',
          promotionType: item.promotionType || '',
          clientFeedback: item.clientFeedback || '',
          projectDate: item.projectDate || '',
          sortOrder: portfolioItems.indexOf(item)
        }))
      };

      console.log('Sending simplified gallery data:', {
        imagesCount: simpleData.images.length,
        videosCount: simpleData.videos.length,
        linksCount: simpleData.portfolioLinks.length,
        portfolioCount: simpleData.portfolio.length,
      });
      
      // Save to localStorage first as a safety backup
      try {
        localStorage.setItem('galleryData_backup', JSON.stringify(simpleData));
        console.log('Backup saved to localStorage');
      } catch (storageError) {
        console.warn('Failed to save backup to localStorage:', storageError);
      }
      
      // Use the direct API function to save gallery data
      try {
        const response = await saveGalleryPortfolio(simpleData);
        console.log('Gallery and portfolio saved successfully:', response);
        
        // Check if response came from localStorage fallback
        if (response && response.source === 'localStorage') {
          toast.success('Your data has been saved locally. You can continue to the next step.');
        } else {
          toast.success('Gallery and portfolio data saved successfully!');
        }
        
        // Navigate to publish step
        router.push('/creator-setup/publish');
      } catch (apiError: any) {
        console.error('API call failed:', apiError);
        
        // More comprehensive error handling
        let errorMessage = 'Failed to save gallery data. Please try again.';
        
        if (apiError.message) {
          if (apiError.message.includes('authorized') || apiError.message.includes('authenticated')) {
            errorMessage = 'Authentication error. Please check your creator permissions and try again.';
            // Try to upgrade role
            try {
              toast.success('Attempting to upgrade to creator role...');
              await upgradeToCreator();
              toast.success('Role upgraded. Please try submitting again.');
            } catch (upgradeError) {
              console.error('Role upgrade failed:', upgradeError);
            }
          } else if (apiError.message.includes('500')) {
            errorMessage = 'Server error. The gallery data could not be processed.';
            
            // Try with even simpler data directly
            try {
              toast.success('Trying a simplified approach...');
              
              // Extremely minimal data with just one image and one portfolio item
              const minimalData = {
                images: ['https://placehold.co/600x400?text=Gallery+Image'],
                videos: [],
                portfolioLinks: [],
                portfolio: [{
                  id: `portfolio-fallback-${Date.now()}`,
                  title: 'Sample Portfolio Item',
                  image: 'https://placehold.co/600x400?text=Portfolio+Item',
                  category: 'general',
                  client: 'Sample Client',
                  description: 'This is a fallback portfolio item created during error recovery.',
                  isVideo: false,
                  videoUrl: '',
                  promotionType: 'Sample',
                  clientFeedback: '',
                  projectDate: new Date().toLocaleDateString(),
                  sortOrder: 0
                }]
              };
              
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('Not authenticated');
              }
              
              const minimalResponse = await fetch('http://localhost:5001/api/creators/gallery', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(minimalData)
              });
              
              if (minimalResponse.ok) {
                // Success with minimal data
                toast.success('Successfully saved minimal gallery data!');
                // Navigate to publish step
                router.push('/creator-setup/publish');
                return;
              } else {
                console.error('Minimal data approach failed:', minimalResponse.status);
              }
            } catch (minimalError) {
              console.error('Error with minimal data approach:', minimalError);
            }
          } else if (apiError.message.includes('Network Error') || apiError.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            // Use the error message from the API
            errorMessage = apiError.message;
          }
        }
        
        toast.error(errorMessage);
        
        // Even if API failed, localStorage backup has already been saved.
        // Offer option to continue anyway
        toast.success('Your data has been saved locally as backup. You can still continue to the next step.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save gallery data');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add debugging function
  const handleCheckUserRole = async () => {
    try {
      setIsCheckingUser(true);
      const info = await checkUserRoleAndId();
      setUserInfo(info);
      
      if (!info.authenticated) {
        toast.error('User authentication issue: ' + info.message);
      } else if (info.userData?.role !== 'creator') {
        toast.error('User does not have creator role. Current role: ' + (info.userData?.role || 'none'));
      } else {
        toast.success('User has creator role: ' + info.userData.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      toast.error('Failed to check user role');
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Add role upgrade function
  const handleUpgradeToCreator = async () => {
    try {
      setIsUpgrading(true);
      await upgradeToCreator();
      toast.success('Successfully upgraded to creator role');
      // Refresh user info
      await handleCheckUserRole();
    } catch (error) {
      console.error('Error upgrading role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade role');
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Add this function to directly test the backend connection
  const testDirectBackendConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Testing direct backend connection...');
      
      // Try a simpler endpoint first to verify connectivity
      const testResponse = await fetch('http://localhost:5001/api/creators/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test: true })
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        toast.success('Backend connection successful!');
        console.log('Test endpoint response:', data);
      } else {
        toast.error(`Backend connection failed: ${testResponse.status}`);
        console.error('Test endpoint failed:', testResponse.status, testResponse.statusText);
      }
    } catch (error) {
      toast.error('Backend connection error');
      console.error('Test connection error:', error);
    }
  };

  // Function to directly create a minimal gallery document
  const createMinimalGallery = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Creating minimal gallery record...');
      
      // Simple minimal data structure
      const minimalData = {
        images: [
          {
            url: 'https://placehold.co/800x600?text=Test+Image',
            title: 'Test Image',
            description: 'Test description',
            tags: ['test'],
            order: 0
          }
        ],
        videos: [],
        portfolioLinks: [
          {
            url: 'https://example.com',
            title: 'Example Link'
          }
        ],
        portfolio: [
          {
            title: 'Test Portfolio Item',
            image: 'https://placehold.co/800x600?text=Test+Portfolio',
            category: 'general',
            client: 'Test Client',
            description: 'Test portfolio description',
            isVideo: false,
            videoUrl: '',
            promotionType: 'Test',
            clientFeedback: 'Great!',
            projectDate: 'January 2023',
            sortOrder: 0
          }
        ]
      };
      
      const response = await fetch('http://localhost:5001/api/creators/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(minimalData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Minimal gallery saved successfully!');
        console.log('Minimal gallery response:', data);
      } else {
        toast.error(`Failed to create minimal gallery: ${response.status}`);
        console.error('Minimal gallery failed:', response.status, response.statusText);
        
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
    } catch (error) {
      toast.error('Error creating minimal gallery');
      console.error('Minimal gallery error:', error);
    }
  };
  
  // Function to directly test gallery storage
  const testGalleryStorage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Testing gallery storage endpoint...');
      
      const testResponse = await fetch('http://localhost:5001/api/creators/test-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        toast.success('Gallery test storage successful!');
        console.log('Gallery test storage response:', data);
        
        // Show verification data
        if (data.data?.verification) {
          console.log('Verification data:', data.data.verification);
          toast(`Stored ${data.data.verification.imagesCount} images, ${data.data.verification.portfolioCount} portfolio items`);
        }
      } else {
        toast.error(`Gallery test storage failed: ${testResponse.status}`);
        console.error('Gallery test failed:', testResponse.status, testResponse.statusText);
        
        try {
          const errorData = await testResponse.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
    } catch (error) {
      toast.error('Gallery test connection error');
      console.error('Gallery test error:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={6} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Add Your Gallery & Portfolio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Showcase your work with images, videos, and portfolio pieces to attract potential clients.
          </p>
          
          {/* Debug panel toggle */}
          <button 
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center mx-auto"
          >
            <Info className="w-3 h-3 mr-1" />
            {showDebugPanel ? 'Hide Debug Tools' : 'Show Debug Tools'}
          </button>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Troubleshooting Tools</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={handleCheckUserRole}
                disabled={isCheckingUser}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                {isCheckingUser ? 'Checking...' : 'Check User Role'}
              </button>
              
              <button
                onClick={handleUpgradeToCreator}
                disabled={isUpgrading}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                {isUpgrading ? 'Upgrading...' : 'Upgrade to Creator'}
              </button>
              
              <button
                onClick={testDirectBackendConnection}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                Test Backend Connection
              </button>
              
              <button
                onClick={createMinimalGallery}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                Create Minimal Gallery
              </button>
              
              <button
                onClick={testGalleryStorage}
                className="bg-pink-50 text-pink-600 px-3 py-1 rounded border border-pink-200 text-sm hover:bg-pink-100"
              >
                Test Gallery Storage API
              </button>
            </div>
            
            {userInfo && (
              <div className="bg-white p-3 rounded border border-gray-200 text-xs font-mono overflow-auto max-h-32 text-gray-700">
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Gallery Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Images & Videos</h2>
            <p className="text-gray-600 mb-4">
              Add high-quality visuals that showcase your work. Clients will see these on your profile.
            </p>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Images & Videos</label>
              
              <div className="mb-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images & Videos (Max 5MB each)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*" 
                      multiple 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              {isUploading && (
                <div className="flex items-center justify-center my-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
              )}
              
              {/* Gallery Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {galleryImages.map((image, index) => (
                  <div key={`image-${index}`} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={image} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {galleryVideos.map((video, index) => (
                  <div key={`video-${index}`} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
                    <FileVideo className="w-10 h-10 text-white" />
                    <button
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-purple-600">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
              My Past Work
            </h2>
            <p className="text-gray-600 mb-6 border-l-4 border-purple-200 pl-3 italic">
              Showcase your best work to potential brands. Include client information, project descriptions, and the results you achieved. This helps brands understand your expertise and style.
            </p>
            
            {portfolioItems.length > 0 ? (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {portfolioItems.map(item => (
                    <div key={item.id} className="relative group bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                      <div className="relative h-56">
                        {item.isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <iframe 
                              src={item.videoUrl} 
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div className="relative w-full h-full overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemovePortfolioItem(item.id)}
                          className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                          <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            {categories.find(c => c.id === item.category)?.name || item.category}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Client:</span> {item.client}</p>
                          </div>
                          
                          {item.promotionType && (
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Campaign Type:</span> {item.promotionType}</p>
                            </div>
                          )}
                          
                          {item.projectDate && (
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Date:</span> {item.projectDate}</p>
                            </div>
                          )}
                        </div>
                        
                        {item.description && (
                          <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </div>
                        )}
                        
                        {item.clientFeedback && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm italic text-gray-700 relative">
                            <svg className="absolute top-0 left-0 w-6 h-6 text-amber-300 transform -translate-x-2 -translate-y-2" fill="currentColor" viewBox="0 0 32 32">
                              <path d="M9.352 4C4.582 7.552 1.5 13.648 1.5 15.594c0 1.6 0.82 3.25 2.578 3.25 1.664 0 3.218-1.91 4.171-3.344 0.253-0.38 0.692-1.092 0.921-1.594 0.46-1.188-0.619-1.5-1.765-1.406-0.483 0.038-0.927 0.106-1.328 0.188 0.245-0.866 0.805-2.766 3.328-4.906 0.159-0.133 0.756-0.328 0.756-0.328 0.205-0.094 0.344-0.302 0.344-0.531 0-0.321-0.262-0.594-0.594-0.594-0.28 0-0.491 0.18-0.559 0.406v-0.001c0 0-0.112 0.307-0.855 0.812-0.734 0.498-1.109 0.906-1.456 1.234-0.644 0.614-0.834 0.864-0.834 0.864-0.215 0.225-0.284 0.306-0.198 0.059 0.302-0.871 0.422-1.764 1.074-2.967 0.103-0.191 0.098-0.387 0.098-0.387 0-0.37-0.282-0.648-0.648-0.648-0.149 0-0.338 0.104-0.437 0.248 0 0-1.17 1.597-1.094 5.305 0 0 0.033 0.177-0.218 0.177-0.334 0-0.668-0.137-0.668-0.137s-0.11-0.041-0.11-0.177c0-0.137 0.068-0.217 0.068-0.217 0.172-0.284 0.616-1.353 0.755-1.865 0.123-0.452 0.033-0.865-0 0" />
                              <path d="M23.538 4C18.768 7.552 15.686 13.648 15.686 15.594c0 1.6 0.82 3.25 2.578 3.25 1.664 0 3.218-1.91 4.171-3.344 0.253-0.38 0.692-1.092 0.921-1.594 0.46-1.188-0.619-1.5-1.765-1.406-0.483 0.038-0.927 0.106-1.328 0.188 0.245-0.866 0.805-2.766 3.328-4.906 0.159-0.133 0.756-0.328 0.756-0.328 0.205-0.094 0.344-0.302 0.344-0.531 0-0.321-0.262-0.594-0.594-0.594-0.28 0-0.491 0.18-0.559 0.406v-0.001c0 0-0.112 0.307-0.855 0.812-0.734 0.498-1.109 0.906-1.456 1.234-0.644 0.614-0.834 0.864-0.834 0.864-0.215 0.225-0.284 0.306-0.198 0.059 0.302-0.871 0.422-1.764 1.074-2.967 0.103-0.191 0.098-0.387 0.098-0.387 0-0.37-0.282-0.648-0.648-0.648-0.149 0-0.338 0.104-0.437 0.248 0 0-1.17 1.597-1.094 5.305 0 0 0.033 0.177-0.218 0.177-0.334 0-0.668-0.137-0.668-0.137s-0.11-0.041-0.11-0.177c0-0.137 0.068-0.217 0.068-0.217 0.172-0.284 0.616-1.353 0.755-1.865 0.123-0.452 0.033-0.865-0-0" />
                            </svg>
                            <p className="relative z-10">"{item.clientFeedback}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-8">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Work Samples Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md text-center">
                  Showcase your previous work to attract more clients. Add details about past projects, client feedback, and results you achieved.
                </p>
                <Button 
                  onClick={() => setIsAddingItem(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your Past Work
                </Button>
              </div>
            )}
            
            {isAddingItem ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-purple-600" />
                    Add New Work Sample
                  </h3>
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Summer Collection Campaign"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.client}
                      onChange={(e) => setNewItem({ ...newItem, client: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.client ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Fashion Brand Co."
                    />
                    {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Date</label>
                    <input
                      type="text"
                      value={newItem.projectDate}
                      onChange={(e) => setNewItem({ ...newItem, projectDate: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="e.g. June 2023"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign/Promotion Type <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.promotionType}
                      onChange={(e) => setNewItem({ ...newItem, promotionType: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.promotionType ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Instagram Product Campaign, YouTube Review"
                    />
                    {errors.promotionType && <p className="mt-1 text-sm text-red-500">{errors.promotionType}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Description <span className="text-red-500">*</span></label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      rows={3}
                      placeholder="Describe what you did, your approach, and the results achieved"
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Feedback</label>
                    <textarea
                      value={newItem.clientFeedback}
                      onChange={(e) => setNewItem({ ...newItem, clientFeedback: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      rows={2}
                      placeholder="What did the client say about your work? Any testimonials?"
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-3">
                      <label className="text-sm font-medium text-gray-700 mr-4">Media Type</label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={!newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: false })}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Image</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: true })}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Video URL</span>
                        </label>
                      </div>
                    </div>
                    
                    {newItem.isVideo ? (
                      <div>
                        <input
                          type="text"
                          value={newItem.videoUrl}
                          onChange={(e) => setNewItem({ ...newItem, videoUrl: e.target.value })}
                          className={`w-full p-2.5 border ${
                            errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        />
                        {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>}
                      </div>
                    ) : (
                      <div>
                        {newItem.image ? (
                          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={newItem.image}
                              alt="Portfolio preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNewItem({ ...newItem, image: '' })}
                              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <label className="cursor-pointer flex flex-col items-center p-6">
                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handlePortfolioImageUpload}
                                />
                              </label>
                            </div>
                            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingItem(false)}
                    className="px-5 py-2.5"
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPortfolioItem}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                    type="button"
                  >
                    Add to Portfolio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-6">
                {/* <Button
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add New Work Sample</span>
                </Button> */}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/creator-setup/pricing')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleSubmit}
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
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 