import React from 'react';
// @ts-ignore - Ignore recharts import errors
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PromotionRevenue {
  type: string;
  amount: number;
  color: string;
}

interface RevenueBreakdownProps {
  promotionRevenueData: PromotionRevenue[];
}

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ promotionRevenueData }) => {
  // Calculate total revenue
  const totalRevenue = promotionRevenueData.reduce((sum, item) => sum + item.amount, 0);
  
  // Format data for pie chart
  const chartData = promotionRevenueData.map(item => ({
    name: item.type,
    value: item.amount,
    color: item.color
  }));

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-100">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm text-gray-700">${data.value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{(data.value / totalRevenue * 100).toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="text-sm mt-4 space-y-1">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
            <span className="mx-2 text-gray-400">-</span>
            <span className="text-gray-900 font-medium">
              ${chartData.find(item => item.name === entry.value)?.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
          <div className="text-sm text-gray-500 mt-1 md:mt-0">
            Total: ${totalRevenue.toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64">
            {/* @ts-ignore - Suppressing TypeScript errors for Recharts components */}
            <ResponsiveContainer width="100%" height="100%">
              {/* @ts-ignore */}
              <PieChart>
                {/* @ts-ignore */}
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    /* @ts-ignore */
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* @ts-ignore */}
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="md:col-span-1 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Promotion Type</h4>
            <ul className="space-y-3">
              {promotionRevenueData.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">
                      {(item.amount / totalRevenue * 100).toFixed(1)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueBreakdown; 