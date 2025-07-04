"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const creatorProfileSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
creatorProfileSchema.pre('save', function (next) {
    if (this.personalInfo && this.personalInfo.username) {
        this.profileUrl = `/creator/${this.personalInfo.username}`;
    }
    next();
});
exports.CreatorProfile = mongoose_1.default.model('CreatorProfile', creatorProfileSchema);
