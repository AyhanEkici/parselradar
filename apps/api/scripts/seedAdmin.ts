import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import bcrypt from 'bcrypt';

dotenv.config({ path: '../../.env' });


const MONGODB_URI = process.env.MONGODB_URI as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const ADMIN_RESET_MODE = String(process.env.ADMIN_RESET_MODE || '').trim().toLowerCase() === 'true';

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required env vars.');
  process.exit(1);
}

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  let result = await User.findOne({ email: ADMIN_EMAIL });
  if (!result) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    result = await User.create({
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    });
    console.log('Admin user created.');
    process.exit(0);
  }

  const passwordMatches = await bcrypt.compare(ADMIN_PASSWORD, String(result.passwordHash || ''));
  if (!passwordMatches && ADMIN_RESET_MODE) {
    result.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  }
  result.name = 'Admin';
  result.role = 'ADMIN';
  await result.save();

  if (result) {
    if (passwordMatches) {
      console.log('Admin user verified.');
    } else if (ADMIN_RESET_MODE) {
      console.log('Admin user reset.');
    } else {
      console.log('Admin user exists with different passwordHash; reset skipped (ADMIN_RESET_MODE=false).');
    }
  }
  process.exit(0);
}

seedAdmin();
