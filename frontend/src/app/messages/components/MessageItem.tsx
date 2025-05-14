import React from 'react';

interface MessageProps {
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageItem: React.FC<MessageProps> = ({ content, timestamp, isSent, isRead = false }) => {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
        isSent 
          ? 'bg-purple-600 text-white rounded-br-none' 
          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
        }`}>
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div className={`text-xs mt-1 flex items-center ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>
          <span>{formatTime(timestamp)}</span>
          {isSent && (
            <span className="ml-2">
              {isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 