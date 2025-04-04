"use client";

import { DashboardLayout } from "../layout/DashboardLayout";
import { Bell, Lock, Eye, Globe, CreditCard, HelpCircle } from "lucide-react";
import { useState } from "react";

interface NotificationSettings {
  emailNotifications: boolean;
  messageNotifications: boolean;
  profileViews: boolean;
  newFollowers: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showLocation: boolean;
}

interface LanguageSettings {
  language: string;
  timezone: string;
}

interface BillingInfo {
  plan: string;
  cardNumber: string;
  expiryDate: string;
}

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    messageNotifications: true,
    profileViews: false,
    newFollowers: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
  });

  const [language, setLanguage] = useState<LanguageSettings>({
    language: "English",
    timezone: "UTC+5:30",
  });

  const [billing, setBilling] = useState<BillingInfo>({
    plan: "Professional",
    cardNumber: "**** **** **** 4242",
    expiryDate: "12/24",
  });

  const tabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    { id: "privacy", label: "Privacy", icon: <Lock className="w-5 h-5" /> },
    {
      id: "visibility",
      label: "Visibility",
      icon: <Eye className="w-5 h-5" />,
    },
    { id: "language", label: "Language", icon: <Globe className="w-5 h-5" /> },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Notification Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your account activity
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailNotifications: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Message Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive messages
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.messageNotifications}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        messageNotifications: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Privacy Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Profile Visibility
                </h3>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) =>
                    setPrivacy((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value as "public" | "private",
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "visibility":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Visibility Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Profile Discovery
                </h3>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <option>Everyone</option>
                  <option>Only Followers</option>
                  <option>Nobody</option>
                </select>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Search Listing
                </h3>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <option>Listed</option>
                  <option>Unlisted</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Language & Region
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Language</h3>
                <select
                  value={language.language}
                  onChange={(e) =>
                    setLanguage((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Time Zone</h3>
                <select
                  value={language.timezone}
                  onChange={(e) =>
                    setLanguage((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option>UTC+5:30 (India)</option>
                  <option>UTC+0 (London)</option>
                  <option>UTC-5 (New York)</option>
                  <option>UTC-8 (Los Angeles)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Billing & Subscription
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Current Plan</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-purple-600">
                        {billing.plan}
                      </p>
                      <p className="text-sm text-gray-600">
                        $29/month, billed monthly
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Payment Method
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {billing.cardNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {billing.expiryDate}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateBilling()}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Billing History
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      date: "Mar 1, 2024",
                      amount: "$29.00",
                      status: "Paid",
                    },
                    {
                      date: "Feb 1, 2024",
                      amount: "$29.00",
                      status: "Paid",
                    },
                  ].map((invoice, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.date}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invoice.amount}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {invoice.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "help":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Help & Support
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {[
                    "How do I change my password?",
                    "How do I delete my account?",
                    "How do I contact support?",
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Contact Support
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Need help? Our support team is available 24/7.
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleUpdateBilling = () => {
    setBilling((prev) => ({
      ...prev,
      cardNumber: "**** **** **** 5555", // Example update
      expiryDate: "01/25",
    }));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
