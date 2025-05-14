import mongoose, { Schema, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  password?: string;
  fullName: string;
  username?: string;
  avatar?: string;
  role: 'client' | 'creator' | 'admin' | 'brand';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  facebookId?: string;
  createdAt: Date;
  updatedAt: Date;
  isValidPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function() {
        // Only require password if there's no Facebook ID
        return !this.facebookId;
      },
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['client', 'creator', 'admin', 'brand'],
      default: 'client',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (!user.isModified('passwordHash') || !user.passwordHash) return next();

  try {
    const hashed = await hash(user.passwordHash, 10);
    user.passwordHash = hashed;
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method to check password
userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
  try {
    // If user has no password (Facebook auth only), return false
    if (!this.passwordHash) return false;
    return await compare(password, this.passwordHash);
  } catch (err) {
    console.error('Password validation failed:', err);
    return false;
  }
};

// Remove sensitive fields from JSON response
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

// Add this after your schema definition but before creating the model
// This adds a virtual password field that sets the passwordHash
userSchema.virtual('password')
  .set(function(password: string) {
    this.passwordHash = password;
    // The pre-save hook will hash this before saving
  });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
