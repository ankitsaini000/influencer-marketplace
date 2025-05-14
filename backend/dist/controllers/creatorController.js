"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testGalleryStorage = exports.debugProfileData = exports.emergencyFixProfile = exports.forceCompleteProfile = exports.testCreator = exports.upgradeToCreator = exports.checkUsername = exports.publishProfile = exports.getCompletionStatus = exports.saveGallery = exports.saveRequirements = exports.savePricing = exports.saveSocialInfo = exports.saveDescription = exports.saveBasicInfo = exports.saveProfessionalInfo = exports.savePersonalInfo = exports.updateCreatorProfile = exports.getProfileData = exports.getPublicCreatorProfile = exports.getMyCreatorProfile = exports.getCreators = exports.createCreatorProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const User_1 = __importDefault(require("../models/User"));
/**
 * @desc    Create a new creator profile
 * @route   POST /api/creators
 * @access  Private
 */
exports.createCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Create creator profile request received with body:', req.body);
    try {
        // Check if user already has a profile
        const existingProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (existingProfile) {
            console.log('User already has a creator profile');
            res.status(400);
            throw new Error('Creator profile already exists for this user');
        }
        // Extract data from request body
        const profileData = Object.assign(Object.assign({}, req.body), { userId: req.user._id, status: 'draft', onboardingStep: 'personal-info', createdAt: new Date(), updatedAt: new Date() });
        // Create new creator profile
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.create(profileData);
        if (creatorProfile) {
            console.log('Creator profile created successfully:', { profileId: creatorProfile._id });
            // Update user role to creator if not already set
            yield User_1.default.findByIdAndUpdate(req.user._id, { role: 'creator' });
            res.status(201).json({
                success: true,
                data: creatorProfile
            });
        }
        else {
            console.log('Failed to create creator profile - unknown error');
            res.status(400);
            throw new Error('Invalid creator profile data');
        }
    }
    catch (err) {
        console.error('Error creating creator profile:', err);
        res.status(500);
        throw new Error('Server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
}));
/**
 * @desc    Get all creators (public profiles)
 * @route   GET /api/creators
 * @access  Public
 */
exports.getCreators = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only get published profiles
        const creators = yield CreatorProfile_1.CreatorProfile.find({
            status: 'published',
            'publishInfo.isPublished': true
        })
            .select('-__v')
            .populate('userId', 'fullName email avatar');
        res.status(200).json({
            success: true,
            count: creators.length,
            data: creators
        });
    }
    catch (error) {
        console.error('Error fetching creators:', error);
        res.status(500);
        throw new Error('Server error fetching creators');
    }
}));
/**
 * @desc    Get creator profile by ID (private - for the creator themselves)
 * @route   GET /api/creators/me
 * @access  Private (creator only)
 */
exports.getMyCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error fetching my creator profile:', error);
        res.status(500);
        throw new Error('Server error fetching creator profile');
    }
}));
/**
 * @desc    Get creator profile by username (public)
 * @route   GET /api/creators/:username
 * @access  Public
 */
exports.getPublicCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        // Find creator profile by username in personalInfo
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({
            'personalInfo.username': username,
            status: 'published',
            'publishInfo.isPublished': true
        }).populate('userId', 'fullName avatar');
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Increment profile views
        creatorProfile.metrics.profileViews += 1;
        yield creatorProfile.save();
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error fetching public creator profile:', error);
        res.status(500);
        throw new Error('Server error fetching creator profile');
    }
}));
/**
 * @desc    Get profile data (for onboarding process)
 * @route   GET /api/creators/profile-data
 * @access  Private
 */
exports.getProfileData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500);
        throw new Error('Server error fetching profile data');
    }
}));
/**
 * @desc    Update creator profile
 * @route   PUT /api/creators/me
 * @access  Private (creator only)
 */
exports.updateCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Update the profile with new data
        const updatedProfile = yield CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId: req.user._id }, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedProfile
        });
    }
    catch (error) {
        console.error('Error updating creator profile:', error);
        res.status(500);
        throw new Error('Server error updating creator profile');
    }
}));
/**
 * @desc    Save personal info section
 * @route   POST /api/creators/personal-info
 * @access  Private
 */
exports.savePersonalInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Saving personal info for user:', req.user._id);
        console.log('Request body:', req.body);
        // First check if the creator profile exists
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            // Create new profile if it doesn't exist
            creatorProfile = yield CreatorProfile_1.CreatorProfile.create({
                userId: req.user._id,
                personalInfo: req.body,
                onboardingStep: 'professional-info',
                status: 'draft',
                completionStatus: {
                    personalInfo: true
                }
            });
            console.log('Created new creator profile with personal info');
        }
        else {
            // Update existing profile
            creatorProfile.personalInfo = req.body;
            creatorProfile.onboardingStep = 'professional-info';
            creatorProfile.completionStatus.personalInfo = true;
            creatorProfile.updatedAt = new Date();
            yield creatorProfile.save();
            console.log('Updated existing creator profile with personal info');
        }
        // If username is provided, also update user model
        if (req.body.username) {
            yield User_1.default.findByIdAndUpdate(req.user._id, { username: req.body.username });
            console.log('Updated username in User model');
        }
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving personal info:', error);
        // Check for duplicate key error (e.g., username already taken)
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            res.status(400);
            throw new Error('Validation error: ' + error.message);
        }
        else if (error.code === 11000) {
            res.status(400);
            throw new Error('Username already exists. Please choose another one.');
        }
        else {
            res.status(500);
            throw new Error('Server error saving personal info');
        }
    }
}));
/**
 * @desc    Save professional info section
 * @route   POST /api/creators/professional-info
 * @access  Private
 */
