"use client";

import { FileText, Star, X, MessageSquare, ImageIcon, Download, ChevronLeft, CheckCheck, Clock, CalendarIcon, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface OrderDetailModalProps {
  showOrderDetail: boolean;
  setShowOrderDetail: (show: boolean) => void;
  selectedOrder: any;
}

export default function OrderDetailModal({
  showOrderDetail,
  setShowOrderDetail,
  selectedOrder
}: OrderDetailModalProps) {
  if (!showOrderDetail || !selectedOrder) return null;

  // State for copy button
  const [copied, setCopied] = useState(false);

  // Copy order ID to clipboard
  const copyOrderId = () => {
    const orderId = selectedOrder._id || selectedOrder.id;
    if (orderId) {
      navigator.clipboard.writeText(orderId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Format dates
  const orderDate = selectedOrder.createdAt ? new Date(selectedOrder.createdAt) : new Date();
  const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => setShowOrderDetail(false)}
                className="mr-3 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details
              </h3>
            </div>
            <button 
              onClick={() => setShowOrderDetail(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Order ID Section */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <div className="flex items-center">
              <p className="font-mono text-gray-900 mr-2">
                {typeof selectedOrder._id === 'string' ? selectedOrder._id : 
                 typeof selectedOrder.id === 'string' ? selectedOrder.id : 'N/A'}
              </p>
              <button 
                onClick={copyOrderId}
                className="text-gray-500 hover:text-purple-600 transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex justify-between items-center">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {formatStatus(selectedOrder.status)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4 inline-block mr-1" />
                {formattedOrderDate}
              </div>
            </div>
            
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-gray-700">Order Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Creator</p>
                  <p className="font-medium">{selectedOrder.creatorName || selectedOrder.creatorId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="font-medium capitalize">{selectedOrder.packageType} Package</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package Price</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.packagePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Platform Fee</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.platformFee)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>
            </div>
            
            {/* Special Instructions */}
            {selectedOrder.specialInstructions && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-gray-700">Special Instructions</h4>
                <p className="text-gray-600">{selectedOrder.specialInstructions}</p>
              </div>
            )}
            
            {/* Message */}
            {selectedOrder.message && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-gray-700">Message to Creator</h4>
                <p className="text-gray-600">{selectedOrder.message}</p>
              </div>
            )}
            
            {/* Files */}
            {selectedOrder.files && selectedOrder.files.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-700">Attached Files</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedOrder.files.map((file: string, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate">{file.split('/').pop()}</p>
                      </div>
                      <button className="text-purple-600 hover:text-purple-800 ml-2">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Delivery Timeline */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-gray-700">Delivery Timeline</h4>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm">
                    <span className="font-medium">{selectedOrder.packageDeliveryDays}</span> days delivery
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCheck className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm">
                    <span className="font-medium">{selectedOrder.packageRevisions || 1}</span> revision{selectedOrder.packageRevisions > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowOrderDetail(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Creator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 