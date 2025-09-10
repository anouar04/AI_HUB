import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is not defined in the environment variables');
      // Fix: Use type assertion to bypass incorrect type definition for process.exit.
      (process as any).exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(err.message);
    // Exit process with failure
    // Fix: Use type assertion to bypass incorrect type definition for process.exit.
    (process as any).exit(1);
  }
};

export default connectDB;