import express from 'express';
import { facebookCallback, facebookLogin } from '../controllers/facebookController';

const router = express.Router();

// Route to initiate Facebook login
router.get('/login', facebookLogin);

// Callback route that Facebook will redirect to
router.get('/callback', facebookCallback);

export default router;
