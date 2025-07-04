import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: Types.ObjectId;
        email: string;
        fullName: string;
        role: string;
        [key: string]: any;
      };
    }
  }
} 