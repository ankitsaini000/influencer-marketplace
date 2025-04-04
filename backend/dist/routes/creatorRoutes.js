"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creatorController_1 = require("../controllers/creatorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post('/test', creatorController_1.testCreator);
router.get('/check-username/:username', creatorController_1.checkUsername);
router.get('/', creatorController_1.getCreatorProfiles);
router.get('/:id', creatorController_1.getCreatorProfileById);
// Profile creation flow routes - all require creator role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('creator'));
router.route('/me')
    .get(creatorController_1.getMyCreatorProfile)
    .put(creatorController_1.updateCreatorProfile);
router.post('/', creatorController_1.createCreatorProfile);
router.post('/personal-info', creatorController_1.savePersonalInfo);
router.post('/professional-info', creatorController_1.saveProfessionalInfo);
router.post('/account-security', creatorController_1.saveAccountSecurity);
router.post('/overview', creatorController_1.saveProfileOverview);
router.post('/pricing', creatorController_1.savePricing);
router.post('/description', creatorController_1.saveDescription);
router.post('/requirements', creatorController_1.saveRequirements);
router.post('/gallery', creatorController_1.saveGallery);
router.post('/social-info', creatorController_1.saveSocialInfo);
router.post('/profile-data', creatorController_1.saveProfileData);
router.put('/me/publish', creatorController_1.publishProfile);
exports.default = router;
