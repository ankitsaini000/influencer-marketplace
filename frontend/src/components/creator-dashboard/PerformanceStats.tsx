import React, { useState, useMemo } from 'react';
// @ts-ignore - Ignore recharts import errors
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceData {
  views: number[];
  likes: number[];
  messages: number[];
  earnings: number[];
  dates?: string[];
}

interface PerformanceStatsProps {
  performanceData: PerformanceData;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ performanceData }) => {
  const [activeMetric, setActiveMetric] = useState<'views' | 'likes' | 'messages' | 'earnings'>('views');
  const [timeRange, setTimeRange] = useState<'week' | 'twoWeeks' | 'month'>('twoWeeks');
  
  const metrics = [
    { id: 'views', name: 'Profile Views', color: '#3b82f6', gradientFrom: '#93c5fd', gradientTo: '#dbeafe' },
    { id: 'likes', name: 'Likes', color: '#ec4899', gradientFrom: '#f9a8d4', gradientTo: '#fce7f3' },
    { id: 'messages', name: 'Messages', color: '#8b5cf6', gradientFrom: '#c4b5fd', gradientTo: '#ede9fe' },
    { id: 'earnings', name: 'Earnings ($)', color: '#10b981', gradientFrom: '#6ee7b7', gradientTo: '#d1fae5' }
  ];

  // Generate dates if not provided
  const dates = performanceData.dates || Array.from({ length: performanceData.views.length }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (performanceData.views.length - i - 1));
    return d.toISOString().split('T')[0];
  });

  // Get data for selected time range
  const getFilteredData = () => {
    let dataLength = performanceData.views.length;
    let rangeLength = timeRange === 'week' ? 7 : timeRange === 'twoWeeks' ? 14 : 30;
    rangeLength = Math.min(rangeLength, dataLength);
    
    const startIndex = Math.max(0, dataLength - rangeLength);
    
    return {
      dates: dates.slice(startIndex),
      views: performanceData.views.slice(startIndex),
      likes: performanceData.likes.slice(startIndex),
      messages: performanceData.messages.slice(startIndex),
      earnings: performanceData.earnings.slice(startIndex)
    };
  };
  
  const filteredData = useMemo(() => getFilteredData(), [performanceData, timeRange]);

  // Format data for chart
  const chartData = useMemo(() => {
    return filteredData.dates.map((date, index) => ({
      date,
      views: filteredData.views[index] || 0,
      likes: filteredData.likes[index] || 0,
      messages: filteredData.messages[index] || 0,
      earnings: filteredData.earnings[index] || 0
    }));
  }, [filteredData]);

  // Calculate statistics
  const getStats = (data: number[]) => {
    if (!data.length) return { total: 0, avg: 0, max: 0, change: 0 };
    
    const total = data.reduce((sum, val) => sum + val, 0);
    const avg = Math.round(total / data.length);
    const max = Math.max(...data);
    
    // Calculate change percentage
    let change = 0;
    
    if (data.length >= 6) {
      // Calculate change between first and second half of the period
      const halfPoint = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, halfPoint).reduce((sum, val) => sum + val, 0);
      const secondHalf = data.slice(halfPoint).reduce((sum, val) => sum + val, 0);
      change = firstHalf > 0 ? Math.round((secondHalf - firstHalf) / firstHalf * 100) : (secondHalf > 0 ? 100 : 0);
    } else if (data.length > 1) {
      const first = data[0];
      const last = data[data.length - 1];
      change = first > 0 ? Math.round((last - first) / first * 100) : (last > 0 ? 100 : 0);
    }
    
    return { total, avg, max, change };
  };

  const stats = useMemo(() => ({
    views: getStats(filteredData.views),
    likes: getStats(filteredData.likes),
    messages: getStats(filteredData.messages),
    earnings: getStats(filteredData.earnings)
  }), [filteredData]);

  // Format numbers for display with K/M suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Stats</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === 'week'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('twoWeeks')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === 'twoWeeks'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                2 Weeks
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  timeRange === 'month'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month
              </button>
            </div>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {metrics.map(metric => (
                <button
                  key={metric.id}
                  onClick={() => setActiveMetric(metric.id as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    activeMetric === metric.id
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {metric.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'earnings' ? `$${formatNumber(stats[activeMetric].total)}` : formatNumber(stats[activeMetric].total)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Daily Average</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'earnings' ? `$${formatNumber(stats[activeMetric].avg)}` : formatNumber(stats[activeMetric].avg)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Peak Day</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'earnings' ? `$${formatNumber(stats[activeMetric].max)}` : formatNumber(stats[activeMetric].max)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Growth</p>
              {stats[activeMetric].change !== 0 && (
                stats[activeMetric].change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )
              )}
            </div>
            <p className={`text-xl font-bold ${stats[activeMetric].change > 0 ? 'text-green-600' : stats[activeMetric].change < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stats[activeMetric].change > 0 ? '+' : ''}{stats[activeMetric].change}%
            </p>
          </div>
        </div>
        
        <div className="h-80">
          {/* @ts-ignore - Suppressing TypeScript errors for Recharts components */}
          <ResponsiveContainer width="100%" height="100%">
            {/* @ts-ignore */}
            <AreaChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <defs>
                {metrics.map(metric => (
                  <linearGradient key={metric.id} id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.gradientFrom} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={metric.gradientTo} stopOpacity={0.2}/>
                  </linearGradient>
                ))}
              </defs>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              {/* @ts-ignore */}
              <XAxis 
                dataKey="date" 
                tickFormatter={(date: string) => {
                  const d = new Date(date);
                  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={10}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              {/* @ts-ignore */}
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value: number) => activeMetric === 'earnings' ? `$${formatNumber(value)}` : formatNumber(value)}
                width={50}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              {/* @ts-ignore */}
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const formattedValue = activeMetric === 'earnings' ? `$${value.toLocaleString()}` : value.toLocaleString();
                  
                  const metricNames = {
                    earnings: 'Earnings',
                    views: 'Profile Views',
                    likes: 'Likes',
                    messages: 'Messages'
                  };
                  
                  return [formattedValue, metricNames[name as keyof typeof metricNames]];
                }}
                labelFormatter={(label: string | number) => {
                  const date = typeof label === 'string' ? label : label.toString();
                  return new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '10px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0'
                }}
              />
              {/* @ts-ignore */}
              {activeMetric === 'views' && (
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke={metrics[0].color} 
                  strokeWidth={2} 
                  fill={`url(#gradient-views)`} 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} 
                />
              )}
              {/* @ts-ignore */}
              {activeMetric === 'likes' && (
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stroke={metrics[1].color} 
                  strokeWidth={2} 
                  fill={`url(#gradient-likes)`} 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} 
                />
              )}
              {/* @ts-ignore */}
              {activeMetric === 'messages' && (
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stroke={metrics[2].color} 
                  strokeWidth={2} 
                  fill={`url(#gradient-messages)`}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} 
                />
              )}
              {/* @ts-ignore */}
              {activeMetric === 'earnings' && (
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke={metrics[3].color} 
                  strokeWidth={2} 
                  fill={`url(#gradient-earnings)`} 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats; 