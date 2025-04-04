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
exports.testCreator = exports.getCreatorProfiles = exports.updateCreatorProfile = exports.getMyCreatorProfile = exports.getCreatorProfileById = exports.createCreatorProfile = exports.publishProfile = exports.checkUsername = exports.saveProfileData = exports.saveSocialInfo = exports.saveGallery = exports.saveRequirements = exports.saveDescription = exports.savePricing = exports.saveProfileOverview = exports.saveAccountSecurity = exports.saveProfessionalInfo = exports.savePersonalInfo = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CreatorProfile_1 = __importDefault(require("../models/CreatorProfile"));
const User_1 = __importDefault(require("../models/User"));
// Helper function to get or create a profile
const getOrCreateProfileForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    let profile = yield CreatorProfile_1.default.findOne({ userId });
    if (!profile) {
        // Create a new profile if one doesn't exist
        profile = yield CreatorProfile_1.default.create({
            userId,
            overview: {
                title: '',
                category: '',
                subcategory: ''
            },
            pricing: {
                basic: 0,
                standard: 0,
                premium: 0
            },
            description: '',
            requirements: [],
            gallery: [],
            social: {},
            status: 'draft'
        });
    }
    return profile;
});
// @desc    Save creator personal info
// @route   POST /api/creators/personal-info
// @access  Private (users with creator role)
exports.savePersonalInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, username, profileImage, bio, location, languages, skills } = req.body;
    // Check username availability if provided
    if (username) {
        const existingProfile = yield CreatorProfile_1.default.findOne({
            'metadata.personalInfo.username': username,
            userId: { $ne: req.user._id } // Exclude current user's profile
        });
        if (existingProfile) {
            res.status(400);
            throw new Error('Username is already in use');
        }
    }
    // Update the user record for some fields
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        user.fullName = fullName || user.fullName;
        user.avatar = profileImage || user.avatar;
        yield user.save();
    }
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Store data in a metadata field for now
    // This is a flexible approach until we migrate the model
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { personalInfo: {
            fullName,
            username,
            profileImage,
            bio,
            location,
            languages,
            skills
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator professional info
// @route   POST /api/creators/professional-info
// @access  Private (users with creator role)
exports.saveProfessionalInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { experience, education, certifications, specialties } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Store data in a metadata field
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { professionalInfo: {
            experience,
            education,
            certifications,
            specialties
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator account security
// @route   POST /api/creators/account-security
// @access  Private (users with creator role)
exports.saveAccountSecurity = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, twoFactorEnabled, notifications } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update email in user record
    const user = yield User_1.default.findById(req.user._id);
    if (user && email && email !== user.email) {
        user.email = email;
        yield user.save();
    }
    // Store data in a metadata field
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { accountSecurity: {
            phone,
            twoFactorEnabled,
            notifications
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator profile overview
// @route   POST /api/creators/overview
// @access  Private (users with creator role)
exports.saveProfileOverview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, category, subcategory, tags } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the overview fields
    profile.overview = {
        title: title || profile.overview.title,
        category: category || profile.overview.category,
        subcategory: subcategory || profile.overview.subcategory
    };
    // Store tags in metadata
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { overview: {
            tags
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator pricing
// @route   POST /api/creators/pricing
// @access  Private (users with creator role)
exports.savePricing = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { basic, standard, premium } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the pricing fields
    profile.pricing = {
        basic: basic.price || profile.pricing.basic,
        standard: standard.price || profile.pricing.standard,
        premium: premium.price || profile.pricing.premium
    };
    // Store detailed pricing in metadata
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { pricing: {
            basic,
            standard,
            premium
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator description
// @route   POST /api/creators/description
// @access  Private (users with creator role)
exports.saveDescription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, aboutMe, approach } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the description field
    profile.description = description || profile.description;
    // Store additional description data in metadata
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { description: {
            aboutMe,
            approach
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator requirements
// @route   POST /api/creators/requirements
// @access  Private (users with creator role)
exports.saveRequirements = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requirements, faq } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the requirements field
    profile.requirements = requirements || profile.requirements;
    // Store FAQ in metadata
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { requirements: {
            faq
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator gallery
// @route   POST /api/creators/gallery
// @access  Private (users with creator role)
exports.saveGallery = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { images, videos, portfolioLinks } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the gallery field
    profile.gallery = images || profile.gallery;
    // Store additional gallery data in metadata
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { gallery: {
            videos,
            portfolioLinks
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save creator social info
// @route   POST /api/creators/social-info
// @access  Private (users with creator role)
exports.saveSocialInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { website, instagram, twitter, facebook, linkedin, youtube, tiktok, otherLinks } = req.body;
    // Get or create a profile
    const profile = yield getOrCreateProfileForUser(req.user._id);
    // Update the social field
    profile.social = {
        website: website || ((_a = profile.social) === null || _a === void 0 ? void 0 : _a.website),
        instagram: instagram || ((_b = profile.social) === null || _b === void 0 ? void 0 : _b.instagram),
        twitter: twitter || ((_c = profile.social) === null || _c === void 0 ? void 0 : _c.twitter),
        facebook: facebook || ((_d = profile.social) === null || _d === void 0 ? void 0 : _d.facebook),
        linkedin: linkedin || ((_e = profile.social) === null || _e === void 0 ? void 0 : _e.linkedin),
        youtube: youtube || ((_f = profile.social) === null || _f === void 0 ? void 0 : _f.youtube),
        otherLinks: otherLinks || ((_g = profile.social) === null || _g === void 0 ? void 0 : _g.otherLinks)
    };
    // Store tiktok in metadata since it's not in the original model
    profile.metadata = Object.assign(Object.assign({}, profile.metadata), { social: {
            tiktok
        } });
    yield profile.save();
    res.status(200).json({
        success: true,
        data: profile
    });
}));
// @desc    Save multiple sections of creator profile data at once
// @route   POST /api/creators/profile-data
// @access  Private (users with creator role)
exports.saveProfileData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        console.log('Received saveProfileData request with data:', JSON.stringify(req.body, null, 2));
        
        // Check if the user is available in the request
        if (!req.user || !req.user._id) {
            console.error('User not found in request:', req.user);
            return res.status(401).json({
                success: false,
                message: 'Authentication failed - user not found in request'
            });
        }
        
        const { personalInfo, professionalInfo, accountSecurity, overview, pricing, description, requirements, gallery, social } = req.body;
        
        // Get or create a profile
        let profile;
        try {
            profile = yield getOrCreateProfileForUser(req.user._id);
            console.log('Profile found or created:', profile._id);
        } catch (profileError) {
            console.error('Error getting or creating profile:', profileError);
            return res.status(500).json({
                success: false,
                message: 'Database error: Unable to get or create profile',
                error: profileError.message
            });
        }
        
        // Update user information if personal info provided
        if (personalInfo) {
            try {
                const user = yield User_1.default.findById(req.user._id);
                if (user) {
                    user.fullName = personalInfo.fullName || user.fullName;
                    user.avatar = personalInfo.profileImage || user.avatar;
                    yield user.save();
                }
            } catch (userError) {
                console.error('Error updating user information:', userError);
                // Continue with profile update even if user update fails
            }
        }
        
        // Check username uniqueness if provided
        if (personalInfo && personalInfo.username) {
            try {
                const existingUsername = yield CreatorProfile_1.default.findOne({
                    'metadata.personalInfo.username': personalInfo.username,
                    userId: { $ne: req.user._id } // Exclude current user's profile
                });
                
                if (existingUsername) {
                    console.error(`Username ${personalInfo.username} already taken`);
                    return res.status(409).json({
                        success: false,
                        message: 'Username is already taken by another creator'
                    });
                }
            } catch (usernameError) {
                console.error('Error checking username uniqueness:', usernameError);
            }
        }
        
        // Update profile fields
        if (overview) {
            profile.overview = {
                title: overview.title || profile.overview.title,
                category: overview.category || profile.overview.category,
                subcategory: overview.subcategory || profile.overview.subcategory
            };
        }
        if (pricing) {
            profile.pricing = {
                basic: pricing.basic.price || profile.pricing.basic,
                standard: pricing.standard.price || profile.pricing.standard,
                premium: pricing.premium.price || profile.pricing.premium
            };
        }
        if (description) {
            profile.description = description.description || profile.description;
        }
        if (requirements) {
            profile.requirements = requirements.requirements || profile.requirements;
        }
        if (gallery) {
            profile.gallery = gallery.images || profile.gallery;
        }
        if (social) {
            profile.social = {
                website: social.website || ((_a = profile.social) === null || _a === void 0 ? void 0 : _a.website),
                instagram: social.instagram || ((_b = profile.social) === null || _b === void 0 ? void 0 : _b.instagram),
                twitter: social.twitter || ((_c = profile.social) === null || _c === void 0 ? void 0 : _c.twitter),
                facebook: social.facebook || ((_d = profile.social) === null || _d === void 0 ? void 0 : _d.facebook),
                linkedin: social.linkedin || ((_e = profile.social) === null || _e === void 0 ? void 0 : _e.linkedin),
                youtube: social.youtube || ((_f = profile.social) === null || _f === void 0 ? void 0 : _f.youtube),
                otherLinks: social.otherLinks || ((_g = profile.social) === null || _g === void 0 ? void 0 : _g.otherLinks)
            };
        }
        
        // Update metadata with all provided sections
        profile.metadata = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, profile.metadata), (personalInfo && { personalInfo })), (professionalInfo && { professionalInfo })), (accountSecurity && { accountSecurity })), (overview && { overview: { tags: overview.tags } })), (pricing && { pricing })), (description && { description: { aboutMe: description.aboutMe, approach: description.approach } })), (requirements && { requirements: { faq: requirements.faq } })), (gallery && { gallery: { videos: gallery.videos, portfolioLinks: gallery.portfolioLinks } })), (social && { social: { tiktok: social.tiktok } }));
        
        // Save the profile
        try {
            yield profile.save();
            console.log('Profile saved successfully:', profile._id);
            return res.status(200).json({
                success: true,
                data: profile
            });
        } catch (saveError) {
            console.error('Error saving profile:', saveError);
            // Check for MongoDB validation errors
            if (saveError.name === 'ValidationError') {
                const validationErrors = {};
                for (const field in saveError.errors) {
                    validationErrors[field] = saveError.errors[field].message;
                }
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }
            
            // Check for duplicate key errors (e.g., username already exists)
            if (saveError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'A duplicate entry was found. If you provided a username, it might already be taken.'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Failed to save profile data',
                error: saveError.message
            });
        }
    } catch (error) {
        console.error('Unhandled error in saveProfileData:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}));
// @desc    Check username availability
// @route   GET /api/creators/check-username/:username
// @access  Public
exports.checkUsername = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    // Check if username exists in any creator profile
    const existingProfile = yield CreatorProfile_1.default.findOne({
        'metadata.personalInfo.username': username
    });
    res.json({
        available: !existingProfile,
        message: existingProfile ? 'Username is already in use' : 'Username is available'
    });
}));
// @desc    Publish creator profile
// @route   PUT /api/creators/me/publish
// @access  Private (users with creator role)
exports.publishProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('VERIFICATION CHECKS DISABLED: Publishing profile without validations');
    // Get the profile
    const profile = yield CreatorProfile_1.default.findOne({ userId: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Creator profile not found');
    }
    // Bypass all verifications and directly publish
    profile.status = 'published';
    yield profile.save();
    console.log(`Profile published successfully: ${profile._id}`);
    // Return success response with profile URL
    res.status(200).json({
        success: true,
        data: profile,
        message: "Your creator's page is published successfully!",
        profileUrl: `/creator/${profile._id}`
    });
}));
// @desc    Create a creator profile
// @route   POST /api/creators
// @access  Private (users with creator role)
exports.createCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { overview, pricing, description, requirements, gallery, social, } = req.body;
    // Check if the user already has a creator profile
    const existingProfile = yield CreatorProfile_1.default.findOne({ userId: req.user._id });
    if (existingProfile) {
        res.status(400);
        throw new Error('Creator profile already exists for this user');
    }
    // Create new creator profile
    const creatorProfile = yield CreatorProfile_1.default.create({
        userId: req.user._id,
        overview,
        pricing,
        description,
        requirements: requirements || [],
        gallery: gallery || [],
        social: social || {},
        status: 'draft',
    });
    if (creatorProfile) {
        res.status(201).json(creatorProfile);
    }
    else {
        res.status(400);
        throw new Error('Invalid creator profile data');
    }
}));
// @desc    Get creator profile by ID
// @route   GET /api/creators/:id
// @access  Public
exports.getCreatorProfileById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorProfile = yield CreatorProfile_1.default.findById(req.params.id)
        .populate('userId', 'fullName email avatar');
    if (creatorProfile) {
        res.json(creatorProfile);
    }
    else {
        res.status(404);
        throw new Error('Creator profile not found');
    }
}));
// @desc    Get current user's creator profile
// @route   GET /api/creators/me
// @access  Private
exports.getMyCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorProfile = yield CreatorProfile_1.default.findOne({ userId: req.user._id });
    if (creatorProfile) {
        res.json(creatorProfile);
    }
    else {
        res.status(404);
        throw new Error('Creator profile not found');
    }
}));
// @desc    Update creator profile
// @route   PUT /api/creators/me
// @access  Private
exports.updateCreatorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorProfile = yield CreatorProfile_1.default.findOne({ userId: req.user._id });
    if (!creatorProfile) {
        res.status(404);
        throw new Error('Creator profile not found');
    }
    const { overview, pricing, description, requirements, gallery, social, status, } = req.body;
    if (overview) {
        creatorProfile.overview = Object.assign(Object.assign({}, creatorProfile.overview), overview);
    }
    if (pricing) {
        creatorProfile.pricing = Object.assign(Object.assign({}, creatorProfile.pricing), pricing);
    }
    if (description !== undefined) {
        creatorProfile.description = description;
    }
    if (requirements) {
        creatorProfile.requirements = requirements;
    }
    if (gallery) {
        creatorProfile.gallery = gallery;
    }
    if (social) {
        creatorProfile.social = Object.assign(Object.assign({}, creatorProfile.social), social);
    }
    if (status) {
        creatorProfile.status = status;
    }
    const updatedProfile = yield creatorProfile.save();
    res.json(updatedProfile);
}));
// @desc    Get all creator profiles (with filtering)
// @route   GET /api/creators
// @access  Public
exports.getCreatorProfiles = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.search
        ? {
            $or: [
                { 'overview.title': { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};
    const categoryFilter = req.query.category
        ? { 'overview.category': req.query.category }
        : {};
    const subcategoryFilter = req.query.subcategory
        ? { 'overview.subcategory': req.query.subcategory }
        : {};
    // Only show published profiles to the public
    const statusFilter = { status: 'published' };
    const filter = Object.assign(Object.assign(Object.assign(Object.assign({}, keyword), categoryFilter), subcategoryFilter), statusFilter);
    const count = yield CreatorProfile_1.default.countDocuments(filter);
    const profiles = yield CreatorProfile_1.default.find(filter)
        .populate('userId', 'fullName email avatar')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ rating: -1, createdAt: -1 });
    res.json({
        profiles,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
}));
// @desc    Test creator data insertion
// @route   POST /api/creators/test
// @access  Public
exports.testCreator = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Test creator request received with body:', req.body);
    try {
        // Create a test creator profile
        const creatorProfile = yield CreatorProfile_1.default.create({
            userId: req.body.userId || '65fb1c580d25ab3d940d6d82', // Fallback to a default user ID if not provided
            overview: {
                title: req.body.name || 'Test Creator',
                category: req.body.category || 'Technology',
                subcategory: req.body.subcategory || 'Web Development'
            },
            description: req.body.bio || 'Test bio description',
            rating: req.body.rating || 4.5,
            status: 'published',
            isVerified: true,
            reviews: 1,
            pricing: {
                basic: 50,
                standard: 100,
                premium: 200
            },
            requirements: ['Requirement 1', 'Requirement 2'],
            gallery: []
        });
        console.log('Test creator profile created successfully:', creatorProfile);
        res.status(201).json({
            success: true,
            data: creatorProfile,
            message: 'Test creator profile created successfully!'
        });
    }
    catch (error) {
        console.error('Error creating test creator profile:', error);
        // Handle unique constraint errors
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'This creator profile already exists',
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to create test creator profile',
                error: error.message,
                stack: error.stack
            });
        }
    }
}));
