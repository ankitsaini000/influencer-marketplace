'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Award, GraduationCap, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { saveProfessionalInfo } from '../../services/creatorApi';

export const CreatorProfessionalInfo = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    expertise: [] as string[],
    skills: [] as { skill: string; level: string }[],
    awards: [] as { name: string; awardedBy: string; year: string }[],
    certifications: [] as { name: string; issuedBy: string; year: string }[],
    eventAvailability: {
      available: false,
      eventTypes: [] as string[],
      pricing: "",
      requirements: "",
      travelWillingness: "",
      preferredLocations: "",
      leadTime: "",
    },
  });
  const [newSkill, setNewSkill] = useState({ skill: "", level: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Try to load existing data if available
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.professionalInfo) {
          setFormData(prev => ({
            ...prev,
            ...userData.professionalInfo
          }));
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const handleAddSkill = () => {
    if (newSkill.skill.trim() === '' || newSkill.level === '') {
      toast.error('Please select both skill and level');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }]
    }));
    
    setNewSkill({ skill: "", level: "" });
  };
  
  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, { name: "", awardedBy: "", year: "" }]
    }));
  };
  
  const handleUpdateAward = (index: number, field: keyof typeof formData.awards[0], value: string) => {
    const updatedAwards = [...formData.awards];
    updatedAwards[index] = { ...updatedAwards[index], [field]: value };
    setFormData(prev => ({ ...prev, awards: updatedAwards }));
  };
  
  const handleRemoveAward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuedBy: "", year: "" }]
    }));
  };
  
  const handleUpdateCertification = (index: number, field: keyof typeof formData.certifications[0], value: string) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value };
    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
  };
  
  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleEventTypeChange = (eventType: string) => {
    const currentEventTypes = [...formData.eventAvailability.eventTypes];
    
    if (currentEventTypes.includes(eventType)) {
      setFormData(prev => ({
        ...prev,
        eventAvailability: {
          ...prev.eventAvailability,
          eventTypes: currentEventTypes.filter(type => type !== eventType)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        eventAvailability: {
          ...prev.eventAvailability,
          eventTypes: [...currentEventTypes, eventType]
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      setError("Please provide your title and category");
      toast.error("Title and category are required");
      return;
    }
    
    if (formData.skills.length === 0) {
      setError("Please add at least one skill");
      toast.error("At least one skill is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Import the creator profile store
      const { useCreatorProfileStore } = await import('../../store/creatorProfileStore');
      const store = useCreatorProfileStore.getState();
      
      // Update the store first
      store.updateCurrentProfile('professionalInfo', {
        title: formData.title,
        category: formData.category,
        subcategory: formData.subcategory,
        expertise: formData.expertise,
      });
      
      // Save to localStorage
      store.saveToLocalStorage();
      
      // Update userData with professional info
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userData.professionalInfo = formData;
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Save to MongoDB
      console.log('Saving professional info to MongoDB:', formData);
      const response = await saveProfessionalInfo(formData);
      console.log('Professional info saved successfully to MongoDB:', response);
      
      toast.success('Professional info saved to MongoDB!');
      
      // Navigate to the next step
      router.push('/creator-setup/description-faq');
    } catch (err: any) {
      console.error("Error saving professional information to MongoDB:", err);
      const errorMessage = err.message || "An error occurred while saving your data";
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={2} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Professional Information</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is your time to shine. Let potential clients know what you do best and how you gained your skills,
            certifications, and experience.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Professional Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <BriefcaseBusiness className="w-4 h-4 mr-2" />
                Professional Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="e.g. Social Media Content Creator, Fashion Influencer"
              />
            </div>

            {/* Category and Subcategory */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="travel">Travel</option>
                  <option value="food">Food</option>
                  <option value="fitness">Fitness</option>
                  <option value="tech">Technology</option>
                  <option value="gaming">Gaming</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Subcategory</option>
                  {formData.category === 'fashion' && (
                    <>
                      <option value="streetwear">Streetwear</option>
                      <option value="luxury">Luxury Fashion</option>
                      <option value="sustainable">Sustainable Fashion</option>
                      <option value="accessories">Accessories</option>
                    </>
                  )}
                  {formData.category === 'beauty' && (
                    <>
                      <option value="makeup">Makeup</option>
                      <option value="skincare">Skincare</option>
                      <option value="haircare">Haircare</option>
                      <option value="nails">Nails</option>
                    </>
                  )}
                  {formData.category === 'lifestyle' && (
                    <>
                      <option value="home_decor">Home Decor</option>
                      <option value="diy">DIY</option>
                      <option value="parenting">Parenting</option>
                      <option value="wellness">Wellness</option>
                    </>
                  )}
                  {/* Add more subcategories based on selected category */}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 mr-2" />
                Skills <span className="text-red-500 ml-1">*</span>
              </label>
              
              {/* Add new skill */}
              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <select 
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Skill</option>
                  <option value="content_creation">Content Creation</option>
                  <option value="video_editing">Video Editing</option>
                  <option value="photography">Photography</option>
                  <option value="copywriting">Copywriting</option>
                  <option value="social_media_management">Social Media Management</option>
                  <option value="graphic_design">Graphic Design</option>
                  <option value="brand_strategy">Brand Strategy</option>
                  <option value="public_speaking">Public Speaking</option>
                  <option value="community_management">Community Management</option>
                </select>
                <select 
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="">Experience Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors md:w-auto w-full flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
              </div>
              
              {/* List of added skills */}
              {formData.skills.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-2 mt-4">
                  {formData.skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div>
                        <span className="font-medium">
                          {skill.skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          • {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">Add skills to showcase your expertise</p>
                </div>
              )}
            </div>

            {/* Awards */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 mr-2" />
                Awards & Recognition
              </label>
              
              {formData.awards.length > 0 ? (
                <div className="space-y-4">
                  {formData.awards.map((award, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={award.name}
                        onChange={(e) => handleUpdateAward(index, 'name', e.target.value)}
                        placeholder="Award Name"
                        className="col-span-12 md:col-span-5 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      />
                      <input
                        type="text"
                        value={award.awardedBy}
                        onChange={(e) => handleUpdateAward(index, 'awardedBy', e.target.value)}
                        placeholder="Awarded By"
                        className="col-span-8 md:col-span-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      />
                      <select 
                        value={award.year}
                        onChange={(e) => handleUpdateAward(index, 'year', e.target.value)}
                        className="col-span-4 md:col-span-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      >
                        <option value="">Year</option>
                        {Array.from(
                          { length: 30 },
                          (_, i) => new Date().getFullYear() - i
                        ).map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAward(index)}
                        className="col-span-12 md:col-span-1 text-gray-400 hover:text-red-500 flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">Add awards to highlight your achievements</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddAward}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Award
              </button>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 mr-2" />
                Certifications
              </label>
              
              {formData.certifications.length > 0 ? (
                <div className="space-y-4">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleUpdateCertification(index, 'name', e.target.value)}
                        placeholder="Certificate Name"
                        className="col-span-12 md:col-span-5 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      />
                      <input
                        type="text"
                        value={cert.issuedBy}
                        onChange={(e) => handleUpdateCertification(index, 'issuedBy', e.target.value)}
                        placeholder="Issued By"
                        className="col-span-8 md:col-span-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      />
                      <select 
                        value={cert.year}
                        onChange={(e) => handleUpdateCertification(index, 'year', e.target.value)}
                        className="col-span-4 md:col-span-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      >
                        <option value="">Year</option>
                        {Array.from(
                          { length: 30 },
                          (_, i) => new Date().getFullYear() - i
                        ).map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCertification(index)}
                        className="col-span-12 md:col-span-1 text-gray-400 hover:text-red-500 flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">Add certifications to demonstrate your qualifications</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddCertification}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Certification
              </button>
            </div>

            {/* Event Availability Section - Add this before the submit button */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Event Availability
              </h3>
              <p className="text-sm text-gray-600 mb-4 bg-purple-50 p-3 rounded-lg">
                Let brands know if you're available for in-person events, virtual appearances, or other collaborations.
                This information will help brands plan their campaigns and contact you for appropriate opportunities.
              </p>

              <div className="flex items-center mb-4">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={formData.eventAvailability.available}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          available: e.target.checked
                        }
                      }))}
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.eventAvailability.available ? 'bg-purple-600' : 'bg-gray-300'} transition-colors`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.eventAvailability.available ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">I'm available for events and appearances</span>
                </label>
              </div>

              {formData.eventAvailability.available && (
                <div className="pl-4 border-l-2 border-purple-200 space-y-5 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Events You're Available For
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Brand Launches', 'Trade Shows', 'Private Events', 'Virtual Events', 'Meet & Greets', 'Workshops', 'Conferences', 'Panels', 'Product Demonstrations'].map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`event-${type.replace(/\s+/g, '-').toLowerCase()}`}
                            checked={formData.eventAvailability.eventTypes.includes(type)}
                            onChange={() => handleEventTypeChange(type)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`event-${type.replace(/\s+/g, '-').toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing for Events (Approximate Range)
                    </label>
                    <input
                      type="text"
                      value={formData.eventAvailability.pricing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          pricing: e.target.value
                        }
                      }))}
                      placeholder="e.g. ₹50,000 - ₹150,000 depending on event type and duration"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">This helps brands understand your rates before contacting you.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements
                    </label>
                    <textarea
                      value={formData.eventAvailability.requirements}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          requirements: e.target.value
                        }
                      }))}
                      rows={3}
                      placeholder="e.g. Hair & makeup, photography, specific technical equipment"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Willing to Travel
                      </label>
                      <select
                        value={formData.eventAvailability.travelWillingness}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eventAvailability: {
                            ...prev.eventAvailability,
                            travelWillingness: e.target.value
                          }
                        }))}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        <option value="">Select option</option>
                        <option value="local">Local only (within city)</option>
                        <option value="state">Within state</option>
                        <option value="national">Nationwide</option>
                        <option value="international">International</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Locations
                      </label>
                      <input
                        type="text"
                        value={formData.eventAvailability.preferredLocations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eventAvailability: {
                            ...prev.eventAvailability,
                            preferredLocations: e.target.value
                          }
                        }))}
                        placeholder="e.g. Mumbai, Delhi, Bangalore"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Lead Time for Booking
                    </label>
                    <select
                      value={formData.eventAvailability.leadTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          leadTime: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="">Select option</option>
                      <option value="1-week">At least 1 week</option>
                      <option value="2-weeks">At least 2 weeks</option>
                      <option value="1-month">At least 1 month</option>
                      <option value="2-months">At least 2 months</option>
                      <option value="custom">Custom (specify in requirements)</option>
                    </select>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      Brands may contact you directly to discuss event opportunities. Make sure your contact information is up to date in your personal information section.
                    </p>
                  </div>
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
                onClick={() => router.push('/creator-setup/personal-info')}
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
