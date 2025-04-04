const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Around line 1214 where the createNewCreatorProfile function is defined
export const createNewCreatorProfile = async (profileData: any) => {
  try {
    // Make sure we're using the correct endpoint that exists on the backend
    const response = await fetch(`${API_URL}/creators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating creator profile:', error);
    throw error;
  }
};