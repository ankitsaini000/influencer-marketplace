"use client";

import {
  Shield,
  Mail,
  Phone,
  CreditCard,
  UserCheck,
  MapPin,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react";

interface VerificationProps {
  accountStatus: {
    email: boolean;
    phone: boolean;
    payment: boolean;
    identity: boolean;
    location: boolean;
  };
  setSelectedVerification: (type: string | null) => void;
  setShowVerificationModal: (show: boolean) => void;
}

export default function BrandVerification({
  accountStatus,
  setSelectedVerification,
  setShowVerificationModal
}: VerificationProps) {
  const renderVerificationItem = (title: string, description: string, isVerified: boolean, icon: React.ReactNode, type: string) => (
    <div className="flex items-start p-4 bg-white rounded-xl border border-gray-100">
      <div className={`p-2 rounded-lg ${isVerified ? 'bg-green-100' : 'bg-orange-100'} mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {isVerified ? (
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> Pending
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-2 flex space-x-3">
          {!isVerified && (
            <button 
              onClick={() => {
                setSelectedVerification(type);
                setShowVerificationModal(true);
              }}
              className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center"
            >
              Complete Verification <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
          <button 
            onClick={() => {
              setSelectedVerification(type);
              setShowVerificationModal(true);
            }}
            className="text-sm text-gray-500 font-medium hover:text-gray-700 flex items-center"
          >
            {isVerified ? 'Edit' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-purple-600" />
          Account Verification
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderVerificationItem(
            "Email Verification", 
            "Verify your email to secure your account and receive important updates", 
            accountStatus.email,
            <Mail className="w-5 h-5 text-purple-600" />,
            "email"
          )}
          
          {renderVerificationItem(
            "Phone Verification", 
            "Add and verify your phone number for additional security and communication", 
            accountStatus.phone,
            <Phone className="w-5 h-5 text-orange-600" />,
            "phone"
          )}
          
          {renderVerificationItem(
            "Payment Method", 
            "Add a payment method to easily pay for creator collaborations", 
            accountStatus.payment,
            <CreditCard className="w-5 h-5 text-green-600" />,
            "payment"
          )}
          
          {renderVerificationItem(
            "Identity Verification", 
            "Verify your identity to build trust with creators and unlock more features", 
            accountStatus.identity,
            <UserCheck className="w-5 h-5 text-blue-600" />,
            "identity"
          )}
          
          {renderVerificationItem(
            "Location Verification", 
            "Confirm your business address for local collaborations and events", 
            accountStatus.location,
            <MapPin className="w-5 h-5 text-pink-600" />,
            "location"
          )}
        </div>
      </div>
    </div>
  );
} 