import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content?: string;
  attachments?: string[];
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Conversation'
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    content: {
      type: String
    },
    attachments: [{
      type: String
    }],
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
messageSchema.index({ conversation: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ sentAt: -1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message; 