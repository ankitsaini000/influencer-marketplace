/**
 * API functions for creator-related operations
 */

import API from './api';

/**
 * Fetches creator profile by username
 * @param username The username of the creator to fetch
 * @returns Object containing the creator data or error
 */
export const getCreatorByUsername = async (username: string) => {
  if (!username) {
    console.error('Username is required');
    return { data: null, error: 'Username is required' };
  }

  try {
    console.log(`Fetching creator profile for ${username}`);
    
    // Get auth token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    try {
      // First try to fetch the creator from the backend API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      // Get API base URL from environment or config
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log(`Using API base URL: ${API_BASE_URL} to fetch creator: ${username}`);
      
      const response = await fetch(`${API_BASE_URL}/creators/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if request completes
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Creator ${username} not found`);
          return { data: null, error: `Creator "${username}" not found` };
        }
        
        if (response.status === 401) {
          console.log(`Authentication required for ${username}`);
          return { data: null, error: 'Authentication required to view this profile' };
        }
        
        throw new Error(`Failed to fetch creator: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched creator data from MongoDB:', data);
      
      // Ensure username is properly set in the data
      if (data && data.data) {
        // Add username to the profile data if it's missing
        if (!data.data.userId?.username) {
          // Set up a fallback username structure
          const creatorId = data.data._id ? data.data._id.toString().substring(0, 8) : '';
          const fallbackUsername = data.data.personalInfo?.username || `user_${creatorId}`;
          
          // Create the userId object with username if it doesn't exist
          if (!data.data.userId) {
            data.data.userId = { username: fallbackUsername };
          } else {
            data.data.userId.username = fallbackUsername;
          }
          
          // Also ensure username in personalInfo
          if (!data.data.personalInfo) {
            data.data.personalInfo = { username: fallbackUsername };
          } else {
            data.data.personalInfo.username = data.data.personalInfo.username || fallbackUsername;
          }
        }
      }
      
      // Cache the profile data for offline use
      if (typeof window !== 'undefined') {
        localStorage.setItem(`creator_${username}`, JSON.stringify(data));
      }
      
      return { data, error: null };
    } catch (fetchError) {
      console.error('API fetch error:', fetchError);
      
      // If API fetch fails, check for cached data in localStorage
      console.log('Falling back to localStorage data');
      const cachedCreator = localStorage.getItem(`creator_${username}`);
      
      if (cachedCreator) {
        try {
          const parsedData = JSON.parse(cachedCreator);
          console.log(`Using cached profile data for ${username}`);
          return { data: parsedData, error: null };
        } catch (parseError) {
          console.error('Error parsing cached data:', parseError);
          // Continue to try other fallbacks
        }
      }
      
      // If no cached data, try direct MongoDB connection if available
      try {
        console.log('Attempting direct MongoDB fetch');
        
        // Get API base URL for backup attempt
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        // Try a different API endpoint as a fallback
        const backupResponse = await fetch(`${API_BASE_URL}/creators/profile/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        
        if (backupResponse.ok) {
          const backupData = await backupResponse.json();
          console.log('Successfully fetched creator data from backup endpoint:', backupData);
          return { data: backupData, error: null };
        }
      } catch (backupError) {
        console.error('Backup API fetch failed:', backupError);
      }
      
      return { data: null, error: 'Failed to fetch creator profile from server' };
    }
  } catch (error: any) {
    console.error(`Error in getCreatorByUsername for ${username}:`, error);
    return { data: null, error: error.message || 'An unexpected error occurred' };
  }
};

// Helper function to set creator status in localStorage
export const setCreatorStatus = (isCreator: boolean) => {
  if (typeof window === 'undefined') return;
  
  console.log(`Setting creator status to: ${isCreator}`);
  localStorage.setItem('userRole', isCreator ? 'creator' : 'user');
  localStorage.setItem('creator_profile_exists', isCreator ? 'true' : 'false');
  
  // Setting a custom event to notify the app of status change
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const event = new CustomEvent('creatorStatusChange', { 
      detail: { isCreator } 
    });
    document.dispatchEvent(event);
  }
};

