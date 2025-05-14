import API from './api';

/**
 * Interface for Performance Data
 */
export interface PerformanceData {
  views: number[];
  likes: number[];
  messages: number[];
  earnings: number[];
  dates?: string[];
}

/**
 * Interface for Creator Metrics
 */
export interface CreatorMetrics {
  followers: number;
  totalEarnings: number;
  completedProjects: number;
  responseRate: number;
  tierProgress: number;
  profileViews?: number;
  totalSocialFollowers?: number;
  profileCompleteness?: number;
  ratings?: {
    average: number;
    count: number;
  };
}

/**
 * Interface for Dashboard Data
 */
export interface DashboardData {
  metrics: CreatorMetrics;
  performanceData?: PerformanceData;
  orders?: any[];
  revenueBreakdown?: any[];
}

/**
 * Fetch creator profile data for the dashboard
 */
export const fetchCreatorProfile = async () => {
  try {
    const response = await API.get('/creators/me');
    console.log('✅ Successfully fetched creator profile:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching creator profile:', error);
    throw error;
  }
};

/**
 * Fetch creator dashboard metrics data
 */
export const fetchDashboardMetrics = async (): Promise<{ success: boolean; data: DashboardData }> => {
  try {
    const response = await API.get('/creators/dashboard');
    console.log('✅ Successfully fetched dashboard metrics:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Update creator metrics (including social media followers)
 */
export const updateCreatorMetrics = async (data: Partial<CreatorMetrics>) => {
  try {
    const response = await API.put('/creators/metrics', data);
    console.log('✅ Successfully updated creator metrics:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating creator metrics:', error);
    throw error;
  }
};

/**
 * Generate daily performance data for a specific timeframe
 * @param days Number of days to generate data for
 * @param baseValue Base value for the metrics
 * @param growth Growth factor (0-1)
 * @param volatility Volatility factor (0-1)
 */
export const generatePerformanceData = (
  days: number = 30,
  baseValue: { views: number; likes: number; messages: number; earnings: number } = { 
    views: 100, 
    likes: 20, 
    messages: 5, 
    earnings: 100 
  },
  growth: number = 0.05,
  volatility: number = 0.2
): PerformanceData => {
  // Create arrays for each metric
  const views: number[] = [];
  const likes: number[] = [];
  const messages: number[] = [];
  const earnings: number[] = [];
  const dates: string[] = [];

  // Generate dates and data points
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    dates.push(date.toISOString().split('T')[0]);

    // Apply growth and random volatility to each metric
    const growthFactor = 1 + (growth * i / days);
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    
    views.push(Math.round(baseValue.views * growthFactor * randomFactor));
    likes.push(Math.round(baseValue.likes * growthFactor * randomFactor));
    messages.push(Math.round(baseValue.messages * growthFactor * randomFactor));
    earnings.push(Math.round(baseValue.earnings * growthFactor * randomFactor));
  }

  return { views, likes, messages, earnings, dates };
}; 