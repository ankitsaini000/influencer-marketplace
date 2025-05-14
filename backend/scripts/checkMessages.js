const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Define Message schema
const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId },
  receiverId: { type: mongoose.Schema.Types.ObjectId },
  content: String,
  isRead: Boolean,
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}, { strict: false });  // strict: false allows us to query without defining all fields

const Message = mongoose.model('Message', MessageSchema);

// Define User schema to populate sender/receiver info
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function checkMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Get the 5 most recent messages
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n====== RECENT MESSAGES ======');
    
    if (messages.length === 0) {
      console.log('No messages found in the database.');
    } else {
      // For each message, look up the sender and receiver
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        // Fetch sender and receiver info
        let sender = null;
        let receiver = null;
        
        try {
          sender = await User.findById(message.senderId);
        } catch (e) {
          console.log(`Could not find sender with ID: ${message.senderId}`);
        }
        
        try {
          receiver = await User.findById(message.receiverId);
        } catch (e) {
          console.log(`Could not find receiver with ID: ${message.receiverId}`);
        }
        
        console.log(`\nMessage ${i + 1}:`);
        console.log(`  ID:        ${message._id}`);
        console.log(`  Content:   ${message.content}`);
        console.log(`  From:      ${sender ? (sender.name || sender.email || 'Unknown') : 'Unknown'} (ID: ${message.senderId})`);
        console.log(`  To:        ${receiver ? (receiver.name || receiver.email || 'Unknown') : 'Unknown'} (ID: ${message.receiverId})`);
        console.log(`  Read:      ${message.isRead ? 'Yes' : 'No'}`);
        console.log(`  Sent at:   ${message.createdAt}`);
        
        if (message.attachments && message.attachments.length > 0) {
          console.log(`  Attachments: ${message.attachments.length}`);
        }
      }
    }
  } catch (error) {
    console.error('Error connecting to MongoDB or fetching messages:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkMessages(); 