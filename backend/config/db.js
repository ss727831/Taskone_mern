import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    console.log('Attempting to connect to configured MongoDB database...');
    // Try to connect with a short 3-second timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Standard MongoDB connection failed: ${error.message}`);
    console.log('Starting local In-Memory MongoDB Server as a zero-config fallback...');
    
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Started and Connected: ${conn.connection.host}`);
      console.log('No local MongoDB installation required! Data will persist for this session.');
    } catch (memError) {
      console.error(`Failed to start In-Memory MongoDB fallback: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
