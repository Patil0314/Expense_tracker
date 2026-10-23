const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection string from environment variables.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
    
    const conn = await mongoose.connect(uri);

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