exports.saveProfessionalInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        console.log('Received professional info from frontend:', req.body);
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            console.error('Creator profile not found for user:', req.user._id);
            res.status(404);
            throw new Error('Creator profile not found. Please complete personal info first.');
        }
        // Validate and format the professional info data
        const professionalInfo = {
            title: req.body.title || '',
            category: req.body.category || '',
            subcategory: req.body.subcategory || '',
            expertise: Array.isArray(req.body.expertise) ? req.body.expertise : [],
            skills: Array.isArray(req.body.skills) ? req.body.skills.map((skill) => {
                if (typeof skill === 'string') {
                    return { skill, level: 'intermediate' };
                }
                return {
                    skill: skill.skill || '',
                    level: skill.level || 'intermediate'
                };
            }) : [],
            awards: Array.isArray(req.body.awards) ? req.body.awards.map((award) => ({
                name: award.name || '',
                awardedBy: award.awardedBy || '',
                year: award.year || new Date().getFullYear()
            })) : [],
            certifications: Array.isArray(req.body.certifications) ? req.body.certifications.map((cert) => ({
                name: cert.name || '',
                issuedBy: cert.issuedBy || '',
                year: cert.year || new Date().getFullYear(),
                url: cert.url || ''
            })) : [],
            eventAvailability: {
                available: Boolean((_a = req.body.eventAvailability) === null || _a === void 0 ? void 0 : _a.available),
                eventTypes: Array.isArray((_b = req.body.eventAvailability) === null || _b === void 0 ? void 0 : _b.eventTypes) ? req.body.eventAvailability.eventTypes : [],
                pricing: ((_c = req.body.eventAvailability) === null || _c === void 0 ? void 0 : _c.pricing) || '',
                requirements: ((_d = req.body.eventAvailability) === null || _d === void 0 ? void 0 : _d.requirements) || '',
                travelWillingness: Boolean((_e = req.body.eventAvailability) === null || _e === void 0 ? void 0 : _e.travelWillingness),
                preferredLocations: Array.isArray((_f = req.body.eventAvailability) === null || _f === void 0 ? void 0 : _f.preferredLocations) ? req.body.eventAvailability.preferredLocations : [],
                leadTime: Number((_g = req.body.eventAvailability) === null || _g === void 0 ? void 0 : _g.leadTime) || 0
            }
        };
        console.log('Formatted professional info for MongoDB:', professionalInfo);
        // Update professional info
        creatorProfile.professionalInfo = professionalInfo;
        creatorProfile.onboardingStep = 'description-faq';
        creatorProfile.completionStatus.professionalInfo = true;
        creatorProfile.updatedAt = new Date();
        // Save to MongoDB
        console.log('Saving professional info to MongoDB for user:', req.user._id);
        yield creatorProfile.save();
        console.log('Professional info successfully saved to MongoDB');
        // Return success response
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving professional info:', error);
        // Check for validation errors
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            res.status(400);
            throw new Error('Validation error: ' + error.message);
        }
        else {
            res.status(500);
            throw new Error('Server error saving professional info: ' + error.message);
        }
    }
}));
/**
 * @desc    Save basic info section
 * @route   POST /api/creators/basic-info
 * @access  Private
 */
exports.saveBasicInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found. Please complete personal info first.');
        }
        // Update professional info
        creatorProfile.professionalInfo = req.body;
        creatorProfile.onboardingStep = 'description-faq';
        creatorProfile.completionStatus.professionalInfo = true;
        creatorProfile.updatedAt = new Date();
        yield creatorProfile.save();
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving basic info:', error);
        res.status(500);
        throw new Error('Server error saving basic info');
    }
}));
/**
 * @desc    Save description & FAQ section
 * @route   POST /api/creators/description
 * @access  Private
 */
exports.saveDescription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('=== Starting Description & FAQ Save Process ===');
        console.log('Received request from user:', req.user._id);
        console.log('Request body:', req.body);
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        console.log('Found creator profile:', creatorProfile ? 'Yes' : 'No');
        if (!creatorProfile) {
            console.log('Error: Creator profile not found for user:', req.user._id);
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Update description & FAQ info
        const descriptionData = {
            briefDescription: req.body.brief || '',
            longDescription: req.body.detailed || '',
            faqs: req.body.faq || [],
            specialties: req.body.specialties || [],
            workProcess: req.body.workProcess || ''
        };
        console.log('Preparing to update description data:', descriptionData);
        creatorProfile.descriptionFaq = descriptionData;
        creatorProfile.onboardingStep = 'social-media';
        creatorProfile.completionStatus.descriptionFaq = true;
        creatorProfile.updatedAt = new Date();
        // Save to MongoDB
        console.log('Saving to MongoDB...');
        const savedProfile = yield creatorProfile.save();
        console.log('MongoDB save successful!');
        console.log('Updated profile:', {
            descriptionFaq: savedProfile.descriptionFaq,
            onboardingStep: savedProfile.onboardingStep,
            completionStatus: savedProfile.completionStatus
        });
        res.status(200).json({
            success: true,
            data: savedProfile
        });
        console.log('=== Description & FAQ Save Process Completed Successfully ===');
    }
    catch (error) {
        console.error('Error in saveDescription:', error);
        console.log('=== Description & FAQ Save Process Failed ===');
        res.status(500);
        throw new Error('Server error saving description');
    }
}));
/**
 * @desc    Save social media section
 * @route   POST /api/creators/social-info
 * @access  Private
 */
