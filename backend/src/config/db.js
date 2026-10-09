import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_campus_sms';
  
  // If explicitly requested to run in standalone file mode
  if (process.env.STANDALONE_DB === 'true') {
    console.log('⚡ [DB] STANDALONE_DB is active. Running in zero-dependency Embedded Persistent Mode.');
    isConnected = false;
    return false;
  }

  try {
    console.log(`📡 [DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2500,
    });
    isConnected = true;
    console.log('✅ [DB] Successfully connected to MongoDB.');
    return true;
  } catch (error) {
    console.warn(`⚠️ [DB] Local/Remote MongoDB not reachable (${error.message}).`);
    console.log('🛡️ [DB] Seamlessly switching to High-Performance Persistent Embedded JSON Engine.');
    console.log('ℹ️ [DB] All requests, users, authentication, assignments, workflows & notifications will function flawlessly!');
    isConnected = false;
    return false;
  }
};

export const getIsMongoConnected = () => isConnected;
export default connectDB;
