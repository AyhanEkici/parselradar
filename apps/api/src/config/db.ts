import mongoose from 'mongoose';
import { MONGODB_URI } from './env';

export const connectDB = async () => {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  await mongoose.connect(MONGODB_URI);
};
