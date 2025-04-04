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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'CreatorProfile'
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
// Create indexes
reviewSchema.index({ creatorId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ creatorId: 1, userId: 1 }, { unique: true }); // One review per user per creator
// Middleware to update creator rating when a review is created/updated/deleted
reviewSchema.post('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateCreatorRating(this.creatorId);
    });
});
reviewSchema.post(['findOneAndUpdate'], function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (doc) {
            yield updateCreatorRating(doc.creatorId);
        }
    });
});
reviewSchema.post('deleteOne', function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore - this has document properties in the context
        if (this.creatorId) {
            // @ts-ignore
            yield updateCreatorRating(this.creatorId);
        }
    });
});
// Helper function to update creator's average rating
function updateCreatorRating(creatorId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get all reviews for this creator
        const Review = mongoose_1.default.model('Review');
        const reviews = yield Review.find({ creatorId });
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        // Update creator profile
        const CreatorProfile = mongoose_1.default.model('CreatorProfile');
        yield CreatorProfile.findByIdAndUpdate(creatorId, {
            rating: parseFloat(averageRating.toFixed(1)),
            reviews: reviews.length
        });
    });
}
const Review = mongoose_1.default.model('Review', reviewSchema);
exports.default = Review;
