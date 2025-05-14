import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes - verify token and set user in req.user
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  // Check if auth header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Creator only middleware
export const creatorOnly = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'creator') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized, creator access only');
  }
});

// Admin only middleware
export const adminOnly = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized, admin access only');
  }
}); 