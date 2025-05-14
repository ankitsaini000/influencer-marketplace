"use client";

import React from 'react';
import { 
  Users, Award, Zap, Crown, BadgeCheck, Target, TrendingUp, Badge, DollarSign, Package, ArrowUpIcon, ArrowDownIcon, Eye, Globe
} from 'lucide-react';
// @ts-ignore - Temporarily ignore module not found error
import { formatNumber, getInfluencerTier, getServiceTier } from '../../utils/dashboard';

interface CreatorMetrics {
  followers: number;
  totalEarnings: number;
  completedProjects: number;
  responseRate: number;
  tierProgress: number;
  influencerTier?: string;
  serviceTier?: string;
  profileViews?: number;
  totalSocialFollowers?: number;
  profileCompleteness?: number;
  ratings?: {
    average: number;
    count: number;
  };
}

interface DashboardMetricsProps {
  metrics: CreatorMetrics;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  // Get tiers if not provided
  const influencerTier = metrics.influencerTier || getInfluencerTier(metrics.followers);
  const serviceTier = metrics.serviceTier || getServiceTier(metrics.completedProjects, metrics.responseRate);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Creator Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Profile Views</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(metrics.profileViews || 0)}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">${formatNumber(metrics.totalEarnings)}</p>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>12.5%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Social Followers</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(metrics.totalSocialFollowers || 0)}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.responseRate}%</p>
                </div>
                {metrics.responseRate >= 90 ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                    <span>1.2%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                    <span>2.4%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Influencer Tier */}
          <div className="bg-blue-50 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Influencer Tier</p>
              <h4 className="text-2xl font-bold text-blue-900 mt-1">{influencerTier}</h4>
              <p className="text-sm text-blue-700 mt-1">
                Based on follower count and engagement
              </p>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-800 mb-1">
                <span>Progress</span>
                <span>{metrics.tierProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${metrics.tierProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {metrics.tierProgress < 100 
                  ? `${formatNumber(Math.ceil((100 - metrics.tierProgress) / 100 * 50000))} more followers until next tier` 
                  : 'You\'ve reached the highest tier!'}
              </p>
            </div>
          </div>
          
          {/* Service Tier */}
          <div className="bg-purple-50 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">Service Tier</p>
              <h4 className="text-2xl font-bold text-purple-900 mt-1">{serviceTier}</h4>
              <p className="text-sm text-purple-700 mt-1">
                Based on completed projects and response rate
              </p>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-900">Next tier requirements:</p>
                <ul className="text-xs text-purple-800 mt-2 space-y-1">
                  {serviceTier === 'Standard' && (
                    <>
                      <li>• Complete 20+ projects</li>
                      <li>• Maintain 85%+ response rate</li>
                    </>
                  )}
                  {serviceTier === 'Professional' && (
                    <>
                      <li>• Complete 50+ projects</li>
                      <li>• Maintain 90%+ response rate</li>
                    </>
                  )}
                  {serviceTier === 'Elite' && (
                    <>
                      <li>• Complete 100+ projects</li>
                      <li>• Maintain 95%+ response rate</li>
                    </>
                  )}
                  {serviceTier === 'VIP' && (
                    <li>• You've reached the highest tier!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics; 