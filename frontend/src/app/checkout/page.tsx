'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  Upload, 
  MessageSquare,
  Info,
  Calendar,
  DollarSign,
  ArrowRight,
  Trash2,
  AlertCircle,
//   LucidePaypal,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createOrder, getCreatorDetailsForCheckout, updateApplicationStatus, getApplicationById } from '@/services/api';

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageType = searchParams?.get('packageType') || 'basic';
  const creatorId = searchParams?.get('creatorId') || '';
  // Get promotion details from URL parameters
  const promotionTitle = searchParams?.get('promotionTitle') || '';
  const promotionId = searchParams?.get('promotionId') || '';
  // Get application ID if it's a pending accept
  const applicationId = searchParams?.get('applicationId') || '';
  const pendingAccept = searchParams?.get('pendingAccept') === 'true';

  // State management
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [message, setMessage] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    country: 'United States',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  
  // Creator state with loading indicator
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [creatorData, setCreatorData] = useState({
    id: creatorId,
    name: '',
    firstName: '',
    lastName: '',
    username: '',
    profileImage: '',
    category: '',
    followers: '',
    rating: 0,
    reviews: [] as Array<{id: string, rating: number, comment: string, user: string, date: string}>,
    reviewCount: 0,
    packages: {} as any
  });

  // Add application state
  const [applicationData, setApplicationData] = useState<any>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Default package data (fallback if API doesn't return package data)
  const defaultPackages = {
    basic: {
      name: 'BASIC PROMO',
      price: 868,
      currency: '₹',
      deliveryDays: 14,
      revisions: 1,
      description: 'Basic Package Only Laptop-scenes includes Background Music, Logo, and 720HD Video',
      deliverables: [
        "Sponsored Content",
        "Targeted Reach",
        "Dynamic transitions",
        "Background Music",
        "720HD Video",
        "Logo Integration"
      ]
    },
    standard: {
      name: 'STANDARD PROMO',
      price: 1599,
      currency: '₹',
      deliveryDays: 10,
      revisions: 2,
      description: 'Standard Package Laptop and Mobile-scenes includes Background Music, Logo, Basic effects, and 1080 FULL HD',
      deliverables: [
        "Everything in Basic",
        "Laptop & Mobile Scenes",
        "1080 FULL HD Video",
        "Basic Effects",
        "Priority Support",
        "Enhanced Marketing"
      ]
    },
    premium: {
      name: 'PREMIUM PROMO',
      price: 2999,
      currency: '₹',
      deliveryDays: 7,
      revisions: 3,
      description: 'Premium Package Laptop and Mobile-scenes includes Background Music, Logo, Advanced effects, and 4K ULTRA HD',
      deliverables: [
        "Everything in Standard",
        "4K ULTRA HD Video",
        "Advanced Effects",
        "Dedicated Support",
        "Source Files Included",
        "Premium Marketing Strategy"
      ]
    }
  };

  // Fetch creator data and application data on page load
  useEffect(() => {
    const fetchData = async () => {
      if (creatorId) {
        console.log('Fetching creator details for ID (username):', creatorId);
        setCreatorLoading(true);
        try {
          const response = await getCreatorDetailsForCheckout(creatorId);
          console.log('Creator details response:', response);
          if (response.success && response.data) {
            console.log('Setting creator data:', response.data);
            setCreatorData(response.data);
          } else {
            toast.error('Failed to load creator details');
            console.error('Error loading creator details:', response.error);
          }
        } catch (error) {
          console.error('Error in fetchCreatorDetails:', error);
          toast.error('An unexpected error occurred');
        } finally {
          setCreatorLoading(false);
        }
      }
      
      // Fetch application data if applicationId is provided
      if (applicationId) {
        setApplicationLoading(true);
        try {
          console.log('Fetching application details for ID:', applicationId);
          const response = await getApplicationById(applicationId);
          if (response.success && response.data) {
            console.log('Application data received:', response.data);
            setApplicationData(response.data);
          } else {
            console.error('Failed to fetch application data:', response.error);
          }
        } catch (error) {
          console.error('Error fetching application data:', error);
        } finally {
          setApplicationLoading(false);
        }
      }
    };
    
    fetchData();
  }, [creatorId, applicationId]);
  
  // Get the selected package data, with fallback to default package if needed
  const getSelectedPackage = () => {
    // First check if we have application data with proposedRate
    if (applicationData && applicationData.proposedRate) {
      // Use the proposedRate from the application as the price
      const proposedRatePrice = parseFloat(applicationData.proposedRate.replace(/[^0-9.]/g, '')) || 0;
      
      // Clone the package data but override the price with proposedRate
      const packageData = creatorData.packages && creatorData.packages[packageType as keyof typeof creatorData.packages]
        ? { ...creatorData.packages[packageType as keyof typeof creatorData.packages] }
        : { ...defaultPackages[packageType as keyof typeof defaultPackages] };
      
      // Override the price with the proposedRate
      packageData.price = proposedRatePrice;
      packageData.originalPrice = packageData.price; // Store original price
      packageData.useProposedRate = true; // Flag to indicate we're using proposedRate
      return packageData;
    }
    
    // Fallback to regular package pricing
    // First try to get package from creator data
    if (creatorData.packages && creatorData.packages[packageType as keyof typeof creatorData.packages]) {
      return creatorData.packages[packageType as keyof typeof creatorData.packages];
    }
    
    // Fallback to default package
    return defaultPackages[packageType as keyof typeof defaultPackages] || defaultPackages.basic;
  };

  const selectedPackage = getSelectedPackage();
  
  // Calculate fees and total
  const platformFee = Math.round(selectedPackage.price * 0.05);
  const totalAmount = selectedPackage.price + platformFee;

  // Handle file upload for requirements
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDocFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Remove an uploaded file
  const removeFile = (index: number) => {
    setDocFiles(prev => prev.filter((_: File, i: number) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!agreement) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    
    // Validate card details if card payment method is selected
    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
        toast.error('Please fill in all card details');
        return;
      }
      
      // Simple validation for card number (16 digits)
      if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      
      // Simple validation for expiry format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        toast.error('Please enter the expiry date in MM/YY format');
        return;
      }
      
      // Simple validation for CVC (3-4 digits)
      if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
        toast.error('Please enter a valid CVC code (3-4 digits)');
        return;
      }
    }
    
    // UPI validation
    if (selectedPaymentMethod === 'upi') {
      const upiId = document.getElementById('upiId') as HTMLInputElement;
      if (!upiId.value) {
        toast.error('Please enter your UPI ID');
        return;
      }
      
      // Simple UPI ID validation (contains @)
      if (!upiId.value.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return;
      }
    }
    
    // Show loading state
    setLoading(true);
    
    // Show payment status modal for development only
    setShowPaymentModal(true);
    setLoading(false);
  };

  // Handle successful payment
  const handleSuccessPayment = async () => {
    setShowPaymentModal(false);
    setLoading(true);
    toast.success('Processing your payment...', { duration: 2000 });
    
    // Create payment details based on payment method
    let paymentDetails = {};
    if (selectedPaymentMethod === 'card') {
      paymentDetails = {
        cardLast4: cardDetails.number.slice(-4),
        cardBrand: 'Visa', // Mock data
      };
    } else if (selectedPaymentMethod === 'upi') {
      const upiId = (document.getElementById('upiId') as HTMLInputElement)?.value;
      paymentDetails = {
        upiId: upiId || 'user@bank',
      };
    } else if (selectedPaymentMethod === 'paypal') {
      paymentDetails = {
        paypalEmail: 'user@example.com', // Mock data
      };
    }
    
    try {
      // Call the API to create the order
      const result = await createOrder({
        creatorId: creatorId,
        packageType: packageType,
        packagePrice: selectedPackage.price,
        platformFee,
        totalAmount,
        paymentMethod: selectedPaymentMethod,
        specialInstructions,
        message,
        files: docFiles,
        paymentStatus: 'completed',
        ...paymentDetails, // Include payment details
        promotionId, // Add the promotion ID if it exists
        promotionTitle, // Add the promotion title if it exists
        creatorDetails: {
          name: creatorData.name,
          firstName: creatorData.firstName,
          lastName: creatorData.lastName,
          username: creatorData.username,
          profileImage: creatorData.profileImage,
          category: creatorData.category,
          rating: creatorData.rating,
          reviewCount: creatorData.reviewCount,
          packageInfo: selectedPackage
        }
      });
      
      // If payment successful and there's a pending application acceptance
      if (result.success && pendingAccept && applicationId) {
        try {
          // Now accept the application since payment is completed
          const updateResponse = await updateApplicationStatus(applicationId, 'accepted');
          if (updateResponse.success) {
            toast.success('Application has been accepted!');
          } else {
            console.error('Failed to accept application after payment:', updateResponse.message);
            toast.error('Payment successful, but failed to accept the application.');
          }
        } catch (updateError) {
          console.error('Error accepting application after payment:', updateError);
          toast.error('Payment successful, but there was an error accepting the application.');
        }
      }
      
      setLoading(false);
      
      if (result.success) {
        toast.success('Payment successful! Redirecting to order confirmation...', { duration: 3000 });
        
        // Redirect to confirmation page after a short delay to allow toast to be read
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${result.data?.orderId || 'unknown'}&packageType=${packageType}`);
        }, 1500);
      } else {
        toast.error(result.error || 'An error occurred during payment. Please try again.');
      }
    } catch (error) {
      console.error('Error in checkout process:', error);
      setLoading(false);
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  // Handle failed payment
  const handleFailedPayment = () => {
    setShowPaymentModal(false);
    toast.error('Payment failed. Redirecting to failed payment page...');
    
    // Create payment details based on payment method
    let paymentDetails = {};
    if (selectedPaymentMethod === 'card') {
      paymentDetails = {
        cardLast4: cardDetails.number.slice(-4),
        cardBrand: 'Visa', // Mock data
      };
    } else if (selectedPaymentMethod === 'upi') {
      const upiId = (document.getElementById('upiId') as HTMLInputElement)?.value;
      paymentDetails = {
        upiId: upiId || 'user@bank',
      };
    }
    
    // Create order with failed status
    createOrder({
      creatorId: creatorId,
      packageType: packageType,
      packagePrice: selectedPackage.price,
      platformFee,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
      specialInstructions,
      message,
      files: docFiles,
      paymentStatus: 'failed',
      ...paymentDetails, // Include payment details
      promotionId, // Add the promotion ID if it exists
      promotionTitle, // Add the promotion title if it exists
      creatorDetails: {
        name: creatorData.name,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        username: creatorData.username,
        profileImage: creatorData.profileImage,
        category: creatorData.category,
        rating: creatorData.rating,
        reviewCount: creatorData.reviewCount,
        packageInfo: selectedPackage
      }
    });
    
    // Redirect to order confirmation with failed status
    setTimeout(() => {
      router.push(`/order-confirmation?orderId=unknown&packageType=${packageType}&status=failed`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Status Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status (Development Mode)</h2>
            <p className="text-gray-600 mb-6">
              Choose an option to simulate the payment result:
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSuccessPayment}
                className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Successful Payment
              </button>
              <button
                onClick={handleFailedPayment}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center"
              >
                <AlertCircle className="h-5 w-5 mr-2" />
                Failed Payment
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm">Back to Creator Profile</span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            Complete your booking with {creatorData.name || 'Creator'}
            {promotionTitle && (
              <span> for <span className="font-medium text-purple-600">{promotionTitle}</span></span>
            )}
          </p>
          
          {pendingAccept && applicationId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Payment Required to Accept Application</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You must complete payment to accept this creator's application. Once payment is successful, 
                    the application will automatically be marked as accepted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Form Fields */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Creator Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {creatorLoading ? (
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="h-14 w-14 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src={creatorData.profileImage} 
                        alt={creatorData.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {creatorData.firstName && creatorData.lastName 
                          ? `${creatorData.firstName} ${creatorData.lastName}`
                          : creatorData.name || creatorData.username || 'Creator'}
                      </h2>
                      <p className="text-sm text-gray-500">@{creatorData.username}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {creatorData.category}
                      </span>
                      <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                        {creatorData.followers}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md mr-2">
                        <span className="text-yellow-500 font-bold mr-1">★ {creatorData.rating}</span>
                        <span className="text-gray-600 text-sm">Rating</span>
                      </div>
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                        <span className="text-gray-700 font-medium mr-1">{creatorData.reviewCount}</span>
                        <span className="text-gray-600 text-sm">Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Project Requirements */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Requirements</h2>
              
              {/* Document Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Requirements Documentation
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </span>
                  </label>
                </div>
                
                {/* File List */}
                {docFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files ({docFiles.length})
                    </p>
                    <ul className="space-y-2">
                      {docFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Special Instructions */}
              <div className="mb-6">
                <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  id="special-instructions"
                  rows={4}
                  placeholder="Share any specific requirements or instructions..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                ></textarea>
              </div>
              
              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Creator (Optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Say hello and introduce your brand..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              {/* Card (Default) */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <input
                    id="card-payment"
                    name="payment-method"
                    type="radio"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={() => setSelectedPaymentMethod('card')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="card-payment" className="ml-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Credit / Debit Card</span>
                  </label>
                </div>
                
                {selectedPaymentMethod === 'card' && (
                  <div className="pl-7 space-y-4">
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="card-holder" className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="card-holder"
                        placeholder="John Smith"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          placeholder="MM/YY"
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          id="cvc"
                          placeholder="123"
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* UPI */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <input
                    id="upi-payment"
                    name="payment-method"
                    type="radio"
                    checked={selectedPaymentMethod === 'upi'}
                    onChange={() => setSelectedPaymentMethod('upi')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="upi-payment" className="ml-3 flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">UPI</span>
                  </label>
                </div>
                
                {selectedPaymentMethod === 'upi' && (
                  <div className="pl-7">
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      placeholder="name@ybl"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              {/* Bank Transfer */}
              <div>
                <div className="flex items-center">
                  <input
                    id="bank-payment"
                    name="payment-method"
                    type="radio"
                    checked={selectedPaymentMethod === 'bankTransfer'}
                    onChange={() => setSelectedPaymentMethod('bankTransfer')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="bank-payment" className="ml-3 flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                  </label>
                </div>
                
                {selectedPaymentMethod === 'bankTransfer' && (
                  <div className="pl-7 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You will receive bank details after placing your order. Please complete the transfer within 24 hours.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms and Conditions */}
              <div className="mt-8">
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreement}
                    onChange={() => setAgreement(!agreement)}
                    className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="ml-3">
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-800">
                        Terms and Conditions
                      </a>
                      {' '}and{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-800">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Selected Package */}
                <div className="mb-6">
                  {creatorLoading || applicationLoading ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-800">{selectedPackage.name}</h3>
                        <span className="font-medium text-gray-800">
                          {applicationData && applicationData.proposedRate ? (
                            <span className="flex flex-col items-end">
                              <span>{applicationData.proposedRate}</span>
                              <span className="text-xs text-gray-500">(Proposed Rate)</span>
                            </span>
                          ) : (
                            `${selectedPackage.currency}${selectedPackage.price}`
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                    </>
                  )}
                </div>
                
                {/* Platform Fee */}
                <div className="flex justify-between py-3 border-t border-gray-100">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-800">{selectedPackage.currency}{platformFee}</span>
                </div>
                
                {/* Total Amount */}
                <div className="flex justify-between py-3 border-t border-gray-100">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">{selectedPackage.currency}{totalAmount}</span>
                </div>
              </div>
              
              {/* Details and CTA */}
              <div className="p-6">
                {/* Delivery */}
                <div className="flex items-start mb-4">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                    {creatorLoading ? (
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-sm text-gray-600">{selectedPackage.deliveryDays} days</p>
                    )}
                  </div>
                </div>
                
                {/* Revisions */}
                <div className="flex items-start mb-4">
                  <ArrowRight className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Revisions</p>
                    {creatorLoading ? (
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-sm text-gray-600">{selectedPackage.revisions} revision{selectedPackage.revisions > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
                
                {/* Deliverables */}
                {!creatorLoading && selectedPackage.deliverables && selectedPackage.deliverables.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">What's Included:</h3>
                    <ul className="space-y-2">
                      {selectedPackage.deliverables.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Loading state for deliverables */}
                {creatorLoading && (
                  <div className="border-t border-gray-100 pt-4 mb-5">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 mr-2"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-start">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 mr-2"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-start">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 mr-2"></div>
                        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Security */}
                <div className="flex items-start mb-6">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Secure Payment</p>
                    <p className="text-sm text-gray-600">Money-back guarantee for undelivered services</p>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className={pendingAccept ? "space-y-3" : ""}>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-3 px-4 flex justify-center items-center rounded-lg font-medium ${
                      loading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                    } text-white transition-colors`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      pendingAccept ? 'Pay & Accept Application' : 'Complete Order'
                    )}
                  </button>
                  
                  {pendingAccept && (
                    <button
                      onClick={() => router.push('/brand-dashboard')}
                      className="w-full py-3 px-4 flex justify-center items-center rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      Cancel and Return to Dashboard
                    </button>
                  )}
                </div>
                
                {/* Trust Message */}
                <p className="flex items-center justify-center text-xs text-gray-500 mt-4">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 