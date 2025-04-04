import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'suspended'],
    default: 'draft'
  },
  personalInfo: {
    fullName: {
      type: String,
      required: false,
      trim: true
    },
    username: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true
    },
    bio: {
      type: String,
      required: false
    },
    profileImage: {
      type: String,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    languages: [{
      language: {
        type: String,
        required: true
      },
      proficiency: {
        type: String,
        required: true
      }
    }],
    skills: [{
      type: String
    }]
  },
  basicInfo: {
    title: String,
    category: String,
    subcategory: String,
    expertise: [String],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: Number,
    tags: [String]
  },
  pricing: {
    packages: {
      basic: {
        name: String,
        price: Number,
        description: String,
        deliveryTime: Number,
        revisions: Number,
        features: [String]
      },
      standard: {
        name: String,
        price: Number,
        description: String,
        deliveryTime: Number,
        revisions: Number,
        features: [String]
      },
      premium: {
        name: String,
        price: Number,
        description: String,
        deliveryTime: Number,
        revisions: Number,
        features: [String]
      }
    },
    customOffers: {
      type: Boolean,
      default: false
    }
  },
  description: {
    brief: String,
    detailed: String,
    faq: [{
      question: String,
      answer: String
    }]
  },
  requirements: {
    briefInstructions: String,
    questions: [{
      question: String,
      required: Boolean
    }],
    additionalInfo: String
  },
  gallery: {
    images: [String],
    videos: [String],
    portfolioLinks: [{
      title: String,
      url: String
    }]
  },
  socialInfo: {
    website: String,
    instagram: String,
    twitter: String,
    facebook: String,
    linkedin: String,
    youtube: String,
    other: [{
      platform: String,
      url: String
    }],
    followersCount: {
      type: Map,
      of: Number,
      default: () => new Map()
    }
  },
  professionalInfo: {
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      year: String
    }],
    specialties: [String]
  },
  accountSecurity: {
    phone: String,
    twoFactorEnabled: Boolean,
    notifications: [{
      type: String,
      enabled: Boolean
    }]
  },
  completionStatus: {
    basicInfo: {
      type: Boolean,
      default: false
    },
    pricing: {
      type: Boolean,
      default: false
    },
    description: {
      type: Boolean,
      default: false
    },
    requirements: {
      type: Boolean,
      default: false
    },
    gallery: {
      type: Boolean,
      default: false
    },
    socialInfo: {
      type: Boolean,
      default: false
    },
    personalInfo: {
      type: Boolean,
      default: false
    }
  },
  profileUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviews: {
    type: Number,
    default: 0
  },
  publishedAt: Date
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
  userId: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'suspended';
  personalInfo: {
    fullName: string;
    username: string;
    bio: string;
    profileImage: string;
    location: string;
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    skills: string[];
  };
  basicInfo: {
    title: string;
    category: string;
    subcategory: string;
    expertise: string[];
    level: 'beginner' | 'intermediate' | 'expert';
    yearsOfExperience: number;
    tags: string[];
  };
  pricing: {
    packages: {
      basic: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      standard: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      premium: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
    };
    customOffers: boolean;
  };
  description: {
    brief: string;
    detailed: string;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  };
  requirements: {
    briefInstructions: string;
    questions: Array<{
      question: string;
      required: boolean;
    }>;
    additionalInfo: string;
  };
  gallery: {
    images: string[];
    videos: string[];
    portfolioLinks: Array<{
      title: string;
      url: string;
    }>;
  };
  socialInfo: {
    website: string;
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    other: Array<{
      platform: string;
      url: string;
    }>;
    followersCount: Map<string, number>;
  };
  professionalInfo: {
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
    }>;
    specialties: string[];
  };
  accountSecurity: {
    phone: string;
    twoFactorEnabled: boolean;
    notifications: Array<{
      type: string;
      enabled: boolean;
    }>;
  };
  completionStatus: {
    basicInfo: boolean;
    pricing: boolean;
    description: boolean;
    requirements: boolean;
    gallery: boolean;
    socialInfo: boolean;
    personalInfo: boolean;
  };
  profileUrl: string;
  rating: number;
  reviews: number;
  publishedAt: Date;
}

export const CreatorProfile = mongoose.model<ICreatorProfile>('CreatorProfile', creatorProfileSchema); 