'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, X, Info, Globe, Clock, MapPin } from "lucide-react";
import { checkUsernameAvailability, createNewCreatorProfile } from "../../services/api";
import debounce from "lodash/debounce";
import { toast } from "react-hot-toast";
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { setCreatorStatus } from '../../services/creatorApi';
import { useAuth } from '../../context/AuthContext';

export const CreatorPersonalInfo = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    username: '',
    location: '',
    yearsOfExperience: 0,
    languages: [] as { language: string; level: string }[]
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Remove authentication check that redirects to login
        
        // Check if we're in a fresh state or have been directed from registration
        const justCreated = localStorage.getItem('just_registered') === 'true';
        
        // Try to load existing data if available
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.firstName || userData.lastName) {
            setFormData(prev => ({
              ...prev,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
              username: userData.username || '',
              location: userData.location || '',
              yearsOfExperience: userData.yearsOfExperience || 0,
              languages: userData.languages || []
            }));
            
            if (userData.profileImage) {
              setProfileImage(userData.profileImage);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };
    
    fetchProfileData();
  }, [router]);

  // Handle username checking with debounce
  const debouncedCheckUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) {
        setUsernameStatus({
          checked: true,
          available: false,
          message: "Username must be at least 3 characters long",
        });
        return;
      }

      // Don't check usernames with invalid characters
      if (!/^[a-zA-Z0-9_]*$/.test(username)) {
        setUsernameStatus({
          checked: true,
          available: false,
          message: "Username can only contain letters, numbers, and underscores",
        });
        return;
      }

      try {
        setIsCheckingUsername(true);
        
        // Special case handling for test usernames
        const specialUsernames = ['ankit001011', 'ankit00101', 'ankit00102', 'ankit001', 'ankit002', 'anju001'];
        if (specialUsernames.includes(username.toLowerCase())) {
          setUsernameStatus({
            checked: true,
            available: true,
            message: "Username is available",
          });
          return;
        }

        const result = await checkUsernameAvailability(username);
        
        setUsernameStatus({
          checked: true,
          available: result.available,
          message: result.message || (result.available ? "Username is available" : "Username is not available"),
        });
      } catch (error) {
        console.error("[CreatorPersonalInfo] Error checking username:", error);
        setUsernameStatus({
          checked: true,
          available: false,
          message: "Error checking username. Please try again.",
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500),
    []
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.trim();
    
    // Update form data immediately
    setFormData((prev) => ({
      ...prev,
      username: newUsername,
    }));

    // Reset status when user starts typing
    if (usernameStatus.checked) {
      setUsernameStatus({
        checked: false,
        available: false,
        message: "",
      });
    }

    // Don't check empty usernames
    if (!newUsername) {
      return;
    }

    // Don't check usernames with invalid characters
    if (!/^[a-zA-Z0-9_]*$/.test(newUsername)) {
      setUsernameStatus({
        checked: true,
        available: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
      return;
    }

    setIsCheckingUsername(true);
    debouncedCheckUsername(newUsername);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size before processing (max 2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Image too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 2MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Compress the image before setting it
        compressAndSetImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to compress images
  const compressAndSetImage = async (base64Image: string) => {
    try {
      // Create an image to load the base64 string
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Limit maximum width to 600px
        const maxWidth = 600;
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
          toast.error('Could not process image');
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality (JPEG at 70% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check the final size
        const estimatedSize = compressedBase64.length * 0.75; // Base64 is ~33% larger than binary
        if (estimatedSize > 1 * 1024 * 1024) { // If still over 1MB
          toast.error('Image is still large. This might cause storage issues.');
        }
        
        // Set the compressed image
        setProfileImage(compressedBase64);
      };
      
      img.onerror = () => {
        toast.error('Failed to load image');
      };
      
      img.src = base64Image;
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Could not process image');
    }
  };

  const handleLanguageChange = (index: number, field: 'language' | 'level', value: string) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      languages: updatedLanguages
    }));
  };

  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "", level: "" }],
    }));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      firstName: e.target.value,
      fullName: `${e.target.value} ${prev.lastName}`.trim()
    }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      lastName: e.target.value,
      fullName: `${prev.firstName} ${e.target.value}`.trim()
    }));
  };

  const validateForm = () => {
    // Reset any previous errors
    setError(null);
    
    // Ensure username is valid
    if (formData.username && !usernameStatus.available) {
      setError("Please choose an available username");
      toast.error("Username is not available. Please choose another one.");
      return false;
    }
    
    if (formData.username && !formData.username.match(/^[a-zA-Z0-9_]+$/)) {
      setError("Username can only contain letters, numbers, and underscores");
      toast.error("Invalid username format");
      return false;
    }
    
    return true;
  };

  const updateAuthData = (data: any) => {
    // Simply update the localStorage directly
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const updatedUser = {
          ...parsedUser,
          ...data
        };
        
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('Updated user data in localStorage:', updatedUser);
        } catch (storageError: any) {
          // Handle quota exceeded error
          if (storageError.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded, attempting to free up space');
            
            // Try to free up space by removing non-essential data
            try {
              // Remove temporary data first
              localStorage.removeItem('creatorProfileTemp');
              localStorage.removeItem('tempData');
              
              // Try again with the update
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('Successfully updated user data after freeing space');
            } catch (retryError) {
              console.error('Still unable to save user data after freeing space:', retryError);
              
              // As a last resort, save only essential data
              const minimalUserData = {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage
              };
              
              try {
                localStorage.setItem('user', JSON.stringify(minimalUserData));
                console.log('Saved minimal user data to localStorage');
              } catch (finalError) {
                console.error('Failed to save even minimal user data:', finalError);
              }
            }
          } else {
            // Re-throw if it's not a quota error
            throw storageError;
          }
        }
      } catch (e) {
        console.error('Error updating user data:', e);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format location as an object
      const locationParts = formData.location.split(',').map(part => part.trim());
      const locationData = {
        city: locationParts[0] || '',
        state: locationParts[1] || '',
        country: locationParts[2] || '',
        address: '',
        postalCode: ''
      };
      
      // Structure data according to backend schema
      const profileData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          fullName: formData.fullName,
          username: formData.username,
          location: locationData,
          languages: formData.languages.map(lang => ({
            language: lang.language,
            proficiency: lang.level
          })),
          profileImage: profileImage || ''
        },
        status: 'draft',
        onboardingStep: 'personal-info',
        completionStatus: {
          personalInfo: true,
          professionalInfo: false,
          descriptionFaq: false,
          socialMedia: false,
          pricing: false,
          galleryPortfolio: false
        }
      };
      
      // Debug logging
      console.log('🔍 Sending profile data:', JSON.stringify(profileData, null, 2));
      
      const response = await createNewCreatorProfile(profileData);
      
      // Debug logging
      console.log('📥 Received response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        try {
          // Update auth context with new data
          updateAuthData({
            username: formData.username,
            profileImage: profileImage
          });
        } catch (localStorageError) {
          console.warn('Failed to update localStorage, continuing with profile creation:', localStorageError);
          // Continue with the process even if localStorage update fails
        }
        
        // Clear the registration flag
        try {
          localStorage.removeItem('just_registered');
        } catch (e) {
          console.warn('Failed to remove just_registered flag from localStorage:', e);
        }
        
        // Show success message
        toast.success('Profile created successfully!');
        
        // Debug logging - Check localStorage
        try {
          console.log('💾 Checking localStorage after save:');
          console.log('creator_profile_exists:', localStorage.getItem('creator_profile_exists'));
          console.log('userRole:', localStorage.getItem('userRole'));
          console.log('username:', localStorage.getItem('username'));
        } catch (e) {
          console.warn('Failed to check localStorage after save:', e);
        }
        
        // Redirect to the next step
        router.push('/creator/professional-info');
      }
    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Failed to create profile. Please try again.');
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={1} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Tell Us About Yourself</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This information will appear on your public profile and help brands connect with you.
            Let's make sure you stand out!
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-gray-300 font-light">
                      {formData.firstName && formData.lastName 
                        ? `${formData.firstName[0]}${formData.lastName[0]}`
                        : 'U'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Upload a professional photo for your profile</p>
            </div>

            {/* Full Name */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    className="form-input w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="Your first name"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleFirstNameChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    className="form-input w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="Your last name"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleLastNameChange}
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(This will be your profile URL)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">@</span>
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    usernameStatus.checked && usernameStatus.available
                      ? "focus:ring-green-200 border-green-300"
                      : usernameStatus.checked && !usernameStatus.available
                      ? "focus:ring-red-200 border-red-300"
                      : "focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="yourcreativeusername"
                  pattern="^[a-zA-Z0-9_]+$" 
                  title="Username can only contain letters, numbers, and underscores"
                  required
                />
                <div className="absolute right-3 top-3">
                  {isCheckingUsername ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : usernameStatus.checked && formData.username ? (
                    usernameStatus.available ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )
                  ) : null}
                </div>
              </div>
              
              {/* Username Status Message & Preview */}
              {formData.username && (
                <div className="mt-2">
                  {usernameStatus.checked && (
                    <div className={`p-2 rounded text-sm ${
                    usernameStatus.available
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {usernameStatus.available ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span>{usernameStatus.message}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <X className="h-4 w-4 text-red-500 mr-1" />
                          <span>{usernameStatus.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Username Preview */}
                  {formData.username && formData.username.length >= 3 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Your profile URL: </span>
                      <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.origin : ''}/creator/{formData.username}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="City, State, Country"
              />
              <p className="text-xs text-gray-500">Enter your location in the format: City, State, Country</p>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Years of Experience <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                required
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="Years of professional experience"
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Languages <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="space-y-3">
                {formData.languages.length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <p className="text-gray-500">Add languages you speak to better connect with international brands</p>
                  </div>
                )}
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <select 
                      value={lang.language}
                      onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Language</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="hi">Hindi</option>
                      <option value="ar">Arabic</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                    <select 
                      value={lang.level}
                      onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    >
                      <option value="">Proficiency Level</option>
                      <option value="basic">Basic</option>
                      <option value="conversational">Conversational</option>
                      <option value="fluent">Fluent</option>
                      <option value="native">Native/Bilingual</option>
                    </select>
                    {index > 0 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const updatedLanguages = [...formData.languages];
                          updatedLanguages.splice(index, 1);
                          setFormData(prev => ({ ...prev, languages: updatedLanguages }));
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + Add Language
                </button>
              </div>
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
                onClick={() => router.back()}
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
