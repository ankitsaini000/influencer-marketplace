import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'suspended'],
    default: 'draft'
  },
  onboardingStep: {
    type: String,
    enum: ['personal-info', 'professional-info', 'description-faq', 'social-media', 'pricing', 'gallery-portfolio', 'publish'],
    default: 'personal-info'
  },
  
  // 1. Personal Info Page
  personalInfo: {
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    username: { type: String, required: false, trim: true, unique: true, sparse: true },
    bio: { type: String, required: false },
    profileImage: { type: String, required: false },
    coverImage: { type: String, required: false },
    dateOfBirth: Date,
    gender: String,
    email: String,
    phone: String,
    location: {
      city: String,
      state: String,
      country: String,
      address: String,
      postalCode: String
    },
    languages: [{
      language: { type: String, required: true },
      proficiency: { type: String, required: true }
    }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false }
  },
  
  // 2. Professional Info Page
  professionalInfo: {
    title: String,
    category: String,
    subcategory: String,
    yearsExperience: Number,
    expertise: [String],
    skills: [{
      skill: String,
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] }
    }],
    tags: [String],
    awards: [{
      name: String,
      awardedBy: String,
      year: Number
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      year: Number,
      url: String
    }],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number
    }],
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      description: String,
      isCurrent: Boolean
    }],
    eventAvailability: {
      available: Boolean,
      eventTypes: [String],
      pricing: String,
      requirements: String,
      travelWillingness: Boolean,
      preferredLocations: [String],
      leadTime: Number
    }
  },
  
  // 3. Description & FAQ Page
  descriptionFaq: {
    briefDescription: String,
    longDescription: String,
    faqs: [{
      question: String,
      answer: String
    }],
    specialties: [String],
    workProcess: String
  },
  
  // 4. Social Media Page
  socialMedia: {
    socialProfiles: {
      instagram: {
        url: String,
        handle: String,
        followers: Number
      },
      youtube: {
        url: String,
        handle: String,
        subscribers: Number
      },
      tiktok: {
        url: String,
        handle: String,
        followers: Number
      },
      twitter: {
        url: String,
        handle: String,
        followers: Number
      },
      facebook: {
        url: String,
        handle: String,
        followers: Number
      },
      linkedin: {
        url: String,
        handle: String,
        connections: Number
      },
      website: {
        url: String
      }
    },
    totalReach: { type: Number, default: 0 },
    primaryPlatform: String,
    audienceDemographics: {
      ageRanges: [String],
      topCountries: [String],
      genderBreakdown: {
        male: Number,
        female: Number,
        other: Number
      }
    }
  },
  
  // 5. Pricing Page
  pricing: {
    currency: { type: String, default: 'USD' },
    basic: {
      price: { type: Number, default: 0 },
      title: String,
      description: String,
      deliverables: [String],
      revisions: { type: Number, default: 1 },
      deliveryTime: { type: Number, default: 7 },
      isActive: { type: Boolean, default: true }
    },
    standard: {
      price: { type: Number, default: 0 },
      title: String,
      description: String,
      deliverables: [String],
      revisions: { type: Number, default: 2 },
      deliveryTime: { type: Number, default: 7 },
      isActive: { type: Boolean, default: true }
    },
    premium: {
      price: { type: Number, default: 0 },
      title: String,
      description: String,
      deliverables: [String],
      revisions: { type: Number, default: 3 },
      deliveryTime: { type: Number, default: 7 },
      isActive: { type: Boolean, default: true }
    },
    customPackages: { type: Boolean, default: false },
    customPackageDescription: String,
    paymentTerms: String,
    discountPolicies: String
  },
  
  // 6. Gallery & Portfolio Page
  gallery: {
    images: [{
      url: String,
      title: String,
      description: String,
      sortOrder: Number,
      thumbnailUrl: String,
      tags: [String],
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      thumbnailUrl: String,
      sortOrder: Number,
      tags: [String],
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Gallery Portfolio (more modern version of gallery)
  galleryPortfolio: {
    images: [{
      url: String,
      title: String,
      description: String,
      tags: [String],
      order: Number,
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      thumbnail: String,
      tags: [String],
      order: Number,
    }],
    featured: [String]
  },
  
  // Explicit portfolio field to store portfolio items
  portfolio: [{
    id: String,
    title: String,
    image: String,
    category: String,
    client: String,
    description: String,
    isVideo: Boolean,
    videoUrl: String,
    promotionType: String,
    clientFeedback: String,
    projectDate: String,
    results: String,
    tags: [String],
    sortOrder: Number
  }],
  
  // 7. Publish Page
  publishInfo: {
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    featured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false }
  },
  
  // Additional Useful Fields
  availability: {
    timezone: String,
    generalAvailability: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      available: Boolean,
      hours: [String]
    }],
    unavailableDates: [Date],
    responseTime: String,
    bookingNotice: Number
  },
  
  // Stats & Metrics
  metrics: {
    profileViews: { type: Number, default: 0 },
    profileCompleteness: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      distribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
      }
    },
    projectsCompleted: { type: Number, default: 0 },
    repeatClientRate: { type: Number, default: 0 },
    lastActive: Date
  },
  
  // Track completion status for each section
  completionStatus: {
    personalInfo: { type: Boolean, default: false },
    professionalInfo: { type: Boolean, default: false },
    descriptionFaq: { type: Boolean, default: false },
    socialMedia: { type: Boolean, default: false },
    pricing: { type: Boolean, default: false },
    galleryPortfolio: { type: Boolean, default: false }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Pre-save hook to generate profile URL
creatorProfileSchema.pre('save', function(next) {
  if (this.personalInfo && this.personalInfo.username) {
    this.profileUrl = `/creator/${this.personalInfo.username}`;
  }
  next();
});

export interface ICreatorProfile extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  profileUrl: string;
  status: 'draft' | 'published' | 'suspended';
  onboardingStep: 'personal-info' | 'professional-info' | 'description-faq' | 'social-media' | 'pricing' | 'gallery-portfolio' | 'publish';
  
  // Personal Info
  personalInfo: {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    dateOfBirth?: Date;
    gender?: string;
    email?: string;
    phone?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      address?: string;
      postalCode?: string;
    };
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  };
  
  // Professional Info
  professionalInfo: {
    title?: string;
    category?: string;
    subcategory?: string;
    yearsExperience?: number;
    expertise?: string[];
    skills?: Array<{
      skill: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    tags?: string[];
    awards?: Array<{
      name: string;
      awardedBy: string;
      year: number;
    }>;
    certifications?: Array<{
      name: string;
      issuedBy: string;
      year: number;
      url: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number;
    }>;
    experience?: Array<{
      title: string;
      company: string;
      location: string;
      startDate: Date;
      endDate: Date;
      description: string;
      isCurrent: boolean;
    }>;
    eventAvailability?: {
      available: boolean;
      eventTypes: string[];
      pricing: string;
      requirements: string;
      travelWillingness: boolean;
      preferredLocations: string[];
      leadTime: number;
    };
  };
  
  // Description & FAQ
  descriptionFaq: {
    briefDescription?: string;
    longDescription?: string;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    specialties?: string[];
    workProcess?: string;
  };
  
  // Social Media
  socialMedia: {
    socialProfiles?: {
      instagram?: {
        url?: string;
        handle?: string;
        followers?: number;
      };
      youtube?: {
        url?: string;
        handle?: string;
        subscribers?: number;
      };
      tiktok?: {
        url?: string;
        handle?: string;
        followers?: number;
      };
      twitter?: {
        url?: string;
        handle?: string;
        followers?: number;
      };
      facebook?: {
        url?: string;
        handle?: string;
        followers?: number;
      };
      linkedin?: {
        url?: string;
        handle?: string;
        connections?: number;
      };
      website?: {
        url?: string;
      };
    };
    totalReach?: number;
    primaryPlatform?: string;
    audienceDemographics?: {
      ageRanges?: string[];
      topCountries?: string[];
      genderBreakdown?: {
        male?: number;
        female?: number;
        other?: number;
      };
    };
  };
  
  // Pricing
  pricing: {
    packages?: {
      basic?: {
        name?: string;
        price?: number;
        description?: string;
        deliveryTime?: number;
        revisions?: number;
        features?: string[];
      };
      standard?: {
        name?: string;
        price?: number;
        description?: string;
        deliveryTime?: number;
        revisions?: number;
        features?: string[];
      };
      premium?: {
        name?: string;
        price?: number;
        description?: string;
        deliveryTime?: number;
        revisions?: number;
        features?: string[];
      };
    };
    customOffers?: boolean;
    customRequirements?: string;
    customPricing?: {
      hourlyRate?: number;
      dayRate?: number;
      projectRate?: number;
    };
  };
  
  // Gallery & Portfolio
  galleryPortfolio: {
    images?: Array<{
      url: string;
      title?: string;
      description?: string;
      tags?: string[];
      order?: number;
    }>;
    videos?: Array<{
      url: string;
      title?: string;
      description?: string;
      thumbnail?: string;
      tags?: string[];
      order?: number;
    }>;
    featured?: string[];
  };
  
  // Add explicit portfolio field to the interface
  portfolio?: Array<{
    id?: string;
    title: string;
    image?: string;
    category?: string;
    client?: string;
    description?: string;
    isVideo?: boolean;
    videoUrl?: string;
    promotionType?: string;
    clientFeedback?: string;
    projectDate?: string;
    results?: string;
    tags?: string[];
    sortOrder?: number;
  }>;
  
  // Requirements (custom field not directly in schema)
  requirements?: any;
  
  // Publish Info
  publishInfo: {
    isPublished?: boolean;
    publishedAt?: Date;
    featured?: boolean;
    isVerified?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  
  // Additional Fields
  availability: {
    timezone?: string;
    generalAvailability?: Array<{
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      available: boolean;
      hours: string[];
    }>;
    unavailableDates?: Date[];
    responseTime?: string;
    bookingNotice?: number;
  };
  
  // Stats & Metrics
  metrics: {
    profileViews: number;
    profileCompleteness: number;
    averageResponseTime: number;
    ratings: {
      average: number;
      count: number;
      distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
    projectsCompleted: number;
    repeatClientRate: number;
    lastActive?: Date;
  };
  
  // Completion Status
  completionStatus: {
    personalInfo: boolean;
    professionalInfo: boolean;
    descriptionFaq: boolean;
    socialMedia: boolean;
    pricing: boolean;
    galleryPortfolio: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export const CreatorProfile = mongoose.model<ICreatorProfile>('CreatorProfile', creatorProfileSchema);

// Add a named export for CreatorProfileModel for better type safety in controllers
export type CreatorProfileModel = mongoose.Document & ICreatorProfile;