exports.saveSocialInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received social media data:', req.body);
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Update social media info
        creatorProfile.socialMedia = {
            socialProfiles: {
                instagram: {
                    url: req.body.instagram || '',
                    handle: req.body.instagramHandle || '',
                    followers: req.body.instagramFollowers || 0
                },
                youtube: {
                    url: req.body.youtube || '',
                    handle: req.body.youtubeHandle || '',
                    subscribers: req.body.youtubeSubscribers || 0
                },
                twitter: {
                    url: req.body.twitter || '',
                    handle: req.body.twitterHandle || '',
                    followers: req.body.twitterFollowers || 0
                },
                facebook: {
                    url: req.body.facebook || '',
                    handle: req.body.facebookHandle || '',
                    followers: req.body.facebookFollowers || 0
                },
                linkedin: {
                    url: req.body.linkedin || '',
                    handle: req.body.linkedinHandle || '',
                    connections: req.body.linkedinConnections || 0
                },
                website: {
                    url: req.body.website || ''
                }
            },
            totalReach: req.body.totalReach || 0,
            primaryPlatform: req.body.primaryPlatform || '',
            audienceDemographics: {
                ageRanges: req.body.ageRanges || [],
                topCountries: req.body.topCountries || [],
                genderBreakdown: {
                    male: req.body.malePercentage || 0,
                    female: req.body.femalePercentage || 0,
                    other: req.body.otherPercentage || 0
                }
            }
        };
        creatorProfile.onboardingStep = 'pricing';
        creatorProfile.completionStatus.socialMedia = true;
        creatorProfile.updatedAt = new Date();
        // Save to MongoDB
        yield creatorProfile.save();
        console.log('Social media data saved to MongoDB:', creatorProfile.socialMedia);
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving social info:', error);
        res.status(500);
        throw new Error('Server error saving social info');
    }
}));
/**
 * @desc    Save pricing section
 * @route   POST /api/creators/pricing
 * @access  Private
 */
exports.savePricing = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received pricing data from frontend:', req.body);
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            console.error('Creator profile not found for user:', req.user._id);
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Update pricing info
        creatorProfile.pricing = req.body;
        creatorProfile.onboardingStep = 'gallery-portfolio';
        creatorProfile.completionStatus.pricing = true;
        creatorProfile.updatedAt = new Date();
        // Save to MongoDB
        console.log('Saving pricing data to MongoDB for user:', req.user._id);
        yield creatorProfile.save();
        console.log('Pricing data successfully saved to MongoDB');
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving pricing to MongoDB:', error);
        res.status(500);
        throw new Error('Server error saving pricing');
    }
}));
/**
 * @desc    Save requirements section
 * @route   POST /api/creators/requirements
 * @access  Private
 */
exports.saveRequirements = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Update requirements info
        // This section doesn't have a direct mapping in the schema, 
        // but can be stored in a custom field
        creatorProfile.requirements = req.body;
        creatorProfile.updatedAt = new Date();
        yield creatorProfile.save();
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error saving requirements:', error);
        res.status(500);
        throw new Error('Server error saving requirements');
    }
}));
/**
 * @desc    Save gallery section
 * @route   POST /api/creators/gallery
 * @access  Private
 */
