import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Generate a JWT token
 * @param id User ID (can be string, ObjectId, or unknown)
 * @returns JWT token string
 */
export const generateToken = (id: any): string => {
  // Make sure we're working with a string ID
  const idString = id.toString();
  
  return jwt.sign({ id: idString }, process.env.JWT_SECRET || 'jwtsecret123', {
    expiresIn: '30d',
  });
}; 