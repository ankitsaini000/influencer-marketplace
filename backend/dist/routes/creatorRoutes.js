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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const creatorController = __importStar(require("../controllers/creatorController"));
const router = express_1.default.Router();
// Public routes
router.get('/creators', creatorController.getCreators);
router.get('/creators/:username', creatorController.getPublicCreatorProfile);
router.post('/test', creatorController.testCreator);
router.get('/check-username/:username', creatorController.checkUsername);
// Profile creation routes (requires auth)
router.post('/', auth_1.protect, creatorController.createCreatorProfile);
router.get('/profile-data', auth_1.protect, creatorController.getProfileData);
router.post('/upgrade-role', auth_1.protect, creatorController.upgradeToCreator);
// Creator section update routes (requires creator role)
router.route('/me')
    .get(auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.getMyCreatorProfile)
    .put(auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.updateCreatorProfile);
router.post('/personal-info', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.savePersonalInfo);
router.post('/basic-info', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveBasicInfo);
router.post('/professional-info', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveProfessionalInfo);
router.post('/description', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveDescription);
router.post('/social-info', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveSocialInfo);
router.post('/pricing', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.savePricing);
router.post('/requirements', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveRequirements);
router.post('/gallery', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.saveGallery);
router.post('/publish', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.publishProfile);
router.put('/publish', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.publishProfile);
router.get('/completion-status', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.getCompletionStatus);
// Admin/Debug routes (should be restricted in production)
router.post('/force-complete', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.forceCompleteProfile);
router.post('/emergency-fix', auth_1.protect, (0, auth_1.authorize)('admin'), creatorController.emergencyFixProfile);
router.get('/debug/:userId', auth_1.protect, (0, auth_1.authorize)('admin'), creatorController.debugProfileData);
router.post('/test-gallery', auth_1.protect, (0, auth_1.authorize)('creator'), creatorController.testGalleryStorage);
exports.default = router;
