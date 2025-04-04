'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

interface ViewProfileButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  text?: string;
  showIcon?: boolean;
}

export const ViewProfileButton = ({
  className = '',
  variant = 'primary',
  text = 'View Your Public Profile',
  showIcon = true
}: ViewProfileButtonProps) => {
  const [profileUrl, setProfileUrl] = useState('/creator-dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      if (username) {
        setProfileUrl(`/creator/${username}`);
      }
    }
  }, []);

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200';
    
    if (variant === 'primary') {
      return `${baseClasses} bg-amber-600 hover:bg-amber-700 text-white ${className}`;
    }
    
    return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-800 ${className}`;
  };

  return (
    <Link href={profileUrl} className={getButtonClasses()}>
      {showIcon && <User className="w-5 h-5 mr-2" />}
      {text}
    </Link>
  );
};

export default ViewProfileButton; 