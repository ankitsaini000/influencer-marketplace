const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Define a simple User schema to query the database
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
}, { strict: false });  // strict: false allows us to query all fields without defining them

const User = mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Get all users and display relevant information
    const users = await User.find({}, '_id name email role username').limit(10);
    
    console.log('\n====== USERS FOR TESTING ======');
    console.log('Copy a user ID to use for testing the message API\n');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID:       ${user._id}`);
        console.log(`  Name:     ${user.name || 'N/A'}`);
        console.log(`  Email:    ${user.email || 'N/A'}`);
        console.log(`  Username: ${user.username || 'N/A'}`);
        console.log(`  Role:     ${user.role || 'N/A'}`);
        console.log('');
      });
      
      console.log('Use one of these IDs as the "receiverId" in your test.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
listUsers(); 