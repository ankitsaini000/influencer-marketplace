'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Image, X, Upload, Plus, ArrowRight, ArrowLeft, Link as LinkIcon, Trash2 } from 'lucide-react';

export const CreatorGallery = () => {
  const router = useRouter();
  
  const [gallery, setGallery] = useState<{
    images: string[];
    videos: string[];
    portfolioLinks: Array<{ title: string; url: string }>;
  }>({
    images: [],
    videos: [],
    portfolioLinks: []
  });
  
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  useEffect(() => {
    // Load existing data from local storage if available
    const savedData = localStorage.getItem('creatorGallery');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGallery(parsedData);
      } catch (e) {
        console.error('Error parsing saved gallery data', e);
      }
    }
  }, []);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file (in a real app, this would be API calls)
    const promises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    // When all files are processed
    Promise.all(promises).then(newImages => {
      const updatedGallery = {
        ...gallery,
        images: [...gallery.images, ...newImages]
      };
      setGallery(updatedGallery);
      
      // Save to local storage
      localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
      setIsUploading(false);
    });
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...gallery.images];
    updatedImages.splice(index, 1);
    
    const updatedGallery = {
      ...gallery,
      images: updatedImages
    };
    
    setGallery(updatedGallery);
    localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
  };
  
  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      setErrors({ videoUrl: 'Video URL is required' });
      return;
    }
    
    if (!isValidUrl(videoUrl)) {
      setErrors({ videoUrl: 'Please enter a valid URL' });
      return;
    }
    
    const updatedGallery = {
      ...gallery,
      videos: [...gallery.videos, videoUrl]
    };
    
    setGallery(updatedGallery);
    localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
    setVideoUrl('');
    setErrors({});
  };
  
  const handleRemoveVideo = (index: number) => {
    const updatedVideos = [...gallery.videos];
    updatedVideos.splice(index, 1);
    
    const updatedGallery = {
      ...gallery,
      videos: updatedVideos
    };
    
    setGallery(updatedGallery);
    localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
  };
  
  const validateLink = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newLink.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newLink.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(newLink.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleAddLink = () => {
    if (validateLink()) {
      const updatedGallery = {
        ...gallery,
        portfolioLinks: [...gallery.portfolioLinks, { ...newLink }]
      };
      
      setGallery(updatedGallery);
      localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
      setNewLink({ title: '', url: '' });
    }
  };
  
  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...gallery.portfolioLinks];
    updatedLinks.splice(index, 1);
    
    const updatedGallery = {
      ...gallery,
      portfolioLinks: updatedLinks
    };
    
    setGallery(updatedGallery);
    localStorage.setItem('creatorGallery', JSON.stringify(updatedGallery));
  };
  
  const handleSubmit = () => {
    // Save data to local storage (already done on each update)
    // Navigate to the next step
    router.push('/creator-setup/portfolio');
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Step 6 of 8</span>
          <span>Gallery</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Gallery</h1>
        <p className="text-gray-600 mb-6">Add images, videos, and portfolio links to showcase your work and style.</p>
        
        {/* Images Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Images</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {gallery.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                <img 
                  src={image} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Upload image button */}
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50 transition-colors">
              {isUploading ? (
                <div className="animate-spin h-8 w-8 border-2 border-purple-600 rounded-full border-t-transparent"></div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500">Upload high-quality images that showcase your work. PNG, JPG, WebP formats supported (max 5MB per image).</p>
        </div>
        
        {/* Videos Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Videos</h2>
          
          <div className="mb-4">
            {gallery.videos.length > 0 ? (
              <div className="space-y-3 mb-4">
                {gallery.videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="truncate flex-1">
                      <a 
                        href={video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline truncate block"
                      >
                        {video}
                      </a>
                    </div>
                    <button
                      onClick={() => handleRemoveVideo(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">No videos added yet</p>
            )}
            
            <div className="flex">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  if (errors.videoUrl) setErrors({});
                }}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className={`flex-1 p-2 border rounded-l-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.videoUrl ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                onClick={handleAddVideo}
                className="bg-purple-600 text-white px-4 rounded-r-md hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
            {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>}
          </div>
          
          <p className="text-xs text-gray-500">Add links to videos from platforms like YouTube, Vimeo, or other hosting services.</p>
        </div>
        
        {/* Portfolio Links Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Portfolio Links</h2>
          
          {gallery.portfolioLinks.length > 0 ? (
            <div className="space-y-3 mb-4">
              {gallery.portfolioLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="truncate mr-2">
                    <div className="font-medium">{link.title}</div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleRemoveLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">No portfolio links added yet</p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <div>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => {
                  setNewLink({ ...newLink, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Title (e.g., Personal Website)"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => {
                  setNewLink({ ...newLink, url: e.target.value });
                  if (errors.url) setErrors({ ...errors, url: '' });
                }}
                placeholder="URL (e.g., https://example.com)"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>}
            </div>
          </div>
          
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleAddLink}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">Add links to your portfolio websites, Behance, Dribbble, or other platforms where clients can see more of your work.</p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/creator-setup/pricing')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex items-center space-x-2"
        >
          <span>Next Step</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
