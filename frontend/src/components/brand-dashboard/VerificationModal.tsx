"use client";

import { useState, FormEvent } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface VerificationModalProps {
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  selectedVerification: string | null;
  handleVerificationSubmit: (e: FormEvent) => void;
}

export default function VerificationModal({ 
  showVerificationModal, 
  setShowVerificationModal, 
  selectedVerification,
  handleVerificationSubmit
}: VerificationModalProps) {
  const [verificationStep, setVerificationStep] = useState<"input" | "verify" | "success">("input");
  const [verificationCode, setVerificationCode] = useState("");

  if (!showVerificationModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedVerification === 'email' && 'Email Verification'}
              {selectedVerification === 'phone' && 'Phone Verification'}
              {selectedVerification === 'payment' && 'Payment Method'}
              {selectedVerification === 'identity' && 'Identity Verification'}
              {selectedVerification === 'location' && 'Location Verification'}
            </h3>
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleVerificationSubmit}>
            {selectedVerification === 'email' && (
              <div className="space-y-4">
                {verificationStep === "input" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        placeholder="your@email.com" 
                      />
                    </div>
                    <p className="text-sm text-gray-500">We'll send a verification code to this email address.</p>
                    <button
                      type="button"
                      onClick={() => setVerificationStep("verify")}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Send Verification Code
                    </button>
                  </>
                )}
                
                {verificationStep === "verify" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <div className="flex space-x-2">
                        {[...Array(6)].map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                            value={verificationCode[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                const newCode = verificationCode.split('');
                                newCode[index] = value;
                                setVerificationCode(newCode.join(''));
                                
                                // Auto-focus next input
                                if (value && index < 5) {
                                  const inputs = document.querySelectorAll('input[maxLength="1"]');
                                  const nextInput = inputs[index + 1] as HTMLInputElement;
                                  if (nextInput) nextInput.focus();
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your email.</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (verificationCode.length === 6) {
                            setVerificationStep("success");
                          }
                        }}
                        disabled={verificationCode.length !== 6}
                        className={`px-4 py-2 rounded-lg text-white ${
                          verificationCode.length === 6 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "bg-purple-400 cursor-not-allowed"
                        }`}
                      >
                        Verify Code
                      </button>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                      <button
                        type="button"
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Resend Code
                      </button>
                    </div>
                  </>
                )}
                
                {verificationStep === "success" && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified Successfully!</h3>
                      <p className="text-sm text-gray-600 mb-4">Your email has been verified and your account is now more secure.</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleVerificationSubmit(new Event('submit') as any);
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {selectedVerification === 'phone' && (
              <div className="space-y-4">
                {verificationStep === "input" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        placeholder="+1 (555) 123-4567" 
                      />
                    </div>
                    <p className="text-sm text-gray-500">We'll send a verification code via SMS to this number.</p>
                    <button
                      type="button"
                      onClick={() => setVerificationStep("verify")}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Send Verification Code
                    </button>
                  </>
                )}
                
                {verificationStep === "verify" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <div className="flex space-x-2">
                        {[...Array(6)].map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                            value={verificationCode[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                const newCode = verificationCode.split('');
                                newCode[index] = value;
                                setVerificationCode(newCode.join(''));
                                
                                // Auto-focus next input
                                if (value && index < 5) {
                                  const inputs = document.querySelectorAll('input[maxLength="1"]');
                                  const nextInput = inputs[index + 1] as HTMLInputElement;
                                  if (nextInput) nextInput.focus();
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your phone.</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (verificationCode.length === 6) {
                            setVerificationStep("success");
                          }
                        }}
                        disabled={verificationCode.length !== 6}
                        className={`px-4 py-2 rounded-lg text-white ${
                          verificationCode.length === 6 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "bg-purple-400 cursor-not-allowed"
                        }`}
                      >
                        Verify Code
                      </button>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                      <button
                        type="button"
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Resend Code
                      </button>
                    </div>
                  </>
                )}
                
                {verificationStep === "success" && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verified Successfully!</h3>
                      <p className="text-sm text-gray-600 mb-4">Your phone number has been verified and your account is now more secure.</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleVerificationSubmit(new Event('submit') as any);
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedVerification === 'payment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="1234 5678 9012 3456" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="MM/YY" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="123" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="John Doe" 
                  />
                </div>
                <p className="text-sm text-gray-500">Your payment information is securely stored.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Payment Method
                </button>
              </div>
            )}

            {selectedVerification === 'identity' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg">
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Front)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Back)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">We'll review your documents and update your verification status within 24-48 hours.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit for Verification
                </button>
              </div>
            )}

            {selectedVerification === 'location' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="123 Main St" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="Apt 4B" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="New York" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="NY" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="10001" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg">
                      <option value="">Select Country</option>
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Address</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Please upload a utility bill, bank statement, or other official document showing your address.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Verify Address
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 