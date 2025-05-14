'use client';

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { useCreatorStore } from "@/store/creatorStore";
import PublishedCreators from '../creator/PublishedCreators';

interface Creator {
  id: string;
  name: string;
  username: string;
  level: string;
  category: string;
  avatar: string;
  coverImage: string;
  description: string;
  rating: number;
  reviews: number;
  startingPrice: string;
  isOnline?: boolean;
  location: string;
  tags?: string[];
  followers?: string;
  isLiked: boolean;
}

export function Dashboard() {
  const router = useRouter();
  const { toggleLike } = useCreatorStore();

  useEffect(() => {
    document.title = "Home | Creator Platform";
  }, []);

  // Hero Section Data
  const heroStats = [
    { value: "12K+", label: "NETWORKS" },
    { value: "76K+", label: "BRANDS" },
    { value: "55K+", label: "CREATORS" },
  ];

  // Categories Data
  const categories = [
    { icon: "👗", name: "Fashion & Beauty", count: 2500 },
    { icon: "✈️", name: "Travel", count: 1800 },
    { icon: "💪", name: "Fitness & Health", count: 2100 },
    { icon: "💻", name: "Tech", count: 1500 },
    { icon: "🎵", name: "Music", count: 2800 },
    { icon: "🎮", name: "Gaming", count: 2300 },
    { icon: "🍳", name: "Food & Cooking", count: 1900 },
    { icon: "📚", name: "Education", count: 1700 },
  ];

  // Top Creators Data
  const topCreators: Creator[] = [
    // Fashion & Beauty Creators
    {
      id: "@stylemaven",
      name: "Style Maven",
      username: "@stylemaven",
      level: "Level 1 Creator",
      category: "Fashion & Beauty",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      coverImage:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      description:
        "Fashion blogger and style consultant specializing in sustainable fashion",
      rating: 4.9,
      reviews: 485,
      startingPrice: "₹45000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@beautyqueen",
      name: "Beauty Expert",
      username: "@beautyqueen",
      level: "Level 2 Creator",
      category: "Fashion & Beauty",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      coverImage:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
      description: "Professional makeup artist and beauty influencer",
      rating: 4.8,
      reviews: 380,
      startingPrice: "₹40000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Tech Creators
    {
      id: "@techguru",
      name: "Tech Guru",
      username: "@techguru",
      level: "Level 3 Creator",
      category: "Tech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      coverImage:
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634",
      description: "Tech reviewer and gadget specialist",
      rating: 4.9,
      reviews: 450,
      startingPrice: "₹55000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@codemaster",
      name: "Code Master",
      username: "@codemaster",
      level: "Level 2 Creator",
      category: "Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      coverImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
      description: "Software developer and tech educator",
      rating: 4.7,
      reviews: 320,
      startingPrice: "₹48000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Travel Creators
    {
      id: "@wanderlust",
      name: "Wanderlust",
      username: "@wanderlust",
      level: "Level 2 Creator",
      category: "Travel",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      coverImage:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      description: "Travel blogger exploring hidden gems worldwide",
      rating: 4.8,
      reviews: 410,
      startingPrice: "₹42000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@globetrotter",
      name: "Globe Trotter",
      username: "@globetrotter",
      level: "Level 1 Creator",
      category: "Travel",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
      coverImage:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      description: "Adventure travel and photography expert",
      rating: 4.6,
      reviews: 280,
      startingPrice: "₹38000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Fitness & Health Creators
    {
      id: "@fitnesspro",
      name: "Fitness Pro",
      username: "@fitnesspro",
      level: "Level 3 Creator",
      category: "Fitness & Health",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      coverImage:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
      description: "Personal trainer and nutrition expert",
      rating: 4.9,
      reviews: 520,
      startingPrice: "₹50000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@wellnessguide",
      name: "Wellness Guide",
      username: "@wellnessguide",
      level: "Level 2 Creator",
      category: "Fitness & Health",
      avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b",
      coverImage:
        "https://images.unsplash.com/photo-1517130038641-a774d04afb3c",
      description: "Holistic health coach and yoga instructor",
      rating: 4.7,
      reviews: 340,
      startingPrice: "₹45000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Music Creators
    {
      id: "@musicmaestro",
      name: "Music Maestro",
      username: "@musicmaestro",
      level: "Level 2 Creator",
      category: "Music",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556",
      coverImage:
        "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
      description: "Music producer and vocal coach",
      rating: 4.8,
      reviews: 390,
      startingPrice: "₹46000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@rhythmmaster",
      name: "Rhythm Master",
      username: "@rhythmmaster",
      level: "Level 1 Creator",
      category: "Music",
      avatar: "https://images.unsplash.com/photo-1536321115970-5dfa13356211",
      coverImage:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
      description: "DJ and electronic music producer",
      rating: 4.6,
      reviews: 260,
      startingPrice: "₹40000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Gaming Creators
    {
      id: "@gamemaster",
      name: "Game Master",
      username: "@gamemaster",
      level: "Level 3 Creator",
      category: "Gaming",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      description: "Professional gamer and strategy guide creator",
      rating: 4.9,
      reviews: 480,
      startingPrice: "₹52000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@streampro",
      name: "Stream Pro",
      username: "@streampro",
      level: "Level 2 Creator",
      category: "Gaming",
      avatar: "https://images.unsplash.com/photo-1557555187-23d685287bc3",
      coverImage:
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc",
      description: "Game streamer and community builder",
      rating: 4.7,
      reviews: 350,
      startingPrice: "₹44000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Food & Cooking Creators
    {
      id: "@chefsupreme",
      name: "Chef Supreme",
      username: "@chefsupreme",
      level: "Level 2 Creator",
      category: "Food & Cooking",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      coverImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d",
      description: "Professional chef and recipe developer",
      rating: 4.8,
      reviews: 430,
      startingPrice: "₹47000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@foodartist",
      name: "Food Artist",
      username: "@foodartist",
      level: "Level 1 Creator",
      category: "Food & Cooking",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      coverImage:
        "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
      description: "Food photographer and styling expert",
      rating: 4.6,
      reviews: 290,
      startingPrice: "₹41000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Education Creators
    {
      id: "@learningpro",
      name: "Learning Pro",
      username: "@learningpro",
      level: "Level 3 Creator",
      category: "Education",
      avatar: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57",
      coverImage:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
      description: "Online course creator and education expert",
      rating: 4.9,
      reviews: 510,
      startingPrice: "₹54000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@studyguide",
      name: "Study Guide",
      username: "@studyguide",
      level: "Level 2 Creator",
      category: "Education",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      coverImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      description: "Academic tutor and study skills coach",
      rating: 4.7,
      reviews: 330,
      startingPrice: "₹43000",
      location: "Delhi, India",
      isLiked: false,
    },
  ];

  // Top Creators List Data - limit to 3
  const topCreatorsList = [
    {
      name: "Jerome Bell",
      username: "@jeromebe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
    {
      name: "Williamson",
      username: "@willmasi",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    {
      name: "Guy Hawkins",
      username: "@guyhawja",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedCategory") || "All";
    }
    return "All";
  });

  const [selectedSearchCategory, setSelectedSearchCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedSearchCategory") || "All";
    }
    return "All";
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("searchQuery") || "";
    }
    return "";
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  const handleSearchCategorySelect = (category: string) => {
    setSelectedSearchCategory(category);
    setIsCategoryDropdownOpen(false);
    localStorage.setItem("selectedSearchCategory", category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    localStorage.setItem("searchQuery", query);

    if (query.trim() === "") {
      setShowSearchResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = topCreators.filter((creator) => {
      return (
        creator.name.toLowerCase().includes(searchTerm) ||
        creator.username.toLowerCase().includes(searchTerm) ||
        creator.category.toLowerCase().includes(searchTerm) ||
        creator.description.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof topCreators>([]);

  // Add state for dropdown
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const filteredCreators = topCreators.filter((creator) => {
    if (selectedCategory === "All") return true;
    return creator.category === selectedCategory;
  });

  return (
    <DashboardLayout>
      <main className="p-6 space-y-8">
        {/* Hero and Top Creators Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hero Section */}
          <div className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white">
            <h1 className="text-3xl font-bold mb-4">We Help to hire</h1>

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>

            <button className="bg-white text-purple-600 px-5 py-1.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors mb-8">
              Explore
            </button>

            {/* Search Section - Moved to bottom */}
            <div className="flex gap-4 mt-auto">
              {/* Categories Dropdown */}
              <div className="relative min-w-[200px]">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="w-full flex items-center justify-between bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-full border border-white/20"
                >
                  <span>{selectedSearchCategory}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-50">
                    <div
                      className="p-2 hover:bg-gray-50 cursor-pointer text-gray-900"
                      onClick={() =>
                        handleSearchCategorySelect("All Categories")
                      }
                    >
                      All Categories
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category.name}
                        className="p-2 hover:bg-gray-50 cursor-pointer text-gray-900"
                        onClick={() =>
                          handleSearchCategorySelect(category.name)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search here"
                  className="w-full px-5 py-3 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 p-2 rounded-full hover:bg-purple-600 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden max-h-[400px] overflow-y-auto z-50">
                    {searchResults.length > 0 ? (
                      searchResults.map((creator) => (
                        <div
                          key={creator.username}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                          onClick={() =>
                            router.push(`/creator/${creator.username}`)
                          }
                        >
                          {/* Level Badge */}
                          <div className="relative">
                            <img
                              src={creator.coverImage}
                              alt=""
                              className="w-full h-48 object-cover"
                            />
                            <span className="absolute top-4 right-4 bg-purple-400/90 text-white px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                              {creator.level}
                            </span>
                          </div>

                          {/* Content Section */}
                          <div className="p-5">
                            {/* Profile Info */}
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={creator.avatar}
                                alt={creator.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {creator.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {creator.category}
                                </p>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4">
                              {creator.description}
                            </p>

                            {/* Social Icons */}
                            <div className="flex items-center gap-3 mb-4 text-gray-400">
                              <a
                                href="#"
                                className="hover:text-gray-600 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                              </a>
                              <a
                                href="#"
                                className="hover:text-gray-600 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                              </a>
                              <a
                                href="#"
                                className="hover:text-gray-600 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.407 0 22.675 0z" />
                                </svg>
                              </a>
                              <a
                                href="#"
                                className="hover:text-gray-600 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                              </a>
                            </div>

                            {/* Rating and Price */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="font-medium">
                                  {creator.rating}
                                </span>
                                <span className="text-gray-400">
                                  ({creator.reviews})
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  STARTING AT
                                </p>
                                <p className="text-lg font-semibold">
                                  {creator.startingPrice}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Creators Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Creators
              </h2>
              <button className="text-purple-600 text-sm font-medium">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {topCreatorsList.map((creator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {creator.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {creator.username}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section with Slider */}
        <div className="relative">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button className="category-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="category-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <button className="text-purple-600 text-sm font-medium">
                View all
              </button>
            </div>
          </div>

          {/* Slider */}
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
              prevEl: ".category-prev",
              nextEl: ".category-next",
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="categories-slider"
          >
            {categories.map((category) => (
              <SwiperSlide key={category.name}>
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count} creators
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Top Creators Section */}
        <div>
          <PublishedCreators title="Top Creators" />
        </div>

        {/* Your existing stats and charts sections can remain below */}
        {/* ... */}
      </main>
    </DashboardLayout>
  );
}
