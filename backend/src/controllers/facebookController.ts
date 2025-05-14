import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Facebook authentication callback handler
export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile information
    const profileResponse = await axios.get(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: 'id,name,email,picture',
          access_token,
        },
      }
    );

    const { id: facebookId, name, email, picture } = profileResponse.data;

    // Find or create user
    let user = await User.findOne({ facebookId });

    if (!user && email) {
      // Check if a user with this email already exists
      user = await User.findOne({ email });
      
      if (user) {
        // Link Facebook account to existing user
        user.facebookId = facebookId;
        await user.save();
      }
    }

    // If no user exists, create a new one
    if (!user) {
      user = await User.create({
        email: email || `fb_${facebookId}@placeholder.com`,
        fullName: name,
        facebookId,
        avatar: picture?.data?.url,
        isVerified: true, // Auto-verify Facebook users
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/facebook-success?token=${token}`
    );
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`);
  }
};

// Facebook login initiation
export const facebookLogin = (req: Request, res: Response) => {
  const redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=email,public_profile`;
  res.json({ redirectUrl });
}; 