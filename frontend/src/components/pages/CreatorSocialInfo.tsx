'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Link,
} from "lucide-react";

interface SocialData {
  website: string;
  instagram: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  otherLinks: {
    title: string;
    url: string;
  }[];
}

export const CreatorSocialInfo = () => {
  const router = useRouter();
  const [formData, setFormData] = useLocalStorage<SocialData>(
    "creator-social",
    {
      website: "",
      instagram: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      otherLinks: [],
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addOtherLink = () => {
    setFormData({
      ...formData,
      otherLinks: [...formData.otherLinks, { title: "", url: "" }],
    });
  };

  const removeOtherLink = (index: number) => {
    setFormData({
      ...formData,
      otherLinks: formData.otherLinks.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    localStorage.setItem("creator-social", JSON.stringify(formData));
    alert("Progress saved successfully!");
  };

  const handleSaveAndPreview = () => {
    localStorage.setItem("creator-social", JSON.stringify(formData));
    // Add preview functionality here
    alert("Saved and opening preview...");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-20">
            <div className="flex items-center space-x-8 flex-1">
              {[
                { label: "Overview", step: 1, status: "completed" },
                { label: "Pricing", step: 2, status: "completed" },
                { label: "Description", step: 3, status: "completed" },
                { label: "Requirements", step: 4, status: "completed" },
                { label: "Gallery", step: 5, status: "completed" },
                { label: "Linking", step: 6, status: "current" },
                { label: "Publish", step: 7, status: "upcoming" },
              ].map((step) => (
                <div key={step.label} className="flex items-center space-x-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm
                    ${
                      step.status === "completed"
                        ? "bg-[#1dbf73] text-white"
                        : step.status === "current"
                        ? "bg-[#1dbf73] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : step.step}
                  </div>
                  <span
                    className={
                      step.status === "current"
                        ? "text-gray-900 font-medium"
                        : step.status === "completed"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Save Options */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50"
                type="button"
              >
                Save
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button
                onClick={handleSaveAndPreview}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap"
                type="button"
              >
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold mb-2">
            Connect Your Social Media
          </h1>
          <p className="text-gray-600 text-sm">
            Add your social media profiles to help buyers learn more about your
            work and reach.
          </p>
        </div>

        <div className="space-y-6">
          {/* Website */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Globe className="w-6 h-6 text-gray-400" />
            <input
              type="url"
              placeholder="Your Website URL"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Instagram className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Instagram Username"
              value={formData.instagram}
              onChange={(e) =>
                setFormData({ ...formData, instagram: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* Twitter */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Twitter className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Twitter Username"
              value={formData.twitter}
              onChange={(e) =>
                setFormData({ ...formData, twitter: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* Facebook */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Facebook className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Facebook Profile URL"
              value={formData.facebook}
              onChange={(e) =>
                setFormData({ ...formData, facebook: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* LinkedIn */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Linkedin className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="LinkedIn Profile URL"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* YouTube */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Youtube className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="YouTube Channel URL"
              value={formData.youtube}
              onChange={(e) =>
                setFormData({ ...formData, youtube: e.target.value })
              }
              className="flex-1 border-0 focus:ring-0"
            />
          </div>

          {/* Other Links */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Other Links</h3>
              <button
                onClick={addOtherLink}
                className="text-[#1dbf73] hover:text-[#19a463] text-sm"
              >
                + Add Link
              </button>
            </div>

            {formData.otherLinks.map((link, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...formData.otherLinks];
                      newLinks[index].title = e.target.value;
                      setFormData({ ...formData, otherLinks: newLinks });
                    }}
                    className="w-full p-4 border rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...formData.otherLinks];
                      newLinks[index].url = e.target.value;
                      setFormData({ ...formData, otherLinks: newLinks });
                    }}
                    className="w-full p-4 border rounded-lg"
                  />
                </div>
                <button
                  onClick={() => removeOtherLink(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Link className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-24 mt-12 pb-8">
          <button
            onClick={() => router.back()}
            className="px-12 py-3 text-gray-600 hover:text-gray-900 font-medium"
            type="button"
          >
            Back
          </button>
          <button
            onClick={() => router.push("/publish")}
            className="px-12 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
            type="button"
          >
            Save & Continue
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};
