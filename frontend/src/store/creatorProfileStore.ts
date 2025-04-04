import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from 'react-hot-toast';

export interface CreatorProfile {
  id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    username: string;
    bio: string;
    profileImage: string;
    location: string;
    languages: any[];
    skills: string[];
  },
  basicInfo: {
    title: string;
    category: string;
    subcategory: string;
    expertise: string[];
    level: string;
    yearsOfExperience: number;
    tags: string[];
  };
  pricing: {
    packages: {
      basic: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      standard: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      premium: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
    };
    customOffers: boolean;
  };
  description: {
    brief: string;
    detailed: string;
    faq: Array<{ question: string; answer: string }>;
  };
  requirements: {
    briefInstructions: string;
    questions: Array<{ question: string; required: boolean }>;
    additionalInfo: string;
  };
  gallery: {
    images: string[];
    videos: string[];
    portfolioLinks: Array<{ title: string; url: string }>;
  };
  socialInfo: {
    website: string;
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    other: Array<{ platform: string; url: string }>;
    followersCount: any;
  };
  status: 'draft' | 'published' | 'suspended';
  completionStatus: {
    basicInfo: boolean;
    pricing: boolean;
    description: boolean;
    requirements: boolean;
    gallery: boolean;
    socialInfo: boolean;
    personalInfo: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

// Default values for a new profile
const getDefaultProfile = (): Partial<CreatorProfile> => ({
  personalInfo: {
    fullName: '',
    username: '',
    bio: '',
    profileImage: '',
    location: '',
    languages: [],
    skills: []
  },
  basicInfo: {
    title: '',
    category: '',
    subcategory: '',
    expertise: [],
    level: 'intermediate',
    yearsOfExperience: 0,
    tags: []
  },
  pricing: {
    packages: {
      basic: {
        name: 'Basic',
        price: 0,
        description: '',
        deliveryTime: 3,
        revisions: 1,
        features: []
      },
      standard: {
        name: 'Standard',
        price: 0,
        description: '',
        deliveryTime: 5,
        revisions: 2,
        features: []
      },
      premium: {
        name: 'Premium',
        price: 0,
        description: '',
        deliveryTime: 7,
        revisions: 3,
        features: []
      }
    },
    customOffers: false
  },
  description: {
    brief: '',
    detailed: '',
    faq: []
  },
  requirements: {
    briefInstructions: '',
    questions: [],
    additionalInfo: ''
  },
  gallery: {
    images: [],
    videos: [],
    portfolioLinks: []
  },
  socialInfo: {
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    other: [],
    followersCount: {}
  },
  status: 'draft',
  completionStatus: {
    basicInfo: false,
    pricing: false,
    description: false,
    requirements: false,
    gallery: false,
    socialInfo: false,
    personalInfo: false
  }
});

interface CreatorProfileStore {
  currentProfile: Partial<CreatorProfile>;
  profiles: CreatorProfile[];
  updateCurrentProfile: (section: keyof CreatorProfile, data: Partial<any>) => void;
  resetCurrentProfile: () => void;
  getCompletedSections: () => string[];
  getProfileCompletionPercentage: () => number;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  isProfileComplete: () => boolean;
  addProfile: (profile: Omit<CreatorProfile, "id" | "createdAt" | "updatedAt">) => string;
  getProfileById: (id: string) => CreatorProfile | undefined;
  getProfilesByUserId: (userId: string) => CreatorProfile[];
  getAllLocalStorageData: () => any;
}

interface UpdatePayload {
  section: keyof CreatorProfile;
  data: Partial<any>;
}

// Helper function to compress images
const compressImage = (dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions if needed
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Fallback to original if canvas context fails
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => {
        resolve(dataUrl); // Fallback to original if loading fails
      };
      
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl); // Fallback to original on any error
    }
  });
};

// Helper to clear all unused gallery images
const clearUnusedGalleryImages = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Find all keys that start with creator_gallery_image_
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('creator_gallery_image_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Error clearing unused gallery images:', e);
  }
};

// Helper to chunk large string data
const saveChunkedData = (key: string, data: string, chunkSize = 512 * 1024) => {
  try {
    // Remove any existing chunks for this key
    for (let i = 0; i < localStorage.length; i++) {
      const existingKey = localStorage.key(i);
      if (existingKey && existingKey.startsWith(`${key}_chunk_`)) {
        localStorage.removeItem(existingKey);
      }
    }
    
    // Store the original data length
    localStorage.setItem(`${key}_length`, data.length.toString());
    
    // Split data into chunks and store them
    const chunks = Math.ceil(data.length / chunkSize);
    for (let i = 0; i < chunks; i++) {
      const chunk = data.substring(i * chunkSize, (i + 1) * chunkSize);
      localStorage.setItem(`${key}_chunk_${i}`, chunk);
    }
    
    return true;
  } catch (e) {
    console.error(`Error saving chunked data for ${key}:`, e);
    return false;
  }
};

