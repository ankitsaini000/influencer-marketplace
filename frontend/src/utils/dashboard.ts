/**
 * Format numbers to be more readable
 * e.g. 1234 -> 1.2K, 1234567 -> 1.2M
 */
export const formatNumber = (num: number, decimals = 1): string => {
  if (!num && num !== 0) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  } else {
    return num.toLocaleString();
  }
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Determine influencer tier based on followers
 */
export const getInfluencerTier = (followers: number): string => {
  if (followers >= 1000000) {
    return 'Diamond';
  } else if (followers >= 500000) {
    return 'Platinum';
  } else if (followers >= 100000) {
    return 'Gold';
  } else if (followers >= 50000) {
    return 'Silver';
  } else if (followers >= 10000) {
    return 'Bronze';
  } else {
    return 'Starter';
  }
};

/**
 * Get benefits for influencer tier
 */
export const getTierBenefits = (tier: string): string[] => {
  const benefits = {
    'Starter': [
      'Basic dashboard access',
      'Standard support response time'
    ],
    'Bronze': [
      'Priority support',
      'Access to basic creator tools',
      'Monthly performance reports'
    ],
    'Silver': [
      'Featured in creator directory',
      'Access to exclusive events',
      'Weekly performance analytics',
      'Brand collaboration opportunities'
    ],
    'Gold': [
      'Dedicated account manager',
      'Premium dashboard features',
      'Early access to new features',
      'Priority brand collaboration matching'
    ],
    'Platinum': [
      'Revenue share improvements',
      'Premium profile verification',
      'VIP customer support',
      'Dedicated strategy sessions',
      'Exclusive brand partnerships'
    ],
    'Diamond': [
      'Custom platform features',
      'Executive account manager',
      'Highest revenue share',
      'Platform advisory board eligibility',
      'Exclusive promotional opportunities',
      'Custom analytics solutions'
    ]
  };
  
  return benefits[tier as keyof typeof benefits] || benefits['Starter'];
};

/**
 * Determine service tier based on completed projects and response rate
 */
export const getServiceTier = (completedProjects: number, responseRate: number): string => {
  if (completedProjects >= 100 && responseRate >= 95) {
    return 'VIP';
  } else if (completedProjects >= 50 && responseRate >= 90) {
    return 'Elite';
  } else if (completedProjects >= 20 && responseRate >= 85) {
    return 'Professional';
  } else if (completedProjects >= 5 && responseRate >= 75) {
    return 'Standard';
  } else {
    return 'Basic';
  }
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format percentage with a + or - sign
 */
export const formatPercentChange = (percent: number): string => {
  return percent > 0 ? `+${percent}%` : `${percent}%`;
};

/**
 * Generate a color based on performance
 */
export const getPerformanceColor = (percent: number): string => {
  if (percent > 10) return 'text-green-600';
  if (percent > 0) return 'text-green-500';
  if (percent === 0) return 'text-gray-600';
  if (percent > -10) return 'text-red-500';
  return 'text-red-600';
};

/**
 * Calculate tier progress percentage
 */
export const calculateTierProgress = (followers: number): number => {
  if (followers >= 1000000) {
    return 100;
  } else if (followers >= 500000) {
    return 80 + ((followers - 500000) / 500000) * 20;
  } else if (followers >= 100000) {
    return 60 + ((followers - 100000) / 400000) * 20;
  } else if (followers >= 50000) {
    return 40 + ((followers - 50000) / 50000) * 20;
  } else if (followers >= 10000) {
    return 20 + ((followers - 10000) / 40000) * 20;
  } else {
    return (followers / 10000) * 20;
  }
};

/**
 * Extract trend data from performance arrays
 * @param data Array of numerical values
 * @param days Number of days to analyze
 * @returns Object with trend analysis
 */
export const analyzeTrend = (data: number[], days = 7) => {
  if (!data || data.length < days) {
    return { 
      trend: 0, 
      average: 0,
      max: 0, 
      total: 0 
    };
  }

  const recent = data.slice(-days);
  const previous = data.slice(-2 * days, -days);
  
  const recentTotal = recent.reduce((sum, val) => sum + val, 0);
  const previousTotal = previous.length > 0 
    ? previous.reduce((sum, val) => sum + val, 0) 
    : 0;
  
  const trend = calculatePercentChange(recentTotal, previousTotal);
  const average = Math.round(recentTotal / recent.length);
  const max = Math.max(...recent);
  
  return {
    trend,
    average,
    max,
    total: recentTotal
  };
};

/**
 * Calculate profile completeness based on filled fields
 * @param profile Creator profile object
 * @returns Percentage of profile completeness
 */
export const calculateProfileCompleteness = (profile: any): number => {
  if (!profile) return 0;
  
  const requiredFields = [
    'firstName', 
    'lastName', 
    'username', 
    'email', 
    'bio', 
    'profileImage',
    'socialMedia',
    'categories',
    'location',
    'services'
  ];
  
  const optionalFields = [
    'website',
    'phoneNumber',
    'timezone',
    'languages',
    'portfolio'
  ];
  
  // Count required fields (worth 70% of completeness)
  let requiredCount = 0;
  for (const field of requiredFields) {
    if (profile[field] && 
      (typeof profile[field] !== 'object' || Object.keys(profile[field]).length > 0)) {
      requiredCount++;
    }
  }
  
  // Count optional fields (worth 30% of completeness)
  let optionalCount = 0;
  for (const field of optionalFields) {
    if (profile[field] && 
      (typeof profile[field] !== 'object' || Object.keys(profile[field]).length > 0)) {
      optionalCount++;
    }
  }
  
  const requiredPercentage = (requiredCount / requiredFields.length) * 70;
  const optionalPercentage = (optionalCount / optionalFields.length) * 30;
  
  return Math.round(requiredPercentage + optionalPercentage);
}; 