"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getConversations } from '@/services/api';
import ConversationItem from '../../app/messages/components/ConversationItem';

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    fullName: string;
    username?: string;
    avatar?: string;
  }[];
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export function MessagePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    fetchConversations();
  }, [isAuthenticated, router]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching conversations from the backend');
      const data = await getConversations();
      
      if (data) {
        console.log('Conversations fetched successfully:', data);
        setConversations(data);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to determine the other participant in the conversation
  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return conversation.participants[0];
    
    return conversation.participants.find(p => p._id !== user._id) || conversation.participants[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-purple-500 to-indigo-600">
            <h1 className="text-xl font-semibold text-white">Messages</h1>
          </div>
          
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading conversations...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700">{error}</p>
              <button 
                onClick={fetchConversations}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && conversations.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-gray-500">
                When you connect with creators or brands, your conversations will appear here.
              </p>
            </div>
          )}
          
          {!loading && !error && conversations.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {conversations.map(conversation => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <li key={conversation._id}>
                    <ConversationItem 
                      id={conversation._id}
                      otherParticipant={otherParticipant}
                      lastMessage={conversation.lastMessage}
                      unreadCount={conversation.unreadCount}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