exports.saveGallery = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log('==== SAVE GALLERY REQUEST RECEIVED ====');
        console.log('Headers:', req.headers);
        console.log('User ID:', (_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        console.log('API Endpoint: /api/creators/gallery');
        console.log('Timestamp:', new Date().toISOString());
        // Check authentication first
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            console.error('Authentication error: User ID not found in request');
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: 'No user ID in request'
            });
            return;
        }
        console.log('Authenticated user ID:', userId);
        // Log the raw request body for debugging
        console.log('Request body (raw):', req.body);
        const { images, videos, portfolioLinks, portfolio } = req.body;
        console.log('Parsed gallery data:', {
            imagesCount: (images === null || images === void 0 ? void 0 : images.length) || 0,
            videosCount: (videos === null || videos === void 0 ? void 0 : videos.length) || 0,
            linksCount: (portfolioLinks === null || portfolioLinks === void 0 ? void 0 : portfolioLinks.length) || 0,
            portfolioItemsCount: (portfolio === null || portfolio === void 0 ? void 0 : portfolio.length) || 0
        });
        // Validate the structure of data
        if (images && !Array.isArray(images)) {
            console.error('Data validation error: images is not an array');
            res.status(400).json({
                success: false,
                message: 'Images must be an array',
                error: 'Invalid data format'
            });
            return;
        }
        if (videos && !Array.isArray(videos)) {
            console.error('Data validation error: videos is not an array');
            res.status(400).json({
                success: false,
                message: 'Videos must be an array',
                error: 'Invalid data format'
            });
            return;
        }
        // Find the creator profile
        console.log('Looking for creator profile with userId:', userId);
        const profile = yield CreatorProfile_1.CreatorProfile.findOne({ userId });
        if (!profile) {
            console.error('Creator profile not found for user:', userId);
            // Try to create a new profile if none exists
            console.log('Attempting to create a new profile for user:', userId);
            try {
                // Create a minimal profile
                const newProfile = new CreatorProfile_1.CreatorProfile({
                    userId,
                    status: 'draft',
                    onboardingStep: 'gallery-portfolio',
                    completionStatus: {
                        personalInfo: false,
                        professionalInfo: false,
                        descriptionFaq: false,
                        socialMedia: false,
                        pricing: false,
                        galleryPortfolio: false
                    }
                });
                yield newProfile.save();
                console.log('Created new profile for user:', userId);
                // Continue with the newly created profile
                yield processGalleryData(newProfile, req, res);
                return;
            }
            catch (createError) {
                console.error('Failed to create new profile:', createError);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create creator profile',
                    error: createError instanceof Error ? createError.message : 'Unknown error'
                });
                return;
            }
        }
        // Process with existing profile
        yield processGalleryData(profile, req, res);
    }
    catch (error) {
        console.error('Unhandled error in saveGallery:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing gallery data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Helper function to process gallery data
function processGalleryData(profile, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            console.log('==== PROCESS GALLERY DATA STARTED ====');
            console.log('Profile ID:', profile._id);
            console.log('Request user ID:', (_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
            // Log full request body for debugging
            console.log('Full request body structure:', {
                hasImages: !!req.body.images,
                hasVideos: !!req.body.videos,
                hasPortfolioLinks: !!req.body.portfolioLinks,
                hasPortfolio: !!req.body.portfolio,
                imagesIsArray: Array.isArray(req.body.images),
                videosIsArray: Array.isArray(req.body.videos),
                portfolioLinksIsArray: Array.isArray(req.body.portfolioLinks),
                portfolioIsArray: Array.isArray(req.body.portfolio),
                imagesCount: Array.isArray(req.body.images) ? req.body.images.length : 0,
                videosCount: Array.isArray(req.body.videos) ? req.body.videos.length : 0,
                portfolioLinksCount: Array.isArray(req.body.portfolioLinks) ? req.body.portfolioLinks.length : 0,
                portfolioCount: Array.isArray(req.body.portfolio) ? req.body.portfolio.length : 0
            });
            // Log first element of each array to debug structure issues
            if (Array.isArray(req.body.images) && req.body.images.length > 0) {
                console.log('First image example:', req.body.images[0]);
            }
            if (Array.isArray(req.body.portfolio) && req.body.portfolio.length > 0) {
                console.log('First portfolio item example:', req.body.portfolio[0]);
            }
            const { images, videos, portfolioLinks, portfolio } = req.body;
            // Enhanced validation with specific error messages
            if (!images && !videos && !portfolio) {
                console.error('Invalid data: No images, videos, or portfolio items found in request');
                res.status(400).json({
                    success: false,
                    message: 'Invalid data: Missing required gallery or portfolio content',
                    error: 'Data validation failed',
                    received: {
                        hasImages: !!images,
                        hasVideos: !!videos,
                        hasPortfolio: !!portfolio
                    }
                });
                return;
            }
            // Check for specific data type issues
            if (images && !Array.isArray(images)) {
                console.error('Data validation error: images is not an array, type:', typeof images);
                res.status(400).json({
                    success: false,
                    message: 'Images must be an array',
                    error: 'Invalid data format',
                    received: { type: typeof images, value: images }
                });
                return;
            }
            if (portfolio && !Array.isArray(portfolio)) {
                console.error('Data validation error: portfolio is not an array, type:', typeof portfolio);
                res.status(400).json({
                    success: false,
                    message: 'Portfolio must be an array',
                    error: 'Invalid data format',
                    received: { type: typeof portfolio, value: portfolio }
                });
                return;
            }
            // Ensure all required fields are present and initialized
            if (!profile.completionStatus) {
                profile.completionStatus = {
                    personalInfo: false,
                    professionalInfo: false,
                    descriptionFaq: false,
                    socialMedia: false,
                    pricing: false,
                    galleryPortfolio: false
                };
            }
            if (!profile.metrics) {
                profile.metrics = {
                    profileViews: 0,
                    profileCompleteness: 0,
                    averageResponseTime: 0,
                    ratings: {
                        average: 0,
                        count: 0,
                        distribution: {
                            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                        }
                    },
                    projectsCompleted: 0,
                    repeatClientRate: 0
                };
            }
            // Initialize onboardingStep if it's not set
            if (!profile.onboardingStep) {
                profile.onboardingStep = 'gallery-portfolio';
            }
            // Initialize status if it's not set
            if (!profile.status) {
                profile.status = 'draft';
            }
            // Use try-catch blocks for each formatting step to ensure data processing doesn't fail
            let formattedImages = [];
            try {
                formattedImages = (images || []).map((img) => {
                    // Handle if it's just a string URL
                    if (typeof img === 'string') {
                        return {
                            url: img,
                            title: `Gallery Image ${Date.now()}`,
                            description: 'Gallery image',
                            tags: [],
                            order: 0
                        };
                    }
                    // Handle malformed objects more carefully
                    if (!img || typeof img !== 'object') {
                        console.warn('Skipping invalid image item:', img);
                        return null;
                    }
                    return {
                        url: img.url || '',
                        title: img.title || `Gallery Image ${Date.now()}`,
                        description: img.description || 'Gallery image',
                        tags: Array.isArray(img.tags) ? img.tags : [],
                        order: typeof img.order === 'number' ? img.order : 0
                    };
                }).filter(Boolean);
            }
            catch (error) {
                console.error('Error formatting images:', error);
                formattedImages = [];
            }
            // Format videos with error handling
            let formattedVideos = [];
            try {
                formattedVideos = (videos || []).map((vid) => {
                    // Handle if it's just a string URL
                    if (typeof vid === 'string') {
                        return {
                            url: vid,
                            title: `Gallery Video ${Date.now()}`,
                            description: 'Gallery video',
                            thumbnail: '',
                            tags: [],
                            order: 0
                        };
                    }
                    // Handle malformed objects more carefully
                    if (!vid || typeof vid !== 'object') {
                        console.warn('Skipping invalid video item:', vid);
                        return null;
                    }
                    return {
                        url: vid.url || '',
                        title: vid.title || `Gallery Video ${Date.now()}`,
                        description: vid.description || 'Gallery video',
                        thumbnail: vid.thumbnail || '',
                        tags: Array.isArray(vid.tags) ? vid.tags : [],
                        order: typeof vid.order === 'number' ? vid.order : 0
                    };
                }).filter(Boolean);
            }
            catch (error) {
                console.error('Error formatting videos:', error);
                formattedVideos = [];
            }
            // Format portfolio links with error handling
            let formattedLinks = [];
            try {
                formattedLinks = (portfolioLinks || []).map((link) => {
                    // Check if it's just a string URL
                    if (typeof link === 'string') {
                        return link;
                    }
                    if (!link) {
                        console.warn('Skipping empty/null portfolio link');
                        return null;
                    }
                    return link.url || '';
                }).filter(Boolean);
            }
            catch (error) {
                console.error('Error formatting portfolio links:', error);
                formattedLinks = [];
            }
            // Format portfolio items with error handling - this is the most critical part
            let formattedPortfolio = [];
            try {
                console.log('Starting portfolio formatting with items count:', (portfolio || []).length);
                formattedPortfolio = (portfolio || []).map((item, index) => {
                    if (!item) {
                        console.warn('Skipping null/undefined portfolio item at index', index);
                        return null;
                    }
                    try {
                        // Log the item type and structure for debugging
                        console.log(`Portfolio item ${index} type:`, typeof item, 'Has ID:', !!item.id, 'Has title:', !!item.title);
                        // Create a valid portfolio item with defaults for all required fields
                        const processedItem = {
                            id: item.id || `portfolio-${Date.now()}-${index}`,
                            title: item.title || 'Portfolio Item',
                            // Handle case where image might be null/undefined
                            image: item.image || 'https://placehold.co/600x400?text=Portfolio+Item',
                            category: item.category || 'general',
                            client: item.client || 'Client',
                            description: item.description || 'Portfolio item description',
                            isVideo: Boolean(item.isVideo),
                            videoUrl: item.videoUrl || '',
                            promotionType: item.promotionType || '',
                            clientFeedback: item.clientFeedback || '',
                            projectDate: item.projectDate || '',
                            sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index
                        };
                        // Validate the processed item has all required fields with proper types
                        for (const [key, value] of Object.entries(processedItem)) {
                            if (value === undefined || value === null) {
                                console.warn(`Fixed missing ${key} in portfolio item ${index}`);
                                processedItem[key] = key === 'isVideo' ? false : '';
                            }
                        }
                        return processedItem;
                    }
                    catch (itemError) {
                        console.error(`Error processing portfolio item at index ${index}:`, itemError);
                        // Return a default item instead of failing
                        return {
                            id: `portfolio-error-${Date.now()}-${index}`,
                            title: 'Error Portfolio Item',
                            image: 'https://placehold.co/600x400?text=Error',
                            category: 'general',
                            client: 'Error Recovery',
                            description: 'This item was created during error recovery.',
                            isVideo: false,
                            videoUrl: '',
                            promotionType: '',
                            clientFeedback: '',
                            projectDate: '',
                            sortOrder: index
                        };
                    }
                }).filter(Boolean);
                console.log('Portfolio formatting completed successfully with items:', formattedPortfolio.length);
            }
            catch (error) {
                console.error('Critical error formatting portfolio items:', error);
                // Provide a minimal default portfolio to avoid failure
                formattedPortfolio = [{
                        id: `portfolio-fallback-${Date.now()}`,
                        title: 'Fallback Portfolio Item',
                        image: 'https://placehold.co/600x400?text=Fallback',
                        category: 'general',
                        client: 'System Recovery',
                        description: 'This is a fallback portfolio item created during error recovery.',
                        isVideo: false,
                        videoUrl: '',
                        promotionType: '',
                        clientFeedback: '',
                        projectDate: '',
                        sortOrder: 0
                    }];
            }
            console.log(`Formatted data counts: ${formattedImages.length} images, ${formattedVideos.length} videos, ${formattedLinks.length} links, ${formattedPortfolio.length} portfolio items`);
            // Update the profile data
            console.log('Updating profile with formatted data...');
            // Check if galleryPortfolio exists, if not initialize it
            if (!profile.galleryPortfolio) {
                profile.galleryPortfolio = {};
            }
            // 1. Update gallery portfolio data
            profile.galleryPortfolio = {
                images: formattedImages,
                videos: formattedVideos,
                featured: formattedLinks
            };
            // Also update legacy gallery field for compatibility
            profile.gallery = {
                images: formattedImages.map((img) => ({
                    url: img.url,
                    title: img.title,
                    description: img.description,
                    sortOrder: img.order || 0,
                    thumbnailUrl: '',
                    tags: img.tags || [],
                    uploadedAt: new Date()
                })),
                videos: formattedVideos.map((vid) => ({
                    url: vid.url,
                    title: vid.title,
                    description: vid.description,
                    thumbnailUrl: vid.thumbnail || '',
                    sortOrder: vid.order || 0,
                    tags: vid.tags || [],
                    uploadedAt: new Date()
                }))
            };
            // 2. Update portfolio items - ensure the portfolio field exists
            if (!profile.portfolio) {
                profile.portfolio = [];
            }
            profile.portfolio = formattedPortfolio;
            // Log what we're about to save
            console.log('About to save the following data to MongoDB:');
            console.log('galleryPortfolio:', {
                imagesCount: profile.galleryPortfolio.images.length,
                videosCount: profile.galleryPortfolio.videos.length,
                featuredCount: profile.galleryPortfolio.featured.length
            });
            console.log('portfolio items count:', profile.portfolio.length);
            // 3. Update onboarding step and completion status
            profile.onboardingStep = 'publish';
            // Ensure completionStatus exists
            if (!profile.completionStatus) {
                profile.completionStatus = {
                    personalInfo: false,
                    professionalInfo: false,
                    descriptionFaq: false,
                    socialMedia: false,
                    pricing: false,
                    galleryPortfolio: false
                };
            }
            // Explicitly set gallery portfolio completion to true
            profile.completionStatus.galleryPortfolio = true;
            // 4. Save the updated profile
            console.log('Saving profile to database...');
            try {
                // Handle potential validation errors before saving
                const validationError = profile.validateSync();
                if (validationError) {
                    console.error('MongoDB validation error:', validationError);
                    // Log detailed validation errors for each path
                    if (validationError.errors) {
                        Object.keys(validationError.errors).forEach(path => {
                            console.error(`Field '${path}' error:`, validationError.errors[path].message);
                        });
                    }
                    // Try to fix common validation issues
                    try {
                        console.log('Attempting to fix validation errors...');
                        // Check for specific validation errors and try to fix them
                        if (validationError.errors['gallery.images']) {
                            profile.gallery.images = [];
                            console.log('Fixed gallery.images');
                        }
                        if (validationError.errors['gallery.videos']) {
                            profile.gallery.videos = [];
                            console.log('Fixed gallery.videos');
                        }
                        if (validationError.errors['galleryPortfolio.images']) {
                            profile.galleryPortfolio.images = [];
                            console.log('Fixed galleryPortfolio.images');
                        }
                        if (validationError.errors['galleryPortfolio.videos']) {
                            profile.galleryPortfolio.videos = [];
                            console.log('Fixed galleryPortfolio.videos');
                        }
                        if (validationError.errors['galleryPortfolio.featured']) {
                            profile.galleryPortfolio.featured = [];
                            console.log('Fixed galleryPortfolio.featured');
                        }
                        // Handle portfolio validation errors
                        if (validationError.errors['portfolio']) {
                            // Try to fix specific portfolio field issues, or reset as last resort
                            try {
                                // Check if any portfolio items have validation issues
                                const hasInvalidItems = profile.portfolio.some((item) => {
                                    return !item.id || !item.title || !item.image;
                                });
                                if (hasInvalidItems) {
                                    // Filter out invalid items
                                    profile.portfolio = profile.portfolio.filter((item) => {
                                        return item && item.id && item.title && item.image;
                                    });
                                    // If we removed all items, add a default one
                                    if (profile.portfolio.length === 0) {
                                        profile.portfolio = [{
                                                id: `portfolio-recovery-${Date.now()}`,
                                                title: 'Recovery Portfolio Item',
                                                image: 'https://placehold.co/600x400?text=Recovery',
                                                category: 'general',
                                                client: 'System Recovery',
                                                description: 'This portfolio item was created during validation error recovery.',
                                                isVideo: false,
                                                videoUrl: '',
                                                promotionType: '',
                                                clientFeedback: '',
                                                projectDate: '',
                                                sortOrder: 0
                                            }];
                                    }
                                    console.log('Fixed portfolio items, new count:', profile.portfolio.length);
                                }
                                else {
                                    console.log('Portfolio items appear valid but still failing validation');
                                    // If we can't identify the specific issue, reset the whole array
                                    profile.portfolio = [{
                                            id: `portfolio-reset-${Date.now()}`,
                                            title: 'Reset Portfolio Item',
                                            image: 'https://placehold.co/600x400?text=Reset',
                                            category: 'general',
                                            client: 'System Reset',
                                            description: 'This portfolio item was created after resetting the portfolio during validation error recovery.',
                                            isVideo: false,
                                            videoUrl: '',
                                            promotionType: '',
                                            clientFeedback: '',
                                            projectDate: '',
                                            sortOrder: 0
                                        }];
                                    console.log('Reset portfolio with a default item');
                                }
                            }
                            catch (portfolioFixError) {
                                console.error('Error trying to fix portfolio validation:', portfolioFixError);
                                // Complete reset as last resort
                                profile.portfolio = [];
                                console.log('Cleared portfolio completely');
                            }
                        }
                        // Try validating again after fixes
                        const newValidationError = profile.validateSync();
                        if (newValidationError) {
                            console.error('Still have validation errors after fixes:', newValidationError);
                            res.status(400).json({
                                success: false,
                                message: 'Data validation failed, unable to fix automatically',
                                error: newValidationError.message,
                                details: newValidationError.errors
                            });
                            return;
                        }
                        else {
                            console.log('Successfully fixed all validation errors!');
                        }
                    }
                    catch (fixError) {
                        console.error('Error trying to fix validation issues:', fixError);
                        res.status(400).json({
                            success: false,
                            message: 'Data validation failed',
                            error: validationError.message,
                            details: validationError.errors
                        });
                        return;
                    }
                }
                yield profile.save();
                console.log('Profile saved successfully');
                // 5. Verify the data was saved by fetching a fresh copy from the database
                console.log('Verifying saved data by fetching from database...');
                const updatedProfile = yield CreatorProfile_1.CreatorProfile.findById(profile._id);
                if (!updatedProfile) {
                    console.error('ERROR: Could not retrieve profile after save!');
                    res.status(500).json({
                        success: false,
                        message: 'Profile was saved but could not be verified',
                        error: 'Database verification failed'
                    });
                    return;
                }
                // Deep verification of saved data
                const galleryVerification = {
                    imagesCount: ((_c = (_b = updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.galleryPortfolio) === null || _b === void 0 ? void 0 : _b.images) === null || _c === void 0 ? void 0 : _c.length) || 0,
                    videosCount: ((_e = (_d = updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.galleryPortfolio) === null || _d === void 0 ? void 0 : _d.videos) === null || _e === void 0 ? void 0 : _e.length) || 0,
                    portfolioCount: ((_f = updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.portfolio) === null || _f === void 0 ? void 0 : _f.length) || 0,
                    galleryPortfolioExists: !!updatedProfile.galleryPortfolio,
                    portfolioExists: !!updatedProfile.portfolio,
                    galleryDataSample: ((_h = (_g = updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.galleryPortfolio) === null || _g === void 0 ? void 0 : _g.images) === null || _h === void 0 ? void 0 : _h.length) ?
                        updatedProfile.galleryPortfolio.images[0] : null,
                    portfolioDataSample: ((_j = updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.portfolio) === null || _j === void 0 ? void 0 : _j.length) ?
                        updatedProfile.portfolio[0] : null
                };
                console.log('Verification - Saved gallery data:', galleryVerification);
                // Return success response
                console.log('Sending success response to client');
                res.status(200).json({
                    success: true,
                    message: 'Gallery and portfolio data saved successfully',
                    data: {
                        galleryPortfolio: updatedProfile.galleryPortfolio,
                        portfolio: updatedProfile.portfolio,
                        completionStatus: updatedProfile.completionStatus,
                        verification: galleryVerification
                    }
                });
            }
            catch (saveError) {
                console.error('Error saving profile:', saveError);
                // Add more detailed error information
                let errorMessage = 'Database error saving profile';
                let errorDetails = {};
                if (saveError instanceof Error) {
                    errorMessage = saveError.message;
                    errorDetails = {
                        stack: saveError.stack,
                        name: saveError.name
                    };
                    // Check for specific MongoDB error types
                    if (saveError.name === 'ValidationError') {
                        errorMessage = 'MongoDB validation error';
                        // @ts-ignore - Handle mongoose validation error
                        const validationErrors = Object.keys(saveError.errors || {}).reduce((acc, key) => {
                            // @ts-ignore
                            acc[key] = saveError.errors[key].message;
                            return acc;
                        }, {});
                        errorDetails = Object.assign(Object.assign({}, errorDetails), { validationErrors });
                    }
                    else if (saveError.name === 'MongoServerError') {
                        // @ts-ignore
                        errorMessage = `MongoDB server error: ${saveError.code}`;
                        // @ts-ignore
                        errorDetails = Object.assign(Object.assign({}, errorDetails), { code: saveError.code, keyPattern: saveError.keyPattern });
                    }
                }
                res.status(500).json({
                    success: false,
                    message: errorMessage,
                    error: saveError instanceof Error ? saveError.message : 'Unknown error',
                    details: errorDetails
                });
            }
        }
        catch (error) {
            console.error('Error in processGalleryData:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing gallery data',
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });
}
/**
 * @desc    Get profile completion status
 * @route   GET /api/creators/completion-status
 * @access  Private
 */
exports.getCompletionStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        // Calculate overall completion percentage
        const sections = Object.values(creatorProfile.completionStatus);
        const completedSections = sections.filter(section => section).length;
        const totalSections = sections.length;
        const completionPercentage = Math.floor((completedSections / totalSections) * 100);
        // Update profile completeness metric
        creatorProfile.metrics.profileCompleteness = completionPercentage;
        yield creatorProfile.save();
        res.status(200).json({
            success: true,
            data: {
                status: creatorProfile.completionStatus,
                percentage: completionPercentage,
                nextStep: creatorProfile.onboardingStep
            }
        });
    }
    catch (error) {
        console.error('Error getting completion status:', error);
        res.status(500);
        throw new Error('Server error fetching completion status');
    }
}));
/**
 * @desc    Publish creator profile
 * @route   POST /api/creators/publish
 * @access  Private
 */
