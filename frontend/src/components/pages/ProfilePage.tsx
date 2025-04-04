import { DashboardLayout } from "../layout/DashboardLayout";
import { Camera, MapPin, Link2, Edit2, X, Plus } from "lucide-react";
import { useState } from "react";

interface SocialLink {
  platform: string;
  url: string;
}

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  category: string;
  followers: string;
  following: string;
  socialLinks: SocialLink[];
}

interface VerificationState {
  isVerifying: boolean;
  code: string;
  error: string | null;
}

const CATEGORIES = [
  "Fashion & Style",
  "Tech & Gaming",
  "Fitness & Health",
  "Travel & Lifestyle",
  "Business & Finance",
];

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Sarah Johnson",
    username: "@sarahjstyle",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    coverImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
    bio: "Fashion and lifestyle content creator, sharing daily inspiration and style tips. Based in Mumbai, working with global brands.",
    location: "Mumbai, India",
    category: "Fashion & Lifestyle",
    followers: "2.5M",
    following: "892",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/sarahjstyle" },
      { platform: "Twitter", url: "https://twitter.com/sarahjstyle" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/sarahjstyle" },
    ],
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [verificationState, setVerificationState] = useState<VerificationState>(
    {
      isVerifying: false,
      code: "",
      error: null,
    }
  );
  const [pendingUsername, setPendingUsername] = useState("");

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile(editedProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile((prev) => ({
          ...prev,
          [type === "avatar" ? "avatar" : "coverImage"]:
            reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocialLink = () => {
    setEditedProfile((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  };

  const handleRemoveSocialLink = (index: number) => {
    setEditedProfile((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleUsernameChange = (newUsername: string) => {
    if (newUsername !== profile.username) {
      setPendingUsername(newUsername);
      setVerificationState({ isVerifying: true, code: "", error: null });
      // Here you would typically send verification code to user's email
    }
  };

  const handleVerifyUsername = () => {
    // Mock verification - replace with actual API call
    if (verificationState.code === "123456") {
      setEditedProfile((prev) => ({ ...prev, username: pendingUsername }));
      setVerificationState({ isVerifying: false, code: "", error: null });
    } else {
      setVerificationState((prev) => ({
        ...prev,
        error: "Invalid verification code",
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image Section */}
        <div className="relative h-64 md:h-80">
          <img
            src={isEditing ? editedProfile.coverImage : profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <label className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "cover")}
              />
              <Camera className="w-5 h-5" />
            </label>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="relative bg-white rounded-2xl shadow-sm -mt-20 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Profile Basic Info */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <img
                    src={isEditing ? editedProfile.avatar : profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white"
                  />
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "avatar")}
                      />
                      <Camera className="w-4 h-4" />
                    </label>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="text-2xl font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        value={pendingUsername || editedProfile.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="text-gray-500 bg-gray-50 rounded-lg px-3 py-2"
                        placeholder="Username"
                      />
                      {verificationState.isVerifying && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">
                              Verify Username Change
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Please enter the verification code sent to your
                              email
                            </p>
                            <input
                              type="text"
                              value={verificationState.code}
                              onChange={(e) =>
                                setVerificationState((prev) => ({
                                  ...prev,
                                  code: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border rounded-lg mb-4"
                              placeholder="Enter verification code"
                            />
                            {verificationState.error && (
                              <p className="text-red-500 text-sm mb-4">
                                {verificationState.error}
                              </p>
                            )}
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() =>
                                  setVerificationState({
                                    isVerifying: false,
                                    code: "",
                                    error: null,
                                  })
                                }
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleVerifyUsername}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                              >
                                Verify
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <input
                          type="text"
                          value={editedProfile.location}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                      <span className="text-gray-500">{profile.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {profile.followers}
                      </span>
                      <span className="text-gray-600 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {profile.following}
                      </span>
                      <span className="text-gray-600 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-0 flex gap-3">
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isEditing
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isEditing ? (
                    "Save Changes"
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={() => {
                      setEditedProfile(profile);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="w-full h-32 bg-gray-50 rounded-lg px-3 py-2 text-gray-600"
                />
              ) : (
                <p className="text-gray-600">{profile.bio}</p>
              )}
            </div>

            {/* Categories & Social */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Link2 className="w-5 h-5" />
                    {isEditing ? (
                      <select
                        value={editedProfile.category}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="bg-gray-50 rounded-lg px-3 py-2 text-gray-600 w-full"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{profile.category}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Social Links</h2>
                  {isEditing && (
                    <button
                      onClick={handleAddSocialLink}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editedProfile.socialLinks[0].platform}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[0].platform = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="Platform"
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <input
                          type="text"
                          value={editedProfile.socialLinks[0].url}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[0].url = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="URL"
                          className="flex-1 bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={() => handleRemoveSocialLink(0)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editedProfile.socialLinks[1].platform}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[1].platform = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="Platform"
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <input
                          type="text"
                          value={editedProfile.socialLinks[1].url}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[1].url = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="URL"
                          className="flex-1 bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={() => handleRemoveSocialLink(1)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editedProfile.socialLinks[2].platform}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[2].platform = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="Platform"
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <input
                          type="text"
                          value={editedProfile.socialLinks[2].url}
                          onChange={(e) => {
                            const newLinks = [...editedProfile.socialLinks];
                            newLinks[2].url = e.target.value;
                            setEditedProfile((prev) => ({
                              ...prev,
                              socialLinks: newLinks,
                            }));
                          }}
                          placeholder="URL"
                          className="flex-1 bg-gray-50 rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={() => handleRemoveSocialLink(2)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <a
                      href={profile.socialLinks[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 hover:text-purple-600"
                    >
                      <img
                        src={`/icons/${profile.socialLinks[0].platform.toLowerCase()}.svg`}
                        alt={profile.socialLinks[0].platform}
                        className="w-5 h-5"
                      />
                      <span>{profile.socialLinks[0].platform}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
