'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Upload, X, Image, Plus, FileVideo } from 'lucide-react';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { toast } from 'react-hot-toast';

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
  
  // Gallery functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      console.log(`Processing ${files.length} gallery files`);
      
      let successCount = 0;
      let errorCount = 0;
      
      Array.from(files).forEach(file => {
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
            setGalleryImages(prev => [...prev, result]);
            successCount++;
            console.log(`Added image: ${file.name}`);
          } else if (file.type.startsWith('video/')) {
            setGalleryVideos(prev => [...prev, result]);
            successCount++;
            console.log(`Added video: ${file.name}`);
          } else {
            console.error('Unsupported file type:', file.type);
            errorCount++;
          }
          
          // Check if all files have been processed
          if (successCount + errorCount === files.length) {
            setIsUploading(false);
            if (successCount > 0) {
              toast.success(`Successfully added ${successCount} files to your gallery.`);
            }
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file:', file.name);
          errorCount++;
          
          // Check if all files have been processed
          if (successCount + errorCount === files.length) {
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
  
  // Portfolio functions
  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('Image loaded successfully, size:', result.length);
        setNewItem({ ...newItem, image: result });
        setIsUploading(false);
        
        // Clear any previous errors
        if (errors.image) {
          const newErrors = { ...errors };
          delete newErrors.image;
          setErrors(newErrors);
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        toast.error('Failed to load image. Please try again with a different file.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
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
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Save gallery data to local storage
    const galleryData = {
      images: galleryImages,
      videos: galleryVideos,
      portfolioLinks: portfolioLinks
    };
    
    console.log('Saving gallery data to localStorage:', galleryData);
    localStorage.setItem('creatorGallery', JSON.stringify(galleryData));
    
    // Save portfolio data to local storage
    console.log('Saving portfolio data to localStorage:', portfolioItems);
    localStorage.setItem('creatorPortfolio', JSON.stringify(portfolioItems));
    
    // Log all stored creator data for debugging
    console.log('All creator data in localStorage:');
    console.log('- Personal Info:', localStorage.getItem('creatorPersonalInfo'));
    console.log('- Professional Info:', localStorage.getItem('creatorProfessionalInfo'));
    console.log('- Description & FAQ:', localStorage.getItem('creatorDescriptionFaq'));
    console.log('- Social Media:', localStorage.getItem('creatorSocialMedia'));
    console.log('- Pricing:', localStorage.getItem('creatorPricing'));
    console.log('- Gallery:', localStorage.getItem('creatorGallery'));
    console.log('- Portfolio:', localStorage.getItem('creatorPortfolio'));
    
    // Navigate to the publish step
    router.push('/creator-setup/publish');
    setIsSubmitting(false);
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
        </div>

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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Projects</h2>
            <p className="text-gray-600 mb-4">
              Add detailed information about your past projects to demonstrate your expertise.
            </p>
            
            {portfolioItems.length > 0 ? (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.map(item => (
                    <div key={item.id} className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-md">
                      <div className="relative h-48">
                        {item.isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <div className="text-white">Video Content</div>
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          onClick={() => handleRemovePortfolioItem(item.id)}
                          className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <div className="flex flex-col space-y-1 mt-1">
                          <p className="text-sm text-gray-500"><span className="font-medium">Client:</span> {item.client}</p>
                          {item.promotionType && (
                            <p className="text-sm text-gray-500"><span className="font-medium">Promotion:</span> {item.promotionType}</p>
                          )}
                          {item.projectDate && (
                            <p className="text-sm text-gray-500"><span className="font-medium">Date:</span> {item.projectDate}</p>
                          )}
                          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {categories.find(c => c.id === item.category)?.name || item.category}
                          </span>
                        </div>
                        {item.clientFeedback && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded-md text-xs italic text-gray-700">
                            "{item.clientFeedback}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-8">
                <Image className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">No portfolio items added yet</p>
              </div>
            )}
            
            {isAddingItem ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Portfolio Item</h3>
                
                <div className="grid gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className={`w-full p-2 border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="Project Title"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      value={newItem.client}
                      onChange={(e) => setNewItem({ ...newItem, client: e.target.value })}
                      className={`w-full p-2 border ${
                        errors.client ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="Client Name"
                    />
                    {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full p-2 border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      rows={3}
                      placeholder="Brief description of the project"
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type</label>
                    <input
                      type="text"
                      value={newItem.promotionType}
                      onChange={(e) => setNewItem({ ...newItem, promotionType: e.target.value })}
                      className={`w-full p-2 border ${
                        errors.promotionType ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="e.g. Social Media Campaign, Product Launch"
                    />
                    {errors.promotionType && <p className="mt-1 text-sm text-red-500">{errors.promotionType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Date</label>
                    <input
                      type="text"
                      value={newItem.projectDate}
                      onChange={(e) => setNewItem({ ...newItem, projectDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. March 2023"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Feedback</label>
                    <textarea
                      value={newItem.clientFeedback}
                      onChange={(e) => setNewItem({ ...newItem, clientFeedback: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Share what the client said about your work"
                    ></textarea>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 mr-4">Media Type</label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={!newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: false })}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Image</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: true })}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                          className={`w-full p-2 border ${
                            errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        />
                        {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>}
                      </div>
                    ) : (
                      <div>
                        {newItem.image ? (
                          <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={newItem.image}
                              alt="Portfolio preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNewItem({ ...newItem, image: '' })}
                              className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-md h-32">
                              <label className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">Upload image</span>
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
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingItem(false)}
                    className="px-4 py-2"
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPortfolioItem}
                    className="px-4 py-2"
                    type="button"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add Portfolio Item</span>
                </Button>
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