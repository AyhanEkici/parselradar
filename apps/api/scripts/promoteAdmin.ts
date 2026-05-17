import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI as string;
const email = process.argv[2];

if (!MONGODB_URI || !email) {
  console.error('Usage: ts-node scripts/promoteAdmin.ts <email>');
  process.exit(1);
}

async function promoteAdmin() {
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  user.role = 'ADMIN';
  await user.save();
  console.log(`Promoted admin: ${email}, role ADMIN`);
  process.exit(0);
}

promoteAdmin();
