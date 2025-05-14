import React from 'react';
import Link from 'next/link';

interface Participant {
  _id: string;
  fullName: string;
  username?: string;
  avatar?: string;
}

interface ConversationItemProps {
  id: string;
  otherParticipant: Participant;
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  id, 
  otherParticipant, 
  lastMessage, 
  unreadCount 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the date is today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the date is within the last week, show day of week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Link href={`/messages/${id}`}>
      <div className={`p-4 flex hover:bg-gray-50 transition cursor-pointer ${!lastMessage.isRead ? 'bg-purple-50' : ''}`}>
        <div className="flex-shrink-0 mr-3">
          {otherParticipant.avatar ? (
            <img 
              src={otherParticipant.avatar} 
              alt={otherParticipant.fullName} 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-medium text-lg">
              {otherParticipant.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {otherParticipant.fullName}
              {otherParticipant.username && (
                <span className="ml-1 text-gray-500 text-xs">
                  @{otherParticipant.username}
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-500">
              {formatDate(lastMessage.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 truncate">
            {lastMessage.content}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="ml-3 flex-shrink-0">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-xs">
              {unreadCount}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ConversationItem; 