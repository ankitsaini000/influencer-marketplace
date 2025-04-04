'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

export const CreatorPricing = () => {
  const router = useRouter();
  
  const [packages, setPackages] = useState({
    basic: {
      name: 'Basic',
      price: 50,
      description: 'Entry-level service that covers the basics of what you need.',
      deliveryTime: 3,
      revisions: 1,
      features: ['Basic service', 'Limited revisions', 'Standard delivery']
    },
    standard: {
      name: 'Standard',
      price: 100,
      description: 'Comprehensive service with faster delivery and more features.',
      deliveryTime: 2,
      revisions: 2,
      features: ['Everything in Basic', 'Additional revisions', 'Faster delivery', 'Premium support']
    },
    premium: {
      name: 'Premium',
      price: 200,
      description: 'Complete premium package with all features and fastest delivery.',
      deliveryTime: 1,
      revisions: 3,
      features: ['Everything in Standard', 'Priority service', 'Express delivery', 'Unlimited revisions', 'VIP support']
    }
  });
  
  const [customOffers, setCustomOffers] = useState(true);
  const [newFeature, setNewFeature] = useState('');
  const [activePackage, setActivePackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load existing data from local storage if available
    const savedData = localStorage.getItem('creatorPricing');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPackages(parsedData.packages || packages);
        setCustomOffers(parsedData.customOffers !== undefined ? parsedData.customOffers : true);
      } catch (e) {
        console.error('Error parsing saved pricing data', e);
      }
    }
  }, []);

  const updatePackage = (pkg: 'basic' | 'standard' | 'premium', field: string, value: any) => {
    setPackages({
      ...packages,
      [pkg]: {
        ...packages[pkg],
        [field]: value
      }
    });
  };
  
  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    const updatedPackages = { ...packages };
    updatedPackages[activePackage].features.push(newFeature.trim());
    
    setPackages(updatedPackages);
    setNewFeature('');
  };
  
  const removeFeature = (pkg: 'basic' | 'standard' | 'premium', index: number) => {
    const updatedPackages = { ...packages };
    updatedPackages[pkg].features.splice(index, 1);
    
    setPackages(updatedPackages);
  };
  
  const validatePricing = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check for required fields
    ['basic', 'standard', 'premium'].forEach((pkg) => {
      const pkgData = packages[pkg as keyof typeof packages];
      
      if (!pkgData.name.trim()) {
        newErrors[`${pkg}.name`] = 'Package name is required';
      }
      
      if (!pkgData.price || pkgData.price <= 0) {
        newErrors[`${pkg}.price`] = 'Valid price is required';
      }
      
      if (!pkgData.description.trim()) {
        newErrors[`${pkg}.description`] = 'Description is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validatePricing()) {
      setIsSubmitting(true);
      
      // Save to local storage
      localStorage.setItem('creatorPricing', JSON.stringify({ packages }));
      
      // Navigate to the next step
      router.push('/creator-setup/gallery-portfolio');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={5} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Set Your Pricing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Define your service packages and pricing to attract the right clients.
          </p>
                  </div>
      
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Package Tabs */}
          <div className="flex mb-6 border-b">
            {['basic', 'standard', 'premium'].map((pkg) => (
              <button
                key={pkg}
                className={`px-6 py-3 font-medium capitalize ${
                  activePackage === pkg
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActivePackage(pkg as 'basic' | 'standard' | 'premium')}
              >
                {pkg}
              </button>
            ))}
      </div>

          {/* Active Package Editor */}
            <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input
                    type="text"
                  value={packages[activePackage].name}
                  onChange={(e) => updatePackage(activePackage, 'name', e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${activePackage}.name`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Basic Package"
                />
                {errors[`${activePackage}.name`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.name`]}</p>
                )}
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={packages[activePackage].price}
                  onChange={(e) => updatePackage(activePackage, 'price', parseInt(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${activePackage}.price`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  step="1"
                />
                {errors[`${activePackage}.price`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.price`]}</p>
                )}
                  </div>
                </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={packages[activePackage].description}
                onChange={(e) => updatePackage(activePackage, 'description', e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[`${activePackage}.description`] ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Describe what's included in this package"
              ></textarea>
              {errors[`${activePackage}.description`] && (
                <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.description`]}</p>
              )}
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                      <input
                        type="number"
                  value={packages[activePackage].deliveryTime}
                  onChange={(e) => updatePackage(activePackage, 'deliveryTime', parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="30"
                      />
                    </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revisions</label>
                      <input
                        type="number"
                  value={packages[activePackage].revisions}
                  onChange={(e) => updatePackage(activePackage, 'revisions', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="20"
                />
                </div>
              </div>

                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="mb-4">
                <ul className="space-y-2">
                  {packages[activePackage].features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(activePackage, index)}
                        className="ml-auto text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </li>
                  ))}
                    </ul>
          </div>

              <div className="flex">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  disabled={!newFeature.trim()}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="customOffers"
                checked={customOffers}
                onChange={(e) => setCustomOffers(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="customOffers" className="ml-2 text-sm text-gray-700">
                Allow custom offers (clients can request services outside of these packages)
              </label>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/creator-setup/description-faq')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