exports.publishProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Publishing profile with data:', req.body);
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            // Create a minimal profile if it doesn't exist
            console.log('Profile not found, creating a minimal profile');
            creatorProfile = new CreatorProfile_1.CreatorProfile({
                userId: req.user._id,
                status: 'draft',
                completionStatus: {
                    personalInfo: false,
                    professionalInfo: false,
                    pricing: false,
                    galleryPortfolio: false,
                    descriptionFaq: false,
                    socialMedia: false
                },
                personalInfo: {},
                professionalInfo: {},
                pricing: {},
                galleryPortfolio: {},
                publishInfo: {
                    isPublished: false
                }
            });
        }
        // Initialize completion status if undefined
        if (!creatorProfile.completionStatus) {
            creatorProfile.completionStatus = {
                personalInfo: false,
                professionalInfo: false,
                pricing: false,
                galleryPortfolio: false,
                descriptionFaq: false,
                socialMedia: false
            };
        }
        // Initialize personal info if undefined
        if (!creatorProfile.personalInfo) {
            creatorProfile.personalInfo = {};
        }
        // Check if bypass flag is provided
        const bypassVerification = req.body.bypassVerification === true;
        console.log(`Bypass verification: ${bypassVerification}`);
        // Only perform checks if not bypassing verification
        if (!bypassVerification) {
            // Check if all required sections are complete
            const requiredSections = ['personalInfo', 'professionalInfo', 'pricing', 'galleryPortfolio'];
            const missingRequiredSections = requiredSections.filter(section => !creatorProfile.completionStatus[section]);
            if (missingRequiredSections.length > 0) {
                res.status(400);
                throw new Error(`Cannot publish profile. Missing required sections: ${missingRequiredSections.join(', ')}`);
            }
        }
        else {
            console.log('Verification checks bypassed by request');
            // Force set all completion status to true when bypassing
            creatorProfile.completionStatus = {
                personalInfo: true,
                professionalInfo: true,
                pricing: true,
                galleryPortfolio: true,
                descriptionFaq: true,
                socialMedia: true
            };
        }
        // Get username from request body or use existing one
        const username = req.body.username || ((_a = creatorProfile.personalInfo) === null || _a === void 0 ? void 0 : _a.username) || `creator_${req.user._id}`;
        console.log(`Using username: ${username}`);
        // Ensure personalInfo exists
        if (!creatorProfile.personalInfo) {
            creatorProfile.personalInfo = {};
        }
        // Set username in personalInfo
        creatorProfile.personalInfo.username = username;
        // Generate profile URL
        creatorProfile.profileUrl = `/creator/${username}`;
        // Initialize publishInfo if missing
        if (!creatorProfile.publishInfo) {
            creatorProfile.publishInfo = {
                isPublished: false
            };
        }
        // Update publish info
        creatorProfile.status = 'published';
        creatorProfile.publishInfo = Object.assign(Object.assign({}, creatorProfile.publishInfo), { isPublished: true, publishedAt: new Date() });
        creatorProfile.updatedAt = new Date();
        // Safely save the profile with error handling
        try {
            yield creatorProfile.save();
            console.log(`Profile saved successfully with username: ${username}`);
        }
        catch (saveError) {
            console.error('Error saving profile:', saveError);
            res.status(500);
            throw new Error(`Failed to save profile: ${saveError.message}`);
        }
        // Also ensure the user has creator role
        try {
            yield User_1.default.findByIdAndUpdate(req.user._id, { role: 'creator' });
        }
        catch (userUpdateError) {
            console.warn('Failed to update user role, continuing anyway:', userUpdateError);
            // Don't fail the whole process if just the role update fails
        }
        res.status(200).json({
            success: true,
            data: {
                message: 'Profile published successfully',
                profile: creatorProfile,
                profileUrl: creatorProfile.profileUrl
            }
        });
    }
    catch (error) {
        console.error('Error publishing profile:', error);
        if (!res.statusCode || res.statusCode === 200) {
            res.status(500);
        }
        throw new Error(error.message || 'Server error publishing profile');
    }
}));
/**
 * @desc    Check if username is available
 * @route   GET /api/creators/check-username/:username
 * @access  Public
 */
