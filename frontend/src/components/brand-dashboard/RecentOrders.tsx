"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, ShoppingBag, Clock, FileText, Filter, ArrowDown, ArrowUp, Copy, Check } from 'lucide-react';
import { getMyOrders } from '../../services/api';

interface RecentOrdersProps {
  setSelectedOrder: (order: any) => void;
  setShowOrderDetail: (show: boolean) => void;
}

export default function RecentOrders({ setSelectedOrder, setShowOrderDetail }: RecentOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getMyOrders(page, 10);
        
        if (response.success && response.data) {
          setOrders(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page]);

  // Format currency
  const formatCurrency = (amount: any) => {
    if (typeof amount === 'string') {
      // If it's already a formatted string with currency symbol, return as is
      if (amount.includes('₹') || amount.includes('$')) {
        return amount;
      }
      // Try to parse the string to a number
      amount = Number(amount.replace(/[^0-9.-]+/g, ""));
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' 
        ? a.totalAmount - b.totalAmount 
        : b.totalAmount - a.totalAmount;
    }
    // Default to date sorting
    return sortOrder === 'asc' 
      ? new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime() 
      : new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
  });

  // Filter orders by status
  const filteredOrders = filterStatus 
    ? sortedOrders.filter(order => order.status === filterStatus)
    : sortedOrders;

  // Handle view order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Copy order ID to clipboard
  const copyOrderId = (event: React.MouseEvent, orderId: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderId).then(() => {
      setCopying(orderId);
      setTimeout(() => setCopying(null), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-purple-600" />
            Recent Orders
          </h2>
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 flex items-center hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </button>
              {/* Filter dropdown would go here */}
            </div>
            <select 
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white"
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={() => setPage(1)}
          >
            Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort('id')}
                    >
                      Order ID
                      {sortBy === 'id' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left">Creator</th>
                  <th className="px-5 py-3 text-left">Package</th>
                  <th className="px-5 py-3 text-left">
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left">
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      {sortBy === 'amount' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  // Format dates
                  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
                  const formattedDate = orderDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  
                  return (
                    <tr key={order._id || order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span title={order._id || order.id} className="cursor-help">
                            #{typeof order._id === 'string' ? order._id.substring(0, 8) : 
                              typeof order.id === 'string' ? (order.id.length > 8 ? order.id.substring(0, 8) : order.id) : 
                              'N/A'}
                          </span>
                          <button 
                            onClick={(e) => copyOrderId(e, order._id || order.id)}
                            className="ml-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Copy full order ID"
                          >
                            {copying === (order._id || order.id) ? 
                              <Check className="w-3.5 h-3.5 text-green-600" /> : 
                              <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.creatorName || order.creatorId}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                        {order.packageType} Package
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <button 
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-purple-600 hover:text-purple-800 flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 text-sm ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'}`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button 
              onClick={() => setPage(prev => prev + 1)}
              disabled={filteredOrders.length < 10}
              className={`px-3 py-1 text-sm ${filteredOrders.length < 10 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
} 