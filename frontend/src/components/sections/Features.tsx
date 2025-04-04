"use client";

import {
  BarChart3,
  Rocket,
  Shield,
  Users,
  Zap,
  DollarSign,
  Award,
  Globe,
} from "lucide-react";
import { useState } from "react";

const influencerFeatures = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Maximize Earnings",
    description:
      "Connect with premium brands and earn competitive rates for your promotional content.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description:
      "Track your performance and growth with detailed analytics and insights.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Receive payments securely and on time, every time.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Build Your Reputation",
    description:
      "Showcase your work and build a stellar portfolio that attracts top brands.",
  },
];

const brandFeatures = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Find Perfect Matches",
    description:
      "Discover influencers that align perfectly with your brand values and target audience.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Campaign Management",
    description:
      "Easily manage multiple campaigns and track their performance in real-time.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Reach",
    description:
      "Connect with influencers worldwide to expand your brand's global presence.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "ROI Optimization",
    description:
      "Maximize your return on investment with data-driven influencer partnerships.",
  },
];

export const Features = () => {
  const [activeTab, setActiveTab] = useState<"influencer" | "brand">(
    "influencer"
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Tools for Everyone
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Specialized features designed for both influencers and brands to
            create successful partnerships
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-8 mb-12">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
              <button
                onClick={() => setActiveTab("influencer")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "influencer"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                For Influencers
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "brand"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                For Brands
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(activeTab === "influencer"
            ? influencerFeatures
            : brandFeatures
          ).map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors group hover:shadow-md"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <div className="text-purple-600">{feature.icon}</div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
