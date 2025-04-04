import mongoose, { Schema, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  avatar?: string;
  role: 'user' | 'creator' | 'admin';
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
      trim: true 
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    fullName: { 
      type: String, 
      required: [true, 'Full name is required'] 
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    avatar: { 
      type: String,
      default: null
    },
    role: { 
      type: String, 
      enum: {
        values: ['user', 'creator', 'admin'],
        message: '{VALUE} is not a valid role'
      }, 
      default: 'user' 
    },
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate a salt and hash the password
    const hashedPassword = await hash(user.password, 10);
    user.password = hashedPassword;
    next();
  } catch (error: any) {
    return next(error);
  }
});

// Method to check if password is valid
userSchema.methods.isValidPassword = async function(password: string): Promise<boolean> {
  try {
    return await compare(password, this.password);
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
};

// Don't send the password back when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User; 