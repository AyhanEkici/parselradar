import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import bcrypt from 'bcrypt';

dotenv.config({ path: '../../.env' });


const MONGODB_URI = process.env.MONGODB_URI as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required env vars.');
  process.exit(1);
}

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        passwordHash,
        name: 'Admin',
        role: 'ADMIN',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (result) {
    if (result.passwordHash === passwordHash) {
      console.log('Admin user reset.');
    } else {
      console.log('Admin user created.');
    }
  }
  process.exit(0);
}

seedAdmin();