// Helper function to set brand status in localStorage
export const setBrandStatus = () => {
  if (typeof window !== 'undefined') {
    console.log('Setting brand status in localStorage');
    
    // Clear any creator indicators first
    localStorage.removeItem('creator_profile_exists');
    localStorage.removeItem('just_published');
    
    // Then set brand indicators
    localStorage.setItem('is_brand', 'true');
    localStorage.setItem('account_type', 'brand');
    localStorage.setItem('userRole', 'brand');
  }
};

// Check if a creator profile exists
export const checkIfProfileExists = async () => {
  try {
    const response = await API.get('/creators/profile-data');
    console.log('Profile check response:', response.data);
    return {
      exists: true,
      data: response.data
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.log('No creator profile exists yet');
      return {
        exists: false,
        data: null
      };
    }
    // For other errors, rethrow
    console.error('Error checking profile:', error);
    throw error;
  }
};

// Get profile data using the above function
export const getProfileData = async () => {
  try {
    // Try to check if profile exists first
    const profileCheck = await checkIfProfileExists();
    
    if (profileCheck.exists) {
      return profileCheck.data;
    } else {
      // Return a special format for non-existent profiles
      return {
        success: false,
        error: 'profile_not_found',
        message: 'No profile exists yet. Please create one.',
        data: {
          profile: {
            username: '',
            fullName: '',
            displayName: '',
            bio: '',
            profileImage: null,
            languages: [],
            overview: {},
            pricing: {},
            requirements: {},
            gallery: []
          }
        }
      };
    }
  } catch (error) {
    console.error('Error fetching profile data from API:', error);
    
    // Return error data for other types of errors
    return {
      success: false,
      error: 'api_error',
      message: 'Could not fetch profile data from server'
    };
  }
};

// Save personal info to MongoDB
export const savePersonalInfo = async (data: any = {}) => {
  try {
    console.log('Attempting to save personal info to API');
    
    // Save to localStorage as backup
    localStorage.setItem('creatorPersonalInfo', JSON.stringify(data));
    console.log('Personal info saved to localStorage with key: creatorPersonalInfo');
    
    // Send to server
    const response = await API.post('/creators/personal-info', data);
    console.log('Personal info saved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error saving personal info to API:', error);
    throw error;
  }
};

// Save professional info to MongoDB
export const saveProfessionalInfo = async (professionalInfo: any) => {
  try {
    console.log('Saving professional info to MongoDB:', professionalInfo);
    
    // Store in localStorage as backup
    localStorage.setItem('creatorProfessionalInfo', JSON.stringify(professionalInfo));
    
    // Ensure the data is properly formatted
    const formattedData = {
      title: professionalInfo.title || '',
      category: professionalInfo.category || '',
      subcategory: professionalInfo.subcategory || '',
      expertise: professionalInfo.expertise || [],
      skills: professionalInfo.skills || [],
      awards: professionalInfo.awards || [],
      certifications: professionalInfo.certifications || [],
      eventAvailability: {
        available: professionalInfo.eventAvailability?.available || false,
        eventTypes: professionalInfo.eventAvailability?.eventTypes || [],
        pricing: professionalInfo.eventAvailability?.pricing || '',
        requirements: professionalInfo.eventAvailability?.requirements || '',
        // Convert travelWillingness to boolean - if it's a string, check if it's "true" or "yes"
        travelWillingness: typeof professionalInfo.eventAvailability?.travelWillingness === 'string' 
          ? ['true', 'yes', 'local', 'national', 'international'].includes(professionalInfo.eventAvailability.travelWillingness.toLowerCase())
          : Boolean(professionalInfo.eventAvailability?.travelWillingness),
        preferredLocations: professionalInfo.eventAvailability?.preferredLocations || [],
        // Convert leadTime to number - if it's a string, try to parse it
        leadTime: typeof professionalInfo.eventAvailability?.leadTime === 'string'
          ? parseInt(professionalInfo.eventAvailability.leadTime.replace(/[^0-9]/g, ''), 10) || 0
          : Number(professionalInfo.eventAvailability?.leadTime) || 0
      }
    };
    
    console.log('Formatted professional info for API:', formattedData);
    
    // Make the API call with proper error handling
    try {
      const response = await API.post('/creators/professional-info', formattedData);
      
      if (response.data) {
        console.log('Professional info successfully saved to MongoDB:', response.data);
        return { data: response.data, error: null };
      }
      
      return { data: null, error: 'Failed to save professional info: No data returned' };
    } catch (apiError: any) {
      console.error('API error saving professional info:', apiError);
      
      // Provide more specific error messages based on status code
      if (apiError.response) {
        const status = apiError.response.status;
        const message = apiError.response.data?.message || 'Unknown server error';
        
        if (status === 400) {
          throw new Error(`Validation error: ${message}`);
        } else if (status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to save professional info.');
        } else if (status === 404) {
          throw new Error('Creator profile not found. Please complete your profile first.');
        } else if (status === 500) {
          throw new Error(`Server error: ${message}`);
        } else {
          throw new Error(`Server error (${status}): ${message}`);
        }
      } else if (apiError.request) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw apiError;
      }
    }
  } catch (error: any) {
    console.error('Error saving professional info to MongoDB:', error);
    
    // Try to use localStorage data if API fails
    const localData = localStorage.getItem('creatorProfessionalInfo');
    if (localData) {
      console.log('Using localStorage data as fallback');
      return { data: JSON.parse(localData), error: null };
    }
    
    return { 
      data: null, 
      error: error.message || 'Failed to save professional info'
    };
  }
};