exports.checkUsername = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        if (!username) {
            res.status(400);
            throw new Error('Username parameter is required');
        }
        // Check if username follows allowed pattern
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            res.status(200).json({
                available: false,
                message: 'Username can only contain letters, numbers, and underscores'
            });
            return; // Add explicit return to avoid returning res object
        }
        // Check if username exists in CreatorProfile or User model
        const existingCreator = yield CreatorProfile_1.CreatorProfile.findOne({ 'personalInfo.username': username });
        const existingUser = yield User_1.default.findOne({ username });
        const available = !existingCreator && !existingUser;
        res.status(200).json({
            available,
            message: available ? 'Username is available' : 'Username is already taken'
        });
        return; // Add explicit return to avoid returning res object
    }
    catch (error) {
        console.error('Error checking username:', error);
        res.status(500);
        throw new Error('Server error checking username');
    }
}));
/**
 * @desc    Upgrade user to creator role
 * @route   POST /api/creators/upgrade-role
 * @access  Private
 */
exports.upgradeToCreator = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Update user role to creator
        const user = yield User_1.default.findByIdAndUpdate(req.user._id, { role: 'creator' }, { new: true });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        // Check if creator profile exists
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        // Create a draft profile if it doesn't exist
        if (!creatorProfile) {
            creatorProfile = yield CreatorProfile_1.CreatorProfile.create({
                userId: req.user._id,
                status: 'draft',
                onboardingStep: 'personal-info'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Successfully upgraded to creator role',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                },
                profile: creatorProfile
            }
        });
    }
    catch (error) {
        console.error('Error upgrading to creator:', error);
        res.status(500);
        throw new Error('Server error upgrading to creator role');
    }
}));
/**
 * @desc    Test creator endpoint
 * @route   POST /api/creators/test
 * @access  Public
 */
