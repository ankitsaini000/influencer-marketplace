import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Clock, PlusCircle, Loader2, DollarSign, X, MoreHorizontal } from 'lucide-react';

interface Order {
  id: string;
  clientName: string;
  date: string;
  service: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  amount: number;
  platform?: string;
  promotionType?: string;
  deliveryDate?: string;
  description?: string;
  clientFeedback?: string;
  deliverables?: string[];
  paymentStatus?: string;
  paymentDate?: string;
}

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === 'status') {
      const statusOrder: Record<string, number> = { 
        completed: 1, 
        delivered: 2, 
        in_progress: 3, 
        pending: 4, 
        cancelled: 5 
      };
      return sortOrder === 'asc' 
        ? (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
        : (statusOrder[b.status] || 99) - (statusOrder[a.status] || 99);
    }
    return 0;
  });

  // Filter orders by status
  const filteredOrders = filterStatus
    ? sortedOrders.filter(order => order.status === filterStatus)
    : sortedOrders;

  // Toggle sort order
  const toggleSort = (field: 'date' | 'amount' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center"><Check className="w-3 h-3 mr-1" />Completed</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center"><DollarSign className="w-3 h-3 mr-1" />Delivered</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" />In Progress</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center"><X className="w-3 h-3 mr-1" />Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          
          <div className="flex mt-4 md:mt-0 space-x-2">
            <div className="relative">
              <select 
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <Link 
              href="/creator-dashboard/orders/new" 
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Order
            </Link>
          </div>
        </div>
        
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => toggleSort('date')}
                    >
                      Date
                      {sortBy === 'date' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => toggleSort('status')}
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center justify-end w-full focus:outline-none"
                      onClick={() => toggleSort('amount')}
                    >
                      Amount
                      {sortBy === 'amount' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                      {order.platform && (
                        <div className="text-xs text-gray-500">{order.platform}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.service}</div>
                      {order.promotionType && (
                        <div className="text-xs text-gray-500">{order.promotionType}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="relative">
                        <button 
                          onClick={() => setShowDropdown(showDropdown === order.id ? null : order.id)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {showDropdown === order.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                              <Link 
                                href={`/creator-dashboard/orders/${order.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                role="menuitem"
                              >
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                              {order.status === 'pending' && (
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                  role="menuitem"
                                >
                                  <Loader2 className="w-4 h-4 mr-2" />
                                  Mark as In Progress
                                </button>
                              )}
                              {order.status === 'in_progress' && (
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                  role="menuitem"
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Mark as Delivered
                                </button>
                              )}
                              {(order.status === 'pending' || order.status === 'in_progress') && (
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 flex items-center"
                                  role="menuitem"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus 
                ? `You don't have any ${filterStatus.replace('_', ' ')} orders.` 
                : "You haven't created any orders yet."}
            </p>
            <Link 
              href="/creator-dashboard/orders/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Order
            </Link>
          </div>
        )}
        
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-center">
            <Link 
              href="/creator-dashboard/orders" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all orders
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList; 