// Save description & FAQ to MongoDB
export const saveDescriptionFaq = async (data: any) => {
  try {
    const response = await API.post('/creators/description-faq', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Save social media data to MongoDB
export const saveSocialMedia = async (data: any) => {
  try {
    const response = await API.post('/creators/social-media', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Save pricing data to MongoDB
export const savePricing = async (data: any) => {
  try {
    console.log('Saving pricing data to API:', data);
    
    // Validate the data structure
    if (!data || !data.packages) {
      throw new Error('Invalid pricing data structure. Packages are required.');
    }
    
    // Ensure all required packages exist
    const requiredPackages = ['basic', 'standard', 'premium'];
    for (const pkg of requiredPackages) {
      if (!data.packages[pkg]) {
        throw new Error(`Missing required package: ${pkg}`);
      }
      
      // Validate package structure
      const pkgData = data.packages[pkg];
      if (!pkgData.name || !pkgData.price || !pkgData.description) {
        throw new Error(`Invalid ${pkg} package data. Name, price, and description are required.`);
      }
    }
    
    // Format data to match backend schema
    const formattedData = {
      currency: 'USD',
      basic: {
        price: data.packages.basic.price,
        title: data.packages.basic.name,
        description: data.packages.basic.description,
        deliverables: data.packages.basic.features || [],
        revisions: data.packages.basic.revisions || 1,
        deliveryTime: data.packages.basic.deliveryTime || 7,
        isActive: true
      },
      standard: {
        price: data.packages.standard.price,
        title: data.packages.standard.name,
        description: data.packages.standard.description,
        deliverables: data.packages.standard.features || [],
        revisions: data.packages.standard.revisions || 2,
        deliveryTime: data.packages.standard.deliveryTime || 7,
        isActive: true
      },
      premium: {
        price: data.packages.premium.price,
        title: data.packages.premium.name,
        description: data.packages.premium.description,
        deliverables: data.packages.premium.features || [],
        revisions: data.packages.premium.revisions || 3,
        deliveryTime: data.packages.premium.deliveryTime || 7,
        isActive: true
      },
      customPackages: data.customOffers || false,
      customPackageDescription: data.customOffers ? 'Custom packages available upon request' : '',
      paymentTerms: 'Payment terms will be discussed with the client',
      discountPolicies: 'Discounts may be available for long-term projects'
    };
    
    console.log('Formatted pricing data for API:', formattedData);
    
    // Make the API call
    const response = await API.post('/creators/pricing', formattedData);
    
    // Log success
    console.log('Pricing data saved successfully:', response.data);
    
    // Update completion status in localStorage
    try {
      const completionStatus = localStorage.getItem('creatorCompletionStatus');
      if (completionStatus) {
        const status = JSON.parse(completionStatus);
        status.pricing = true;
        localStorage.setItem('creatorCompletionStatus', JSON.stringify(status));
      }
    } catch (e) {
      console.warn('Failed to update completion status in localStorage:', e);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error saving pricing data:', error);
    
    // Provide more specific error messages
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      const message = error.response.data?.message || 'Unknown server error';
      
      if (status === 400) {
        throw new Error(`Validation error: ${message}`);
      } else if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (status === 403) {
        throw new Error('You do not have permission to save pricing data.');
      } else if (status === 404) {
        throw new Error('Creator profile not found. Please complete your profile first.');
      } else if (status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Server error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Something else happened
      throw error;
    }
  }
};

// Save gallery & portfolio data to MongoDB
export const saveGalleryPortfolio = async (data: any) => {
  try {
    const response = await API.post('/creators/gallery', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get profile completion status directly from server
export const getCompletionStatus = async () => {
  try {
    const response = await API.get('/creators/completion-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching completion status:', error);
    throw error;
  }
};

// Upgrade to creator role
export const upgradeToCreator = async () => {
  try {
    console.log("Attempting to upgrade user to creator role");
    const response = await API.post('/creators/upgrade-role');

    if (response && response.data) {
      console.log("Successfully upgraded to creator role", response.data);
      
      // Set creator status in localStorage
      setCreatorStatus(false); // Not published yet
      
      return { success: true, message: "Successfully upgraded to creator!" };
    } else {
      throw new Error("Upgrade failed");
    }
  } catch (error: any) {
    console.error("Error upgrading to creator:", error);
    return { success: false, message: error.message || "Error upgrading to creator. Please try again." };
  }
};

// Add a function to safely log the API base URL
export const logApiBaseUrl = () => {
  try {
    if (API && API.defaults && API.defaults.baseURL) {
      console.log('API base URL:', API.defaults.baseURL);
    } else {
      console.log('API base URL is not defined yet');
    }
  } catch (error) {
    console.error('Error logging API base URL:', error);
  }
};

// Modify the checkAvailableEndpoints function to include the base URL logging
export const checkAvailableEndpoints = async () => {
  console.log('Checking available backend endpoints...');
  
  // Log the base URL safely
  logApiBaseUrl();
  
  const testEndpoints = [
    '/creators',
    '/creators/profile',
    '/creator/profile',
    '/creators/profile-data',
    '/creator'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await API.get(endpoint);
      console.log(`✅ Endpoint ${endpoint} exists:`, response.status);
    } catch (error: any) {
      // 404 means not found, but other errors might mean it exists but you can't GET
      if (error.response) {
        if (error.response.status === 404) {
          console.log(`❌ Endpoint ${endpoint} not found (404)`);
        } else {
          console.log(`⚠️ Endpoint ${endpoint} returned ${error.response.status} - might exist but not for GET`);
        }
      } else {
        console.log(`❌ Error checking ${endpoint}:`, error.message);
      }
    }
  }
  
  return { success: true, message: 'Endpoint check completed' };
};

// Modify the publishProfile function to ensure status is published
export const publishProfile = async (profileData: any) => {
  console.log('Publishing profile to endpoint: /creators/publish...');
  
  try {
    // Ensure status is explicitly set to published
    const dataToSend = {
      ...profileData,
      status: 'published',
      bypassVerification: true
    };
    
    // Try POST endpoint first (proper endpoint from backend routes)
    try {
      const response = await API.post('/creators/publish', dataToSend);
      console.log('Profile published successfully using POST /creators/publish');
      
      // Store success in localStorage
      localStorage.setItem('just_published', 'true');
      if (profileData.username || profileData.personalInfo?.username) {
        const username = profileData.username || profileData.personalInfo?.username;
        localStorage.setItem('published_username', username);
      }
      localStorage.setItem('creator_profile_exists', 'true');
      
      // Set creator status
      setCreatorStatus(true);
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.log('POST endpoint failed, trying PUT alternative...');
      // Try alternative PUT endpoint
      const fallbackResponse = await API.put('/creators/publish', dataToSend);
      console.log('Profile published successfully using fallback PUT endpoint');
      
      // Store success in localStorage
      localStorage.setItem('just_published', 'true');
      if (profileData.username || profileData.personalInfo?.username) {
        const username = profileData.username || profileData.personalInfo?.username;
        localStorage.setItem('published_username', username);
      }
      localStorage.setItem('creator_profile_exists', 'true');
      
      // Set creator status
      setCreatorStatus(true);
      
      return {
        success: true,
        data: fallbackResponse.data
      };
    }
  } catch (error: any) {
    console.error('Error publishing profile:', error);
    
    // Better error handling with more details
    let errorMessage = 'Failed to publish profile';
    
    if (error.response) {
      // Server responded with error
      errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
      console.error('Server response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: error 
    };
  }
};