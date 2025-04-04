"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const creatorProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    overview: {
        title: { type: String, default: '' },
        category: { type: String, default: '' },
        subcategory: { type: String, default: '' }
    },
    pricing: {
        basic: { type: Number, default: 0 },
        standard: { type: Number, default: 0 },
        premium: { type: Number, default: 0 }
    },
    description: { type: String, default: '' },
    requirements: [{ type: String }],
    gallery: [{ type: String }],
    social: {
        website: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
        youtube: { type: String },
        otherLinks: [{
                title: { type: String },
                url: { type: String }
            }]
    },
    status: {
        type: String,
        enum: ['published', 'draft', 'pending'],
        default: 'draft'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 5.0
    },
    reviews: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String
    },
    metadata: {
        personalInfo: {
            fullName: String,
            username: { type: String, unique: true, sparse: true },
            profileImage: String,
            bio: String,
            location: String,
            languages: [String],
            skills: [String]
        },
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
creatorProfileSchema.index({ userId: 1 });
creatorProfileSchema.index({ 'overview.category': 1 });
creatorProfileSchema.index({ 'overview.subcategory': 1 });
creatorProfileSchema.index({ status: 1 });
creatorProfileSchema.index({ rating: -1 });
creatorProfileSchema.index({ 'metadata.personalInfo.username': 1 }, { unique: true, sparse: true });
const CreatorProfile = mongoose_1.default.model('CreatorProfile', creatorProfileSchema);
exports.default = CreatorProfile;
