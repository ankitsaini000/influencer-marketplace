'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MessagesSquare, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

export const CreatorDescriptionFaq = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brief: '',
    detailed: '',
    faq: [] as { question: string; answer: string }[]
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [briefCharCount, setBriefCharCount] = useState(0);
  const [detailedCharCount, setDetailedCharCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Try to load existing data if available
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.descriptionFaq) {
          setFormData(prev => ({
            ...prev,
            ...userData.descriptionFaq
          }));
          
          if (userData.descriptionFaq.brief) {
            setBriefCharCount(userData.descriptionFaq.brief.length);
          }
          
          if (userData.descriptionFaq.detailed) {
            setDetailedCharCount(userData.descriptionFaq.detailed.length);
          }
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const handleBriefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBriefCharCount(value.length);
    setFormData(prev => ({ ...prev, brief: value }));
  };

  const handleDetailedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDetailedCharCount(value.length);
    setFormData(prev => ({ ...prev, detailed: value }));
  };

  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaq = [...formData.faq];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setFormData(prev => ({ ...prev, faq: updatedFaq }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Starting Description & FAQ Form Submission ===');
    console.log('Form data:', formData);
    
    if (!formData.brief || !formData.detailed) {
      setError("Both brief and detailed descriptions are required");
      toast.error("Please provide both brief and detailed descriptions");
      return;
    }
    
    if (formData.brief.length < 50) {
      setError("Brief description should be at least 50 characters");
      toast.error("Please write a more detailed brief description");
      return;
    }
    
    if (formData.detailed.length < 200) {
      setError("Detailed description should be at least 200 characters");
      toast.error("Please provide a more comprehensive detailed description");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Updating local storage and store...');
      
      // Import the creator profile store
      const { useCreatorProfileStore } = await import('../../store/creatorProfileStore');
      const store = useCreatorProfileStore.getState();
      
      // Update the store first
      store.updateCurrentProfile('descriptionFaq', {
        brief: formData.brief,
        detailed: formData.detailed,
        faq: formData.faq
      });
      
      // Save to localStorage
      store.saveToLocalStorage();
      
      // Update userData with description info
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userData.descriptionFaq = formData;
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      console.log('Local storage updated successfully');

      // Try saving to MongoDB
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found - will navigate without server save');
          toast.error('Authentication token not found. Data saved locally only.');
          setTimeout(() => {
            router.push("/creator-setup/social-media");
          }, 1500);
          return;
        }
        
        console.log('Preparing to send data to MongoDB...');
        
        // Save to MongoDB - Make API call
        // Try multiple endpoints if the primary one fails
        let response;
        let lastError;

        // Try port 5001 first
        try {
          console.log('Trying primary endpoint (port 5001)...');
          response = await fetch('http://localhost:5001/api/creators/description', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
          });
        } catch (err) {
          console.error('Primary endpoint failed:', err);
          lastError = err;
        }

        // If port 5001 fails, try port 5000
        if (!response || !response.ok) {
          console.log('Trying fallback endpoint (port 5000)...');
          try {
            response = await fetch('http://localhost:5000/api/creators/description', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(formData)
            });
          } catch (err) {
            console.error('Fallback endpoint failed:', err);
            lastError = err;
          }
        }

        // No working endpoints
        if (!response || !response.ok) {
          console.error('All API endpoints failed');
          if (response && response.status === 500) {
            throw new Error('The server encountered an internal error. Your data has been saved locally and will be synchronized later.');
          } else if (response) {
            if (response.status === 403) {
              throw new Error('You do not have permission to perform this action. Please ensure you are logged in as a creator.');
            }
            if (response.status === 401) {
              throw new Error('Your session has expired. Please log in again.');
            }
            // Save to JSON only if response exists
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to save description data. Status: ${response.status}`);
          } else if (lastError) {
            throw new Error('Could not connect to the server. Your data has been saved locally and will be synchronized later.');
          } else {
            throw new Error('Unknown error occurred. Your data has been saved locally.');
          }
        }
        
        console.log('API Response status:', response.status);
        
        const result = await response.json();
        console.log('MongoDB Save Result:', result);
        
        // Display a clear success message
        toast.success('Description and FAQ saved to MongoDB successfully!');
        console.log('Success message displayed to user');
      } catch (apiError: any) {
        console.error('API error:', apiError);
        // Show error toast but continue with navigation
        toast.error(apiError.message || 'Server error, but your data is saved locally');
        
        // If it's an authentication error, redirect to login
        if (apiError.message && (apiError.message.includes('session has expired') || apiError.message.includes('not found'))) {
          console.log('Authentication error detected, redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
      }
      
      // Add a visible confirmation and navigate
      console.log('Preparing to navigate to next page...');
      setTimeout(() => {
        router.push("/creator-setup/social-media");
      }, 1500);
      
      console.log('=== Description & FAQ Form Submission Completed Successfully ===');
    } catch (err: any) {
      console.error("Error in form submission:", err);
      const errorMessage = err.message || "An error occurred while saving your data";
      
      toast.error(errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
      
      console.log('=== Description & FAQ Form Submission Failed ===');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={3} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Description & FAQ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell potential clients about your services and answer common questions they might have.
            A clear description and well-prepared FAQs can significantly increase your booking rate.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brief Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                Brief Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.brief}
                onChange={handleBriefChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="Provide a short summary of the services you offer (50-150 characters)"
                maxLength={150}
                required
              ></textarea>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min. 50 characters</span>
                <span className={briefCharCount < 50 ? 'text-red-500' : briefCharCount > 120 ? 'text-amber-500' : 'text-green-500'}>
                  {briefCharCount}/150
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MessagesSquare className="w-4 h-4 mr-2" />
                Detailed Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.detailed}
                onChange={handleDetailedChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[200px]"
                placeholder="Provide a comprehensive description of your services, experience, and what sets you apart from others (200-1200 characters)"
                maxLength={1200}
                required
              ></textarea>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min. 200 characters</span>
                <span className={detailedCharCount < 200 ? 'text-red-500' : detailedCharCount > 1000 ? 'text-amber-500' : 'text-green-500'}>
                  {detailedCharCount}/1200
                </span>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <HelpCircle className="w-4 h-4 mr-2" />
                Frequently Asked Questions
              </label>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Adding FAQs helps potential clients understand your services better and addresses 
                  common concerns before they reach out to you. This can save time and increase bookings.
                </p>
              </div>
              
              {formData.faq.length > 0 ? (
                <div className="space-y-6">
                  {formData.faq.map((item, index) => (
                    <div key={index} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFaq(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question {index + 1}
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                          placeholder="e.g., What is your turnaround time?"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                          placeholder="Provide a clear and concise answer"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[100px]"
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">No FAQs added yet. Click the button below to add your first FAQ.</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </button>
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