exports.testCreator = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        success: true,
        message: 'Creator API is working',
        data: {
            timestamp: new Date(),
            requestBody: req.body
        }
    });
}));
/**
 * @desc    Force complete profile (for development/testing)
 * @route   POST /api/creators/force-complete
 * @access  Private (should be restricted in production)
 */
exports.forceCompleteProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find creator profile
        let creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId: req.user._id });
        if (!creatorProfile) {
            // Create new profile if it doesn't exist
            creatorProfile = yield CreatorProfile_1.CreatorProfile.create({
                userId: req.user._id,
                status: 'draft'
            });
        }
        // Mark all sections as complete
        creatorProfile.completionStatus = {
            personalInfo: true,
            professionalInfo: true,
            descriptionFaq: true,
            socialMedia: true,
            pricing: true,
            galleryPortfolio: true
        };
        creatorProfile.onboardingStep = 'publish';
        creatorProfile.updatedAt = new Date();
        yield creatorProfile.save();
        res.status(200).json({
            success: true,
            message: 'Profile marked as complete',
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error forcing profile completion:', error);
        res.status(500);
        throw new Error('Server error completing profile');
    }
}));
/**
 * @desc    Emergency fix for profile issues
 * @route   POST /api/creators/emergency-fix
 * @access  Private (admin/debug only)
 */
