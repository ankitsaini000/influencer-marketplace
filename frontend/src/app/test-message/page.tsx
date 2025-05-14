'use client';

import React, { useState, useEffect } from 'react';
import { sendMessageToCreator } from '@/services/api';
import { toast } from 'react-hot-toast';
import API from '@/services/api';
import Link from 'next/link';

export default function TestMessagePage() {
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('Test Message');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [useDirect, setUseDirect] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Get auth information for debugging
    try {
      const user = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      setAuthInfo({
        token: token ? `${token.substring(0, 10)}...` : null,
        user: user ? JSON.parse(user) : null,
        userRole,
        isAuthenticated: !!token
      });
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to send messages.');
      return;
    }
    
    if (!receiverId || !content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSending(true);
    setResult(null);
    
    try {
      console.log(`Attempting to send message to ${receiverId}:`);
      
      // Call the API function to send message with test mode enabled
      const response = await API.post('/messages', {
        receiverId,
        content: subject ? `${subject}: ${content}` : content,
        isTestMode: true // Enable test mode to ensure it saves to database
      });
      
      console.log('Message send response:', response.data);
      setResult(response.data);
      
      toast.success('Message sent and saved to database!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Try the fallback method using the sendMessageToCreator function
      try {
        console.log('Trying fallback method with sendMessageToCreator');
        const fallbackResponse = await sendMessageToCreator({
          receiverId,
          content,
          subject
        });
        
        console.log('Fallback response:', fallbackResponse);
        setResult(fallbackResponse);
        toast.success('Message created through fallback method');
      } catch (fallbackError) {
        console.error('Even fallback method failed:', fallbackError);
        setResult({
          error: true,
          message: error.message || 'Failed to send message',
          details: error.response?.data || error.toString()
        });
        toast.error(`Failed to send message: ${error.message}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Message API</h1>
      
      {!isAuthenticated && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Not Authenticated!</strong> You must be logged in to use this feature. 
          <a href="/login" className="underline ml-2">Go to login page</a>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-6">
        <h3 className="font-medium mb-2">Authentication Info:</h3>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(authInfo, null, 2)}</pre>
        
        <p className="mt-2 text-sm">
          <strong>Note:</strong> For test messages, you can also visit the {' '}
          <a href="/test-message-endpoint" className="text-blue-600 underline">endpoint test page</a> to verify API connectivity.
        </p>
      </div>
      
      <div className="p-3 mb-6 bg-green-50 border border-green-200 rounded">
        <h3 className="font-medium text-gray-800">Messages are now being saved to MongoDB</h3>
        <p className="text-sm text-gray-600 mt-1">
          The updated code now saves all messages to MongoDB, even in test mode.
          This ensures your messages persist in the database even when using test features.
        </p>
        <div className="mt-2">
          <Link 
            href="/messages" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            View Messages Page →
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Receiver ID (required):</label>
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter the receiver's user ID"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Any valid MongoDB ObjectId will work. The message will be saved to the database.
          </p>
        </div>
        
        <div>
          <label className="block mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter message subject"
          />
        </div>
        
        <div>
          <label className="block mb-1">Message Content (required):</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2 h-32"
            placeholder="Type your message here..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSending || !isAuthenticated}
          className={`px-4 py-2 rounded ${
            !isAuthenticated ? 'bg-gray-400' :
            isSending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium`}
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className={`p-4 rounded ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Guide:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your backend server is running on port 5001</li>
          <li>Check that you are authenticated (logged in)</li>
          <li>Use a valid MongoDB ObjectId for the receiver ID</li>
          <li>Check the browser console for detailed error messages</li>
          <li>
            <span className="block mt-1">
              Message routes should be registered at these endpoints:
            </span>
            <code className="block bg-gray-100 p-1 text-xs mt-1">GET /api/messages/test</code>
            <code className="block bg-gray-100 p-1 text-xs">POST /api/messages</code>
          </li>
        </ul>
      </div>
    </div>
  );
} 