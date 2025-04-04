"use client";

import { useState, useEffect } from "react";
import { useCreatorProfileStore, CreatorProfile } from "../../store/creatorProfileStore";
import { DashboardLayout } from "../layout/DashboardLayout";
import { 
  Upload, 
  Save, 
  CreditCard, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Globe, 
  MapPin, 
  CheckCircle, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  HelpCircle,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

export const CreatorProfileEdit = () => {
  const { currentProfile, updateCurrentProfile, saveToLocalStorage, loadFromLocalStorage } = useCreatorProfileStore();
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [availableForEvents, setAvailableForEvents] = useState(true);
  
  // Load profile data on component mount
  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (!loaded) {
      toast.error("Failed to load profile data");
    }
  }, [loadFromLocalStorage]);
  
  // Save profile data
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      saveToLocalStorage();
      setIsSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };
  
  // Update a section of the profile
  const updateSection = (section: keyof CreatorProfile, data: any) => {
    updateCurrentProfile(section, data);
  };
  
  // Handle personal info updates
  const handlePersonalInfoUpdate = (field: string, value: any) => {
    const updatedPersonalInfo = {
      ...currentProfile.personalInfo,
      [field]: value
    };
    updateSection('personalInfo', updatedPersonalInfo);
  };
  
  // Handle basic info updates
  const handleBasicInfoUpdate = (field: string, value: any) => {
    const updatedBasicInfo = {
      ...currentProfile.basicInfo,
      [field]: value
    };
    updateSection('basicInfo', updatedBasicInfo);
  };
  
  // Handle pricing package updates
  const handlePackageUpdate = (packageType: 'basic' | 'standard' | 'premium', field: string, value: any) => {
    const updatedPackages = {
      ...currentProfile.pricing?.packages,
      [packageType]: {
        ...currentProfile.pricing?.packages?.[packageType],
        [field]: value
      }
    };
    updateSection('pricing', { packages: updatedPackages });
  };
  
  // Handle description updates
  const handleDescriptionUpdate = (field: string, value: any) => {
    const updatedDescription = {
      ...currentProfile.description,
      [field]: value
    };
    updateSection('description', updatedDescription);
  };
  
  // Handle social media updates
  const handleSocialInfoUpdate = (platform: string, value: string) => {
    const updatedSocialInfo = {
      ...currentProfile.socialInfo,
      [platform]: value
    };
    updateSection('socialInfo', updatedSocialInfo);
  };

  // Add a FAQ item
  const handleAddFaq = () => {
    const currentFaqs = currentProfile.description?.faq || [];
    const updatedFaqs = [...currentFaqs, { question: '', answer: '' }];
    updateSection('description', { faq: updatedFaqs });
  };

  // Remove a FAQ item
  const handleRemoveFaq = (index: number) => {
    const currentFaqs = currentProfile.description?.faq || [];
    const updatedFaqs = currentFaqs.filter((_, i) => i !== index);
    updateSection('description', { faq: updatedFaqs });
  };

  // Update a FAQ item
  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const currentFaqs = currentProfile.description?.faq || [];
    const updatedFaqs = currentFaqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    updateSection('description', { faq: updatedFaqs });
  };

  // Add a skill
  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    
    const currentSkills = currentProfile.personalInfo?.skills || [];
    if (currentSkills.includes(skill)) return;
    
    const updatedSkills = [...currentSkills, skill];
    updateSection('personalInfo', { skills: updatedSkills });
  };

  // Remove a skill
  const handleRemoveSkill = (skill: string) => {
    const currentSkills = currentProfile.personalInfo?.skills || [];
    const updatedSkills = currentSkills.filter(s => s !== skill);
    updateSection('personalInfo', { skills: updatedSkills });
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        updateSection('personalInfo', { profileImage: reader.result as string });
      } else {
        const currentGallery = currentProfile.gallery?.images || [];
        updateSection('gallery', { images: [...currentGallery, reader.result as string] });
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = currentProfile.gallery?.images || [];
    const updatedGallery = currentGallery.filter((_, i) => i !== index);
    updateSection('gallery', { images: updatedGallery });
  };

  // Add portfolio link
  const handleAddPortfolioLink = (title: string, url: string) => {
    if (!title.trim() || !url.trim()) return;
    
    const currentLinks = currentProfile.gallery?.portfolioLinks || [];
    const updatedLinks = [...currentLinks, { title, url }];
    updateSection('gallery', { portfolioLinks: updatedLinks });
  };

  // Remove portfolio link
  const handleRemovePortfolioLink = (index: number) => {
    const currentLinks = currentProfile.gallery?.portfolioLinks || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== index);
    updateSection('gallery', { portfolioLinks: updatedLinks });
  };

  // Navigation tabs
  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'basic', label: 'Professional Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'description', label: 'Description & FAQs' },
    { id: 'social', label: 'Social Media' },
    { id: 'portfolio', label: 'Portfolio & Gallery' },
    { id: 'availability', label: 'Availability' },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pt-6 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Your Creator Profile</h1>
              <p className="text-gray-600">Update your profile information to showcase your work and attract clients</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
              <Save className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex min-w-max">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content based on active tab */}
            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Personal Information</h2>
                  
                  {/* Profile Image */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {currentProfile.personalInfo?.profileImage ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden">
                          <img 
                            src={currentProfile.personalInfo.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={() => handlePersonalInfoUpdate('profileImage', '')}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer">
                          <Upload className="w-6 h-6 text-gray-500" />
                          <span className="text-xs text-gray-500 mt-1">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'profile')}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-gray-500">Recommended size: 400x400px</p>
                    </div>
                  </div>

                  {/* Basic details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={currentProfile.personalInfo?.fullName || ''}
                        onChange={(e) => handlePersonalInfoUpdate('fullName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={currentProfile.personalInfo?.username || ''}
                        onChange={(e) => handlePersonalInfoUpdate('username', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="@username"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={currentProfile.personalInfo?.bio || ''}
                        onChange={(e) => handlePersonalInfoUpdate('bio', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="A brief summary about yourself"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={currentProfile.personalInfo?.location || ''}
                          onChange={(e) => handlePersonalInfoUpdate('location', e.target.value)}
                          className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(currentProfile.personalInfo?.skills || []).map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        id="newSkill"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        placeholder="Add a skill"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('newSkill') as HTMLInputElement;
                          handleAddSkill(input.value);
                          input.value = '';
                        }}
                        className="bg-purple-600 text-white px-4 rounded-r-md hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Professional Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={currentProfile.basicInfo?.title || ''}
                        onChange={(e) => handleBasicInfoUpdate('title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. Fashion Influencer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={currentProfile.basicInfo?.category || ''}
                        onChange={(e) => handleBasicInfoUpdate('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a category</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Travel">Travel</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Food">Food</option>
                        <option value="Technology">Technology</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Business">Business</option>
                        <option value="Art">Art</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        value={currentProfile.basicInfo?.yearsOfExperience || ''}
                        onChange={(e) => handleBasicInfoUpdate('yearsOfExperience', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 5"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                      <input
                        type="text"
                        value={currentProfile.basicInfo?.expertise?.join(', ') || ''}
                        onChange={(e) => handleBasicInfoUpdate('expertise', e.target.value.split(',').map(lang => lang.trim()))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="English, Spanish, etc."
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate languages with commas</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                    <textarea
                      value={currentProfile.basicInfo?.subcategory || ''}
                      onChange={(e) => handleBasicInfoUpdate('subcategory', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                      placeholder="Describe your professional background, expertise, and goals"
                    ></textarea>
                  </div>
                </div>
              )}
              
              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Pricing Packages</h2>
                  <p className="text-sm text-gray-500">Create different packages to offer various levels of service to your clients</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Package */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium mb-4">Basic Package</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                          <input
                            type="text"
                            value={currentProfile.pricing?.packages?.basic?.name || 'Basic'}
                            onChange={(e) => handlePackageUpdate('basic', 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g. Basic"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.basic?.price || ''}
                              onChange={(e) => handlePackageUpdate('basic', 'price', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="99"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.basic?.deliveryTime || ''}
                              onChange={(e) => handlePackageUpdate('basic', 'deliveryTime', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="3"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={currentProfile.pricing?.packages?.basic?.description || ''}
                            onChange={(e) => handlePackageUpdate('basic', 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="What's included in this package"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Standard Package */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium mb-4">Standard Package</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                          <input
                            type="text"
                            value={currentProfile.pricing?.packages?.standard?.name || 'Standard'}
                            onChange={(e) => handlePackageUpdate('standard', 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g. Standard"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.standard?.price || ''}
                              onChange={(e) => handlePackageUpdate('standard', 'price', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="199"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.standard?.deliveryTime || ''}
                              onChange={(e) => handlePackageUpdate('standard', 'deliveryTime', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="5"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={currentProfile.pricing?.packages?.standard?.description || ''}
                            onChange={(e) => handlePackageUpdate('standard', 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="What's included in this package"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium Package */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-purple-700">Premium Package</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                          <input
                            type="text"
                            value={currentProfile.pricing?.packages?.premium?.name || 'Premium'}
                            onChange={(e) => handlePackageUpdate('premium', 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g. Premium"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.premium?.price || ''}
                              onChange={(e) => handlePackageUpdate('premium', 'price', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="499"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={currentProfile.pricing?.packages?.premium?.deliveryTime || ''}
                              onChange={(e) => handlePackageUpdate('premium', 'deliveryTime', parseInt(e.target.value))}
                              className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                              placeholder="7"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={currentProfile.pricing?.packages?.premium?.description || ''}
                            onChange={(e) => handlePackageUpdate('premium', 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="What's included in this package"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Description & FAQs Tab */}
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Description & FAQs</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                      <input
                        type="text"
                        value={currentProfile.description?.brief || ''}
                        onChange={(e) => handleDescriptionUpdate('brief', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="A short one-liner about your services"
                      />
                      <p className="text-xs text-gray-500 mt-1">This will appear in search results (max 100 characters)</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                      <textarea
                        value={currentProfile.description?.detailed || ''}
                        onChange={(e) => handleDescriptionUpdate('detailed', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={6}
                        placeholder="Describe your services, expertise, and what makes you unique"
                      ></textarea>
                    </div>
                    
                    {/* FAQs */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium">Frequently Asked Questions</h3>
                        <button
                          onClick={handleAddFaq}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        >
                          <Plus className="w-4 h-4" /> Add FAQ
                        </button>
                      </div>
                      
                      {(currentProfile.description?.faq || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                          <p>No FAQs added yet. Add FAQs to help potential clients understand your services better.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(currentProfile.description?.faq || []).map((faq, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <label className="block text-sm font-medium text-gray-700">Question {index + 1}</label>
                                <button
                                  onClick={() => handleRemoveFaq(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={faq.question || ''}
                                onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                                placeholder="e.g. What types of promotion do you offer?"
                              />
                              
                              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                              <textarea
                                value={faq.answer || ''}
                                onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Provide a clear and concise answer"
                              ></textarea>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Social Media</h2>
                  <p className="text-sm text-gray-500">Connect your social media accounts to showcase your online presence</p>
                  
                  <div className="space-y-4">
                    {/* Instagram */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-lg text-white">
                          <Instagram className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            instagram.com/
                          </span>
                          <input
                            type="text"
                            value={currentProfile.socialInfo?.instagram?.replace('https://instagram.com/', '') || ''}
                            onChange={(e) => handleSocialInfoUpdate('instagram', `https://instagram.com/${e.target.value}`)}
                            className="w-full p-2 border border-gray-300 rounded-r-md"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Twitter/X */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-black rounded-lg text-white">
                          <Twitter className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            twitter.com/
                          </span>
                          <input
                            type="text"
                            value={currentProfile.socialInfo?.twitter?.replace('https://twitter.com/', '') || ''}
                            onChange={(e) => handleSocialInfoUpdate('twitter', `https://twitter.com/${e.target.value}`)}
                            className="w-full p-2 border border-gray-300 rounded-r-md"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Facebook */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg text-white">
                          <Facebook className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            facebook.com/
                          </span>
                          <input
                            type="text"
                            value={currentProfile.socialInfo?.facebook?.replace('https://facebook.com/', '') || ''}
                            onChange={(e) => handleSocialInfoUpdate('facebook', `https://facebook.com/${e.target.value}`)}
                            className="w-full p-2 border border-gray-300 rounded-r-md"
                            placeholder="username or page name"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* LinkedIn */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-700 rounded-lg text-white">
                          <Linkedin className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            linkedin.com/in/
                          </span>
                          <input
                            type="text"
                            value={currentProfile.socialInfo?.linkedin?.replace('https://linkedin.com/in/', '') || ''}
                            onChange={(e) => handleSocialInfoUpdate('linkedin', `https://linkedin.com/in/${e.target.value}`)}
                            className="w-full p-2 border border-gray-300 rounded-r-md"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* YouTube */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-red-600 rounded-lg text-white">
                          <Youtube className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            youtube.com/c/
                          </span>
                          <input
                            type="text"
                            value={currentProfile.socialInfo?.youtube?.replace('https://youtube.com/c/', '') || ''}
                            onChange={(e) => handleSocialInfoUpdate('youtube', `https://youtube.com/c/${e.target.value}`)}
                            className="w-full p-2 border border-gray-300 rounded-r-md"
                            placeholder="channel name"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Website */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-lg text-white">
                          <Globe className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                        <input
                          type="text"
                          value={currentProfile.socialInfo?.website || ''}
                          onChange={(e) => handleSocialInfoUpdate('website', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Portfolio & Gallery Tab */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Portfolio & Gallery</h2>
                  <p className="text-sm text-gray-500">Showcase your past work and projects to attract potential clients</p>
                  
                  {/* Gallery Images */}
                  <div>
                    <h3 className="text-md font-medium mb-3">Gallery Images</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload images of your work or behind-the-scenes content</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {(currentProfile.gallery?.images || []).map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={image} 
                              alt={`Gallery image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload button */}
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Add Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'gallery')}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Portfolio Links */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-medium">Portfolio Items</h3>
                      <button
                        onClick={() => {
                          const titleInput = document.getElementById('newPortfolioTitle') as HTMLInputElement;
                          const urlInput = document.getElementById('newPortfolioUrl') as HTMLInputElement;
                          if (titleInput && urlInput) {
                            handleAddPortfolioLink(titleInput.value, urlInput.value);
                            titleInput.value = '';
                            urlInput.value = '';
                          }
                        }}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          id="newPortfolioTitle"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="e.g. Fashion Collection Campaign"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          id="newPortfolioUrl"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/your-work"
                        />
                      </div>
                    </div>
                    
                    {(currentProfile.gallery?.portfolioLinks || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                        <Globe className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No portfolio links added yet. Add links to showcase your past work.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(currentProfile.gallery?.portfolioLinks || []).map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{link.title}</h4>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                                {link.url}
                              </a>
                            </div>
                            <button
                              onClick={() => handleRemovePortfolioLink(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Availability Tab */}
              {activeTab === 'availability' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Availability</h2>
                  <p className="text-sm text-gray-500">Manage your availability and preferences for client bookings</p>
                  
                  {/* General Availability Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Available for Events</h3>
                      <p className="text-sm text-gray-500">Turn this on if you're open to in-person events and collaborations</p>
                    </div>
                    <div>
                      <button
                        onClick={() => setAvailableForEvents(!availableForEvents)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${availableForEvents ? 'bg-purple-600' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${availableForEvents ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Working Hours */}
                  <div>
                    <h3 className="text-md font-medium mb-3">Working Hours</h3>
                    <p className="text-sm text-gray-500 mb-4">Set your typical working hours to let clients know when to expect responses</p>
                    
                    <div className="space-y-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium w-28">{day}</span>
                          <div className="flex items-center gap-3">
                            <select className="p-2 border border-gray-300 rounded-md">
                              <option>9:00 AM</option>
                              <option>10:00 AM</option>
                              <option>11:00 AM</option>
                              <option>12:00 PM</option>
                              <option>Off</option>
                            </select>
                            <span className="text-gray-500">to</span>
                            <select className="p-2 border border-gray-300 rounded-md">
                              <option>5:00 PM</option>
                              <option>6:00 PM</option>
                              <option>7:00 PM</option>
                              <option>8:00 PM</option>
                              <option>Off</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Response Time */}
                  <div>
                    <h3 className="text-md font-medium mb-3">Average Response Time</h3>
                    <p className="text-sm text-gray-500 mb-4">How quickly do you typically respond to client inquiries?</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['Within hours', 'Same day', 'Within 48 hours', 'Within a week'].map((time) => (
                        <div key={time} className="relative">
                          <input
                            type="radio"
                            id={`response-${time}`}
                            name="responseTime"
                            value={time}
                            className="peer absolute opacity-0 w-0 h-0"
                          />
                          <label
                            htmlFor={`response-${time}`}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50"
                          >
                            <Clock className="w-6 h-6 text-gray-400 peer-checked:text-purple-500 mb-2" />
                            <span className="text-sm font-medium">{time}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Preferred Contact Method */}
                  <div>
                    <h3 className="text-md font-medium mb-3">Preferred Contact Method</h3>
                    <p className="text-sm text-gray-500 mb-4">How do you prefer clients to contact you initially?</p>
                    
                    <div className="space-y-2">
                      {['Platform message', 'Email', 'Phone call', 'Video call'].map((method) => (
                        <div key={method} className="flex items-center">
                          <input
                            id={`contact-${method}`}
                            name="contactMethod"
                            type="radio"
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <label htmlFor={`contact-${method}`} className="ml-3 text-sm font-medium text-gray-700">
                            {method}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}; 