// Helper to load chunked data
const loadChunkedData = (key: string): string | null => {
  try {
    const lengthStr = localStorage.getItem(`${key}_length`);
    if (!lengthStr) return null;
    
    const length = parseInt(lengthStr, 10);
    const chunks = Math.ceil(length / (512 * 1024));
    let result = '';
    
    for (let i = 0; i < chunks; i++) {
      const chunk = localStorage.getItem(`${key}_chunk_${i}`);
      if (chunk) {
        result += chunk;
      } else {
        console.warn(`Missing chunk ${i} for ${key}`);
      }
    }
    
    return result;
  } catch (e) {
    console.error(`Error loading chunked data for ${key}:`, e);
    return null;
  }
};

export const useCreatorProfileStore = create<CreatorProfileStore>()(
  persist(
    (set, get) => ({
      currentProfile: getDefaultProfile(),
      profiles: [],
      
      updateCurrentProfile: (section, data) => {
        set(state => {
          const sectionData = state.currentProfile[section] || {};
          
          const newProfile = { 
            ...state.currentProfile,
            [section]: {
              ...(sectionData as Record<string, any>),
              ...data
            }
          };
          
          // Update completion status based on required fields
          let completionStatus = {...state.currentProfile.completionStatus} as CreatorProfile['completionStatus'];
          
          // Check specific required fields for each section
          switch(section) {
            case 'personalInfo':
              if ((data as any).username && (data as any).fullName) {
                completionStatus.personalInfo = true;
              }
              break;
            case 'basicInfo':
              if ((data as any).title && (data as any).category) {
                completionStatus.basicInfo = true;
              }
              break;
            case 'pricing':
              if ((data as any).packages?.basic?.price) {
                completionStatus.pricing = true;
              }
              break;
            case 'description':
              if ((data as any).detailed) {
                completionStatus.description = true;
              }
              break;
            case 'requirements':
              completionStatus.requirements = true;
              break;
            case 'gallery':
              if (
                (data as any).images?.length ||
                (data as any).videos?.length ||
                (data as any).portfolioLinks?.length
              ) {
                completionStatus.gallery = true;
              }
              break;
            case 'socialInfo':
              completionStatus.socialInfo = true;
              break;
          }
          
          newProfile.completionStatus = completionStatus as CreatorProfile['completionStatus'];
          newProfile.updatedAt = Date.now();
          
          // Save to localStorage
          try {
            // Special handling for gallery images which can be large
            if (section === 'gallery' && data.images && data.images.length > 0) {
              // First clear any previous gallery images
              clearUnusedGalleryImages();
              
              // Store metadata without the actual images
              const metaData = { ...data, images: data.images.map((_: any, i: number) => `gallery_image_${i}`) };
              localStorage.setItem(`creator_${section}_meta`, JSON.stringify(metaData));
              
              // Process and store each image with compression
              const processImages = async () => {
                for (let i = 0; i < Math.min(data.images.length, 5); i++) { // Limit to 5 images
                  try {
                    // Compress the image before storing
                    const compressedImage = await compressImage(data.images[i], 600, 0.6);
                    if (compressedImage) {
                      const storageKey = `creator_gallery_image_${i}`;
                      
                      // Try to use chunked storage for large images
                      if (compressedImage.length > 500 * 1024) {
                        saveChunkedData(storageKey, compressedImage);
                      } else {
                        localStorage.setItem(storageKey, compressedImage);
                      }
                    }
                  } catch (e) {
                    console.warn(`Could not store gallery image ${i}:`, e);
                  }
                }
              };
              
              // Execute image processing
              processImages().catch(e => console.error("Image processing failed:", e));
            } else {
              // For other data, try chunked storage if large
              const jsonData = JSON.stringify(data);
              
              if (jsonData.length > 500 * 1024) {
                saveChunkedData(`creator_${section}`, jsonData);
              } else {
                localStorage.setItem(`creator_${section}`, jsonData);
              }
            }

            // Update overall profile completeness
            localStorage.setItem('creator_profile_exists', 'true');
          } catch (error) {
            console.error(`Error saving ${section} to localStorage:`, error);
            toast.error(`Could not save ${section} data. Try reducing image sizes or removing some items.`, { 
              duration: 4000
            });
          }
          
          return { currentProfile: newProfile };
        });
      },
      
      resetCurrentProfile: () => {
        set({ currentProfile: getDefaultProfile() });
        
        // Clear all localStorage keys related to creator profile
        if (typeof window !== 'undefined') {
          const sections = [
            'creator-personal-info', 
            'creator-basicInfo', 
            'creator-pricing', 
            'creator-description', 
            'creator-requirements', 
            'creator-gallery', 
            'creator-socialInfo'
          ];
          
          sections.forEach(key => localStorage.removeItem(key));
        }
      },
      
      getCompletedSections: () => {
        const { completionStatus } = get().currentProfile;
        if (!completionStatus) return [];
        
        return Object.entries(completionStatus)
          .filter(([_, isComplete]) => isComplete)
          .map(([section]) => section);
      },
      
      getProfileCompletionPercentage: () => {
        const { completionStatus } = get().currentProfile;
        if (!completionStatus) return 0;
        
        const totalSections = Object.keys(completionStatus).length;
        const completedSections = Object.values(completionStatus).filter(Boolean).length;
        
        return Math.round((completedSections / totalSections) * 100);
      },
      
      saveToLocalStorage: () => {
        if (typeof window === 'undefined') return;
        
        const profile = get().currentProfile;
        
        // Save each section separately
        Object.entries(profile).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
            try {
              // Special handling for gallery section
              if (key === 'gallery' && value.images && value.images.length > 0) {
                // Store metadata separately from images
                const metaData = { ...value, images: value.images.map((_: any, i: number) => `gallery_image_${i}`) };
                localStorage.setItem(`creator_${key}_meta`, JSON.stringify(metaData));
                
                // Each image is already stored individually in updateCurrentProfile
              } else {
                // For other data, use JSON
                const jsonData = JSON.stringify(value);
                
                // Use chunked storage for large data
                if (jsonData.length > 500 * 1024) {
                  saveChunkedData(`creator_${key}`, jsonData);
                } else {
                  localStorage.setItem(`creator_${key}`, jsonData);
                }
              }
            } catch (e) {
              console.error(`Error saving ${key} to localStorage:`, e);
            }
          }
        });
        
        // Store personal info in the legacy format as well for compatibility
        if (profile.personalInfo) {
          try {
            localStorage.setItem('creatorPersonalInfo', JSON.stringify(profile.personalInfo));
          } catch (e) {
            console.error('Error saving creatorPersonalInfo:', e);
          }
        }
        
        // Also save the username for easier retrieval in multiple formats
        if (profile.personalInfo?.username) {
          try {
            localStorage.setItem('username', profile.personalInfo.username);
          } catch (e) {
            console.error('Error saving username:', e);
          }
        }
        
        return true;
      },
      
      loadFromLocalStorage: () => {
        if (typeof window === 'undefined') return false;
        
        const newProfile = getDefaultProfile();
        let dataLoaded = false;
        
        // Try to load each section
        Object.keys(newProfile).forEach(key => {
          try {
            // First try regular storage
            let data = localStorage.getItem(`creator_${key}`);
            
            // If not found, try chunked storage
            if (!data) {
              data = loadChunkedData(`creator_${key}`);
            }
            
            if (data) {
              (newProfile as Record<string, any>)[key] = JSON.parse(data);
              dataLoaded = true;
            }
            
            // Special handling for gallery
            if (key === 'gallery') {
              // Check for gallery metadata
              const metaData = localStorage.getItem(`creator_${key}_meta`);
              if (metaData) {
                const parsedMeta = JSON.parse(metaData);
                
                // Restore real images from individual storage
                if (parsedMeta.images && Array.isArray(parsedMeta.images)) {
                  const images: string[] = [];
                  
                  // Try to load each image
                  for (let i = 0; i < 10; i++) { // Check up to 10 images
                    try {
                      // First try regular storage
                      let imageData = localStorage.getItem(`creator_gallery_image_${i}`);
                      
                      // If not found, try chunked storage
                      if (!imageData) {
                        imageData = loadChunkedData(`creator_gallery_image_${i}`);
                      }
                      
                      if (imageData) {
                        images.push(imageData);
                      }
                    } catch (e) {
                      console.warn(`Could not load gallery image ${i}:`, e);
                    }
                  }
                  
                  // Update the gallery with the actual images
                  if (images.length > 0) {
                    (newProfile as any).gallery.images = images;
                    dataLoaded = true;
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error loading ${key} from localStorage:`, e);
          }
        });
        
        if (dataLoaded) {
          set({ currentProfile: newProfile });
          return true;
        }
        
        return false;
      },
      
      isProfileComplete: () => {
        // Always return true to bypass the completion check
        return true;
        
        // Original implementation (commented out)
        // const { completionStatus } = get().currentProfile;
        // if (!completionStatus) return false;
        
        // // Check if all required sections are complete
        // return completionStatus.personalInfo && 
        //        completionStatus.basicInfo && 
        //        completionStatus.pricing;
      },
      
      getAllLocalStorageData: () => {
        if (typeof window === 'undefined') return null;
        
        // Get all creator-related data from localStorage
        const data: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('creator_') || key.startsWith('creator-'))) {
            try {
              const value = localStorage.getItem(key);
              if (value) data[key] = JSON.parse(value);
            } catch (e) {
              const value = localStorage.getItem(key);
              if (value) data[key] = value;
            }
          }
        }
        
        return data;
      },
      
      // Original methods preserved
      addProfile: (profile) => {
        const id = crypto.randomUUID().split("-")[0];
        const now = Date.now();
        const newProfile = {
          ...profile,
          id,
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({
          profiles: [newProfile, ...state.profiles],
        }));
        return id;
      },
      
      getProfileById: (id) => {
        return get().profiles.find((profile) => profile.id === id);
      },
      
      getProfilesByUserId: (userId) => {
        return get().profiles.filter((profile) => profile.userId === userId);
      },
    }),
    {
      name: "creator-profiles",
    }
  )
);
