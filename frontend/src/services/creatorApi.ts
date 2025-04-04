/**
 * API functions for creator-related operations
 */

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
    
    // First try to load published creator data from localStorage (if this was just published)
    const justPublished = localStorage.getItem('just_published') === 'true';
    const publishedUsername = localStorage.getItem('published_username');
    
    if (justPublished && publishedUsername === username) {
      console.log(`Using just published data for ${username}`);
      
      // This is a newly published profile, clear the flags after using them
      localStorage.removeItem('just_published');
      localStorage.removeItem('published_username');
      
      // Construct a mock profile for development
      const mockData = {
        _id: `mock_${Date.now()}`,
        personalInfo: {
          username: username,
          fullName: username,
          name: username
        },
        status: 'published',
        stats: {
          followers: 0,
          following: 0,
          projects: 0
        }
      };
      
      // Cache this for future use
      localStorage.setItem(`creator_${username}`, JSON.stringify(mockData));
      
      return { data: mockData, error: null };
    }
    
    // Get auth token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Try to fetch the creator from API - set a timeout to prevent long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(`/api/creators/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Creator ${username} not found`);
          return { data: null, error: `Creator "${username}" not found` };
        }
        
        if (response.status === 401) {
          console.log(`Authentication required for ${username} - using fallback`);
          
          // Try our fallback approach if we have a cached version
          const cachedCreator = localStorage.getItem(`creator_${username}`);
          if (cachedCreator) {
            return { data: JSON.parse(cachedCreator), error: null };
          }
          
          // For development, create mock data if API fails with 401
          if (process.env.NODE_ENV === 'development') {
            console.log('Using mock data for development (401 error)');
            const mockData = {
              _id: `mock_${Date.now()}`,
              personalInfo: {
                username: username,
                fullName: `${username} (Mock)`,
                name: username
              },
              stats: {
                followers: 125,
                following: 56,
                projects: 8
              },
              status: 'published'
            };
            
            // Cache this for future use
            localStorage.setItem(`creator_${username}`, JSON.stringify(mockData));
            
            return { data: mockData, error: null };
          }
          
          return { data: null, error: 'Authentication required to view this profile' };
        }
        
        throw new Error(`Failed to fetch creator: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the profile data for offline use
      if (typeof window !== 'undefined') {
        localStorage.setItem(`creator_${username}`, JSON.stringify(data));
      }
      
      return { data, error: null };
    } catch (fetchError: any) {
      // Handle timeout or network errors
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out - using fallback');
        
        // Check for cached data first
        const cachedCreator = localStorage.getItem(`creator_${username}`);
        if (cachedCreator) {
          return { data: JSON.parse(cachedCreator), error: null };
        }
        
        // For development, create mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for development (timeout)');
          const mockData = {
            _id: `mock_${Date.now()}`,
            personalInfo: {
              username: username,
              fullName: `${username} (Mock)`,
              name: username
            },
            stats: {
              followers: 125,
              following: 56,
              projects: 8
            },
            status: 'published'
          };
          return { data: mockData, error: null };
        }
        
        return { data: null, error: 'Request timed out. Please try again later.' };
      }
      
      throw fetchError; // Re-throw if not an abort error
    }
  } catch (error: any) {
    console.error(`Error fetching creator ${username}:`, error);
    
    // Check if we have cached data
    const cachedCreator = localStorage.getItem(`creator_${username}`);
    if (cachedCreator) {
      console.log(`Using cached profile data for ${username}`);
      return { data: JSON.parse(cachedCreator), error: null };
    }
    
    // For development, create mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development (general error)');
      const mockData = {
        _id: `mock_${Date.now()}`,
        personalInfo: {
          username: username,
          fullName: `${username} (Mock)`,
          name: username
        },
        stats: {
          followers: 125,
          following: 56,
          projects: 8
        },
        status: 'published'
      };
      return { data: mockData, error: null };
    }
    
    return { data: null, error: error.message || 'Failed to fetch creator profile' };
  }
}; 