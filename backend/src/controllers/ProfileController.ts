import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CreatorProfile, ICreatorProfile } from '../models/CreatorProfile';
import BrandProfile from '../models/BrandProfile';
import User from '../models/User';
import fs from 'fs';
import path from 'path';
import { uploadFile, deleteFile } from '../utils/fileStorage';

class ProfileController {
  // Update Creator Profile
  async updateCreatorProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user exists and is a creator
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== 'creator') {
        return res.status(403).json({ message: 'Only creators can update creator profiles' });
      }

      // Check if profile exists
      let profile = await CreatorProfile.findOne({ userId });

      if (profile) {
        // Update existing profile
        profile = await CreatorProfile.findOneAndUpdate(
          { userId },
          { ...req.body },
          { new: true, runValidators: true }
        );
      } else {
        // Create new profile
        profile = await CreatorProfile.create({
          userId,
          ...req.body
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error updating creator profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not update creator profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update Brand Profile
  async updateBrandProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user exists and is a brand
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== 'brand') {
        return res.status(403).json({ message: 'Only brands can update brand profiles' });
      }

      // Check if profile exists
      let profile = await BrandProfile.findOne({ userId });

      if (profile) {
        // Update existing profile
        profile = await BrandProfile.findOneAndUpdate(
          { userId },
          { ...req.body },
          { new: true, runValidators: true }
        );
      } else {
        // Create new profile
        profile = await BrandProfile.create({
          userId,
          ...req.body
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error updating brand profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not update brand profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get Creator Profile by userId
  async getCreatorProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const profile = await CreatorProfile.findOne({ userId }).populate('userId', 'username email');

      if (!profile) {
        return res.status(404).json({ message: 'Creator profile not found' });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not fetch creator profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get Brand Profile by userId
  async getBrandProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const profile = await BrandProfile.findOne({ userId }).populate('userId', 'username email');

      if (!profile) {
        return res.status(404).json({ message: 'Brand profile not found' });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not fetch brand profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get current user's profile (works for both creator and brand)
  async getCurrentUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let profile;
      if (user.role === 'creator') {
        profile = await CreatorProfile.findOne({ userId });
      } else if (user.role === 'brand') {
        profile = await BrandProfile.findOne({ userId });
      } else {
        return res.status(400).json({ message: 'User does not have a valid role' });
      }

      if (!profile) {
        return res.status(404).json({ 
          success: false,
          message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} profile not found` 
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload profile image
  async uploadProfileImage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { imageType } = req.body; // 'profile' or 'cover'

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      if (!['profile', 'cover'].includes(imageType)) {
        return res.status(400).json({ message: 'Invalid image type. Must be "profile" or "cover"' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Upload the file to storage
      const imageUrl = await uploadFile(req.file, `profiles/${userId}`);

      // Update the appropriate profile
      let profile;
      const updateField = imageType === 'profile' ? 'profileImage' : 'coverImage';

      if (user.role === 'creator') {
        profile = await CreatorProfile.findOneAndUpdate(
          { userId },
          { [updateField]: imageUrl },
          { new: true }
        );
        
        if (!profile) {
          profile = await CreatorProfile.create({
            userId,
            [updateField]: imageUrl
          });
        }
      } else if (user.role === 'brand') {
        profile = await BrandProfile.findOneAndUpdate(
          { userId },
          { [updateField]: imageUrl },
          { new: true }
        );
        
        if (!profile) {
          profile = await BrandProfile.create({
            userId,
            [updateField]: imageUrl
          });
        }
      } else {
        return res.status(400).json({ message: 'User does not have a valid role' });
      }

      return res.status(200).json({
        success: true,
        data: {
          imageUrl,
          profile
        }
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not upload profile image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete profile
  async deleteProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let deletedProfile;
      if (user.role === 'creator') {
        deletedProfile = await CreatorProfile.findOneAndDelete({ userId });
      } else if (user.role === 'brand') {
        deletedProfile = await BrandProfile.findOneAndDelete({ userId });
      } else {
        return res.status(400).json({ message: 'User does not have a valid role' });
      }

      if (!deletedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not delete profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new ProfileController(); 