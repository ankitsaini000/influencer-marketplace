import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const Overview = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }

      const response = await axios.post('/api/creators/overview', 
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Store in localStorage as backup
        localStorage.setItem('creator-overview', JSON.stringify(formData));
        
        toast.success(response.data.message || 'Data successfully stored in MongoDB!');
        router.push("/profile-creation/pricing");
      }
    } catch (error: any) {
      console.error('Error saving overview:', error);
      
      // Enhanced error handling
      if (!error.response) {
        // Network error
        toast.error('Network error - Please check your internet connection or if the server is running');
      } else if (error.response.status === 401) {
        toast.error('Session expired - Please login again');
        router.push('/login');
      } else if (error.response.status === 403) {
        toast.error('Access denied - You do not have permission to perform this action');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save overview. Please try again.');
      }
    }
  };

  // Rest of your component code...
}; 