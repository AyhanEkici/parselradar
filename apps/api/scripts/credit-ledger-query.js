import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/parselradar';
const userId = '6a07c1a036e0788f7eb38945';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const CreditLedger = mongoose.connection.collection('creditledgers');
  const rows = await CreditLedger.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ $natural: -1 }).limit(5).toArray();
  console.log(JSON.stringify(rows, null, 2));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
