import { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useRouter } from "next/navigation";
import { Mail, Phone, X, Check } from "lucide-react";

const KickstartModal = ({
  onClose,
  navigate,
}: {
  onClose: () => void;
  navigate: (path: string) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">
              You're ready to start your creator journey
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Join our Creator Pro program designed for content creators who want
            to grow their audience and monetize their influence. Get exclusive
            tools and resources to succeed.
          </p>

          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Creator Pro Package</h3>
              <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-xs font-medium">
                Premium
              </span>
            </div>

            <div className="mb-3">
              <div className="text-lg font-bold">$29</div>
              <div className="text-sm text-gray-600">
                monthly subscription with premium features
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Accelerate your growth with our premium creator tools and
              features.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Advanced Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Priority Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Collaboration Tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Exclusive Masterclasses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Brand Partnership Opportunities</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#1dbf73]" />
                <span>Monetization Features</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                navigate("/create-profile");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Create Creator Account
            </button>
            <button
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 text-sm"
            >
              Go Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreatorAccountSecurity = () => {
  const router = useRouter();
  const [email] = useState("user@example.com");
  const [phone, setPhone] = useState("");
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showVerifyPhone, setShowVerifyPhone] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [showKickstartModal, setShowKickstartModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSendEmailCode = () => {
    // In real app, make API call to send verification code
    setShowVerifyEmail(true);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, verify code with API
    if (verificationCode === "123456") {
      setShowVerifyEmail(false);
    }
  };

  const handleSendPhoneCode = () => {
    // In real app, make API call to send SMS code
    setShowVerifyPhone(true);
  };

  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, verify code with API
    if (phoneVerificationCode === "123456") {
      setShowVerifyPhone(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowKickstartModal(true);
  };

  const handleCloseModal = () => {
    setShowKickstartModal(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                ✓
              </span>
              <span className="text-gray-600">Personal Info</span>
            </span>
            <span className="flex-1 h-[2px] bg-gray-300"></span>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                ✓
              </span>
              <span className="text-gray-600">Professional Info</span>
            </span>
            <span className="flex-1 h-[2px] bg-gray-300"></span>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1dbf73] text-white flex items-center justify-center">
                3
              </span>
              <span className="font-medium">Account Security</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Account Security</h1>
          <p className="text-gray-600">
            Trust and safety is a big deal in our community. Please verify your
            email and phone number so that we can keep your account secured.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>Email</span>
                <span className="text-gray-400">(Private)</span>
              </div>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="email"
                value={email}
                disabled
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                type="button"
                onClick={handleSendEmailCode}
                className="px-4 py-2 border border-[#1dbf73] text-[#1dbf73] rounded-lg font-medium hover:bg-[#1dbf73] hover:text-white transition-colors"
              >
                Verify Email
              </button>
            </div>

            {/* Email Verification Modal */}
            {showVerifyEmail && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Verify Email</h3>
                  <button
                    type="button"
                    onClick={() => setShowVerifyEmail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a verification code to your email. Please enter it
                  below.
                </p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    className="px-4 py-2 bg-[#1dbf73] text-white rounded-lg font-medium hover:bg-[#19a463]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>Phone Number</span>
                <span className="text-gray-400">(Private)</span>
              </div>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              We'll never share your phone number.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add Phone Number"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleSendPhoneCode}
                className="px-4 py-2 border border-[#1dbf73] text-[#1dbf73] rounded-lg font-medium hover:bg-[#1dbf73] hover:text-white transition-colors"
              >
                Verify Phone
              </button>
            </div>

            {/* Phone Verification Modal */}
            {showVerifyPhone && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Verify Phone Number</h3>
                  <button
                    type="button"
                    onClick={() => setShowVerifyPhone(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a verification code to your phone. Please enter it
                  below.
                </p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={phoneVerificationCode}
                    onChange={(e) => setPhoneVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    className="px-4 py-2 bg-[#1dbf73] text-white rounded-lg font-medium hover:bg-[#19a463]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>

      <Footer />

      {showKickstartModal && (
        <KickstartModal onClose={handleCloseModal} navigate={router.push} />
      )}
    </div>
  );
};