exports.emergencyFixProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400);
            throw new Error('userId is required');
        }
        // Find and update the profile
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId }, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true, upsert: true });
        res.status(200).json({
            success: true,
            message: 'Profile emergency fix applied',
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error in emergency fix:', error);
        res.status(500);
        throw new Error('Server error fixing profile');
    }
}));
/**
 * @desc    Debug profile data
 * @route   GET /api/creators/debug/:userId
 * @access  Private (admin only)
 */
exports.debugProfileData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400);
            throw new Error('userId parameter is required');
        }
        // Find the profile
        const creatorProfile = yield CreatorProfile_1.CreatorProfile.findOne({ userId }).populate('userId', 'email fullName role');
        if (!creatorProfile) {
            res.status(404);
            throw new Error('Creator profile not found');
        }
        res.status(200).json({
            success: true,
            data: creatorProfile
        });
    }
    catch (error) {
        console.error('Error in debug profile:', error);
        res.status(500);
        throw new Error('Server error debugging profile');
    }
}));
/**
 * @desc    Test gallery/portfolio data storage
 * @route   POST /api/creators/test-gallery
 * @access  Private
 */
exports.testGalleryStorage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Test gallery storage request received');
        const userId = req.user._id;
        console.log('User ID for test:', userId);
        // Create sample data for testing
        const testData = {
            images: [
                {
                    url: 'https://placehold.co/800x600?text=Test+Image',
                    title: 'Test Image',
                    description: 'Test description',
                    tags: ['test'],
                    order: 0
                }
            ],
            videos: [
                {
                    url: 'https://www.youtube.com/watch?v=test',
                    title: 'Test Video',
                    description: 'Test video description',
                    thumbnail: 'https://placehold.co/800x600?text=Test+Video+Thumbnail',
                    tags: ['test'],
                    order: 0
                }
            ],
            portfolioLinks: ['https://example.com'],
            portfolio: [
                {
                    id: `portfolio-test-${Date.now()}`,
                    title: 'Test Portfolio Item',
                    image: 'https://placehold.co/800x600?text=Test+Portfolio',
                    category: 'test',
                    client: 'Test Client',
                    description: 'Test portfolio description',
                    isVideo: false,
                    videoUrl: '',
                    promotionType: 'Test',
                    clientFeedback: 'Great work!',
                    projectDate: 'January 2023',
                    sortOrder: 0
                }
            ]
        };
        // Find or create a profile
        let profile = yield CreatorProfile_1.CreatorProfile.findOne({ userId });
        if (!profile) {
            console.log('Creating new profile for test');
            profile = new CreatorProfile_1.CreatorProfile({
                userId,
                status: 'draft',
                onboardingStep: 'gallery-portfolio'
            });
            yield profile.save();
        }
        // Use processGalleryData with our test data
        req.body = testData;
        yield processGalleryData(profile, req, res);
    }
    catch (error) {
        console.error('Error in testGalleryStorage:', error);
        res.status(500).json({
            success: false,
            message: 'Test gallery storage failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
