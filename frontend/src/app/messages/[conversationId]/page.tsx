"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getConversationMessages, markMessagesAsRead, sendMessage } from '@/services/api';
import MessageItem from '../components/MessageItem';

interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface Participant {
  _id: string;
  fullName: string;
  username?: string;
  avatar?: string;
  email?: string;
}

const ConversationPage = ({ params }: { params: { conversationId: string } }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.conversationId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 15000); // Poll every 15 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, conversationId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      setError(null);
      
      console.log(`Fetching messages for conversation: ${conversationId}`);
      
      if (conversationId.startsWith('mock-')) {
        // For mock conversations, generate data directly (no API calls needed)
        console.log('Using mock data for conversation');
        setMessages(generateMockMessages());
        setOtherParticipant(generateMockParticipant());
      } else {
        // Get messages from API
        const data = await getConversationMessages(conversationId);
        
        if (data) {
          console.log('Messages fetched successfully:', data);
          
          // If API returns both messages and participants
          if (data.messages) {
            setMessages(data.messages);
            
            // Find the other participant
            if (data.participants && user) {
              const other = data.participants.find((p: Participant) => p._id !== user._id);
              if (other) {
                setOtherParticipant(other);
              }
            }
          } else {
            // If API just returns messages array
            setMessages(data);
            
            // Try to get other participant from first message
            if (data.length > 0 && user) {
              const firstMsg = data[0];
              const otherUserId = firstMsg.senderId === user._id ? firstMsg.receiverId : firstMsg.senderId;
              
              // For demo purposes, create a basic participant
              setOtherParticipant({
                _id: otherUserId,
                fullName: `User ${otherUserId.substring(0, 5)}`,
              });
            }
          }
          
          // Mark messages as read
          try {
            await markMessagesAsRead(conversationId);
          } catch (readError) {
            console.error('Error marking messages as read:', readError);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      if (showLoading) {
        setError('Failed to load messages. Please try again later.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const generateMockMessages = (): Message[] => {
    // Generate between 5-20 mock messages
    const count = Math.floor(Math.random() * 15) + 5;
    const mockMessages: Message[] = [];
    
    // Create a user ID if we don't have one
    const currentUserId = user?._id || 'current-user';
    const otherUserId = `other-user-${conversationId}`;
    
    for (let i = 1; i <= count; i++) {
      // Alternate between sent and received messages
      const isSent = i % 2 === 0;
      
      mockMessages.push({
        _id: `mock-message-${conversationId}-${i}`,
        content: `This is message #${i} in this conversation. ${isSent ? 'Sent by you.' : 'Received from the other person.'}`,
        senderId: isSent ? currentUserId : otherUserId,
        receiverId: isSent ? otherUserId : currentUserId,
        createdAt: new Date(Date.now() - (count - i) * 3600000).toISOString(),
        isRead: true
      });
    }
    
    return mockMessages;
  };

  const generateMockParticipant = (): Participant => {
    const id = conversationId.replace('mock-conversation-', '');
    return {
      _id: `other-user-${conversationId}`,
      fullName: `User ${id}`,
      username: `user${id}`,
      avatar: `https://placehold.co/100x100?text=User${id}`,
      email: `user${id}@example.com`
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !otherParticipant) {
      return;
    }
    
    setSending(true);
    
    try {
      // Create a temporary message to show immediately
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        content: newMessage,
        senderId: user._id,
        receiverId: otherParticipant._id,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // Add to UI immediately for better UX
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Send to API
      if (conversationId.startsWith('mock-')) {
        // For mock conversations, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Mock message sent:', tempMessage);
      } else {
        // Send message via API
        const response = await sendMessage(otherParticipant._id, newMessage);
        
        console.log('Message sent successfully:', response);
        
        // Update the message in state with the real data from API
        if (response) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempMessage._id ? { ...response, _id: response._id || msg._id } : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
      
      // Remove the temporary message
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
      // Put the message text back in the input
      setNewMessage(newMessage);
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (dateString: string, index: number) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    // For first message, always show date
    if (index === 0) return formattedDate;
    
    // For other messages, check if we need to show a date separator
    const prevDate = new Date(messages[index - 1].createdAt);
    if (date.toDateString() !== prevDate.toDateString()) {
      return formattedDate;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto p-4 w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[85vh]">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard/messages" className="mr-3 text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              
              {otherParticipant && (
                <div className="flex items-center">
                  {otherParticipant.avatar ? (
                    <img 
                      src={otherParticipant.avatar} 
                      alt={otherParticipant.fullName} 
                      className="h-8 w-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-medium text-lg mr-2">
                      {otherParticipant.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h1 className="text-lg font-semibold text-white">
                    {otherParticipant.fullName}
                    {otherParticipant.username && (
                      <span className="ml-1 text-gray-200 text-sm">
                        @{otherParticipant.username}
                      </span>
                    )}
                  </h1>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading && (
              <div className="h-full flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                <p className="ml-3 text-gray-600">Loading messages...</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{error}</p>
                  <button 
                    onClick={() => fetchMessages()}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {!loading && !error && messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-gray-500">
                    Be the first to start this conversation!
                  </p>
                </div>
              </div>
            )}
            
            {!loading && !error && messages.length > 0 && (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isSentMessage = user && message.senderId === user._id;
                  const dateSeparator = formatMessageDate(message.createdAt, index);
                  
                  return (
                    <div key={message._id}>
                      {dateSeparator && (
                        <div className="text-center my-4">
                          <span className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                            {dateSeparator}
                          </span>
                        </div>
                      )}
                      
                      <MessageItem 
                        content={message.content}
                        timestamp={message.createdAt}
                        isSent={!!isSentMessage}
                        isRead={message.isRead}
                      />
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <form onSubmit={handleSend} className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage; 