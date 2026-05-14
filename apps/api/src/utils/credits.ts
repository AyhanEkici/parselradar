import CreditLedger from '../models/CreditLedger';
import mongoose from 'mongoose';

export async function getUserCredits(userId: mongoose.Types.ObjectId | string) {
  const id = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const result = await CreditLedger.aggregate([
    { $match: { userId: id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}
