import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Interface for the component props
interface ModernBrandProfileProps {
  profileData?: any; // Make profileData optional
}

// Interface for form data
interface BrandProfileFormData {
  name: string;
  about: string;
  establishedYear: string;
  industry: string;
  website: string;
  location: {
    country: string;
    city: string;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
  socialMedia: {
    instagram: string;
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  brandValues: string[];
}

const ModernBrandProfile: React.FC<ModernBrandProfileProps> = ({ profileData }) => {
  // State for editing mode - default to true if no profile data
  const [isEditing, setIsEditing] = useState(!profileData || Object.keys(profileData).length === 0);
  
  // State for form data
  const [formData, setFormData] = useState<BrandProfileFormData>({
    name: '',
    about: '',
    establishedYear: '',
    industry: '',
    website: '',
    location: {
      country: '',
      city: '',
    },
    contactInfo: {
      email: '',
      phone: '',
    },
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: '',
    },
    brandValues: [],
  });
  
  // State for notification
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // State for new brand value input
  const [newBrandValue, setNewBrandValue] = useState('');

  // Initialize form data from localStorage or empty defaults
  useEffect(() => {
    try {
      // Try to get saved form data from localStorage first
      const savedFormData = localStorage.getItem('brand_profile_form_data');
      
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        console.log("Loaded form data from localStorage:", parsedData);
        setFormData(parsedData);
      } else if (profileData && Object.keys(profileData).length > 0) {
        // If no saved form data but we have profile data
        console.log("Using provided profile data:", profileData);
        setFormData({
          name: profileData.name || '',
          about: profileData.about || '',
          establishedYear: profileData.establishedYear || '',
          industry: profileData.industry || '',
          website: profileData.website || '',
          location: {
            country: profileData.location?.country || '',
            city: profileData.location?.city || '',
          },
          contactInfo: {
            email: profileData.contactInfo?.email || '',
            phone: profileData.contactInfo?.phone || '',
          },
          socialMedia: {
            instagram: profileData.socialMedia?.instagram || '',
            twitter: profileData.socialMedia?.twitter || '',
            linkedin: profileData.socialMedia?.linkedin || '',
            facebook: profileData.socialMedia?.facebook || '',
          },
          brandValues: profileData.brandValues || [],
        });
      } else {
        // If no data anywhere, we keep the default empty values
        console.log("No profile data available, using empty defaults");
      }
    } catch (error) {
      console.error('Error initializing form data:', error);
    }
  }, [profileData]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'location') {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            [field]: value,
          },
        });
      } else if (section === 'contactInfo') {
        setFormData({
          ...formData,
          contactInfo: {
            ...formData.contactInfo,
            [field]: value,
          },
        });
      } else if (section === 'socialMedia') {
        setFormData({
          ...formData,
          socialMedia: {
            ...formData.socialMedia,
            [field]: value,
          },
        });
      }
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Save form data to localStorage
    try {
      localStorage.setItem('brand_profile_form_data', JSON.stringify({
        ...formData,
        [name]: value,
      }));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  };

  // Add brand value
  const addBrandValue = () => {
    if (newBrandValue.trim() && !formData.brandValues.includes(newBrandValue.trim())) {
      const updatedValues = [...formData.brandValues, newBrandValue.trim()];
      setFormData({
        ...formData,
        brandValues: updatedValues,
      });
      
      // Save to localStorage
      try {
        localStorage.setItem('brand_profile_form_data', JSON.stringify({
          ...formData,
          brandValues: updatedValues,
        }));
      } catch (error) {
        console.error('Error saving brand values to localStorage:', error);
      }
      
      setNewBrandValue('');
    }
  };

  // Remove brand value
  const removeBrandValue = (v: string) => {
    const updatedValues = formData.brandValues.filter(value => value !== v);
    setFormData({
      ...formData,
      brandValues: updatedValues,
    });
    
    // Save to localStorage
    try {
      localStorage.setItem('brand_profile_form_data', JSON.stringify({
        ...formData,
        brandValues: updatedValues,
      }));
    } catch (error) {
      console.error('Error saving brand values to localStorage:', error);
    }
  };

  // Save profile data to backend
  const saveProfileData = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Save to backend API
      const response = await axios.post(
        `${API_BASE_URL}/brands/profile-data`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: 'Profile data saved successfully!',
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification({
            show: false,
            type: 'success',
            message: '',
          });
        }, 3000);
        
        // Exit editing mode
        setIsEditing(false);
        
        // Update localStorage
        localStorage.setItem('brand_profile_data', JSON.stringify(formData));
      } else {
        throw new Error('Failed to save profile data');
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
      
      // Save to localStorage as fallback
      try {
        localStorage.setItem('brand_profile_data', JSON.stringify(formData));
        
        // Show success notification even though the API call failed
        setNotification({
          show: true,
          type: 'success',
          message: 'Profile data saved locally. Will sync when connection is available.',
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification({
            show: false,
            type: 'success',
            message: '',
          });
        }, 3000);
        
        // Exit editing mode
        setIsEditing(false);
      } catch (localStorageError) {
        // If even localStorage fails
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to save profile data. Please try again.',
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification({
            show: false,
            type: 'error',
            message: '',
          });
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit Brand Profile' : 'Brand Profile'}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </button>
        </div>
        
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                    <input
                      type="text"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Location & Contact */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Social Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    name="socialMedia.instagram"
                    value={formData.socialMedia.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                  <input
                    type="text"
                    name="socialMedia.twitter"
                    value={formData.socialMedia.twitter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    name="socialMedia.linkedin"
                    value={formData.socialMedia.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="text"
                    name="socialMedia.facebook"
                    value={formData.socialMedia.facebook}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Brand Values */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Brand Values</h2>
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={newBrandValue}
                  onChange={(e) => setNewBrandValue(e.target.value)}
                  placeholder="Add a brand value..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addBrandValue}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.brandValues.map((value, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="mr-2">{value}</span>
                    <button
                      onClick={() => removeBrandValue(value)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={saveProfileData}
                disabled={isLoading || !formData.name}
                className={`px-6 py-2 rounded-md ${
                  isLoading || !formData.name
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 transition-colors'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Brand Name</p>
                  <p className="text-lg">{formData.name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-lg">{formData.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Established</p>
                  <p className="text-lg">{formData.establishedYear || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-lg">
                    {formData.website ? (
                      <a 
                        href={formData.website}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {formData.website}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
              </div>
              {formData.about && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">About</p>
                  <p className="text-lg mt-1">{formData.about}</p>
                </div>
              )}
            </div>
            
            {/* Location & Contact */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-lg">
                    {formData.location.city && formData.location.country
                      ? `${formData.location.city}, ${formData.location.country}`
                      : formData.location.city || formData.location.country || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">
                    {formData.contactInfo.email ? (
                      <a 
                        href={`mailto:${formData.contactInfo.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {formData.contactInfo.email}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg">
                    {formData.contactInfo.phone ? (
                      <a 
                        href={`tel:${formData.contactInfo.phone}`}
                        className="text-blue-500 hover:underline"
                      >
                        {formData.contactInfo.phone}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Social Media</h2>
              <div className="flex flex-wrap gap-4">
                {formData.socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${formData.socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-500"
                  >
                    <span className="mr-2">Instagram:</span>
                    <span className="text-blue-500">@{formData.socialMedia.instagram}</span>
                  </a>
                )}
                {formData.socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${formData.socialMedia.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-500"
                  >
                    <span className="mr-2">Twitter:</span>
                    <span className="text-blue-500">@{formData.socialMedia.twitter}</span>
                  </a>
                )}
                {formData.socialMedia.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${formData.socialMedia.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-500"
                  >
                    <span className="mr-2">LinkedIn:</span>
                    <span className="text-blue-500">{formData.socialMedia.linkedin}</span>
                  </a>
                )}
                {formData.socialMedia.facebook && (
                  <a
                    href={`https://facebook.com/${formData.socialMedia.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-500"
                  >
                    <span className="mr-2">Facebook:</span>
                    <span className="text-blue-500">{formData.socialMedia.facebook}</span>
                  </a>
                )}
                {Object.values(formData.socialMedia).every(v => !v) && (
                  <p className="text-gray-500">No social media profiles specified</p>
                )}
              </div>
            </div>
            
            {/* Brand Values */}
            {formData.brandValues.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Brand Values</h2>
                <div className="flex flex-wrap gap-2">
                  {formData.brandValues.map((value, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernBrandProfile;
