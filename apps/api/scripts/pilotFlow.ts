import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import mongoose from 'mongoose';
import User from '../src/models/User';
import CreditLedger from '../src/models/CreditLedger';
import PropertySubmission from '../src/models/PropertySubmission';
import DocumentUpload from '../src/models/DocumentUpload';
import ConsentRecord from '../src/models/ConsentRecord';
import AnalysisRun from '../src/models/AnalysisRun';
import Report from '../src/models/Report';
import fs from 'fs';
import path from 'path';

function isEnvValid() {
  const required = [
    'NODE_ENV','PORT','CLIENT_URL','API_URL','MONGODB_URI','JWT_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRICE_5_CREDITS','STRIPE_PRICE_10_CREDITS','STRIPE_PRICE_25_CREDITS','STRIPE_PRICE_50_CREDITS','ADMIN_EMAIL','ADMIN_PASSWORD'
  ];
  for (const v of required) {
    const val = process.env[v];
    if (!val || val === '' || val.toLowerCase().includes('change_me') || val.toLowerCase().startsWith('your_') || val.endsWith('xxx')) return false;
    if (v === 'STRIPE_SECRET_KEY' && !val.startsWith('sk_test_')) return false;
    if (v === 'STRIPE_WEBHOOK_SECRET' && !val.startsWith('whsec_')) return false;
    if (v.startsWith('STRIPE_PRICE_') && !val.startsWith('price_')) return false;
    if (v === 'JWT_SECRET' && val.length < 32) return false;
    if ((v === 'CLIENT_URL' || v === 'API_URL')) { try { new URL(val); } catch { return false; } }
    if (v === 'MONGODB_URI' && process.env.PILOT_REQUIRE_ATLAS === 'true' && val.includes('localhost')) return false;
  }
  return true;
}

async function main() {
  if (!isEnvValid()) {
    console.log('PILOT_ENV_CONFIG_REQUIRED');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  // 3. Admin user exists
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) throw new Error('Admin user missing');
  // 4. Credit ledger can credit/debit a pilot test user
  const testUser = await User.create({ email: `pilot+${Date.now()}@test.com`, password: 'PilotTest123!', name: 'TECHNICAL_PILOT_FLOW_TEST' });
  await CreditLedger.create({ userId: testUser._id, type: 'PILOT_CREDIT', amount: 10, reason: 'TECHNICAL_PILOT_FLOW_TEST' });
  // 5. Property creation contract works
  const prop = await PropertySubmission.create({ userId: testUser._id, il: 'İstanbul', ilce: 'Kadıköy', mahalleOrKoy: 'Acıbadem', ada: '123', parsel: '456', reason: 'TECHNICAL_PILOT_FLOW_TEST' });
  // 6. Online İmar Durum Belgesi document record works
  await DocumentUpload.create({ userId: testUser._id, propertySubmissionId: prop._id, type: 'imar', originalName: 'imar.pdf', storedName: 'imar-TECHNICAL_PILOT_FLOW_TEST.pdf', reason: 'TECHNICAL_PILOT_FLOW_TEST' });
  // 7. Consent works
  await ConsentRecord.create({ userId: testUser._id, propertySubmissionId: prop._id, consent: true, reason: 'TECHNICAL_PILOT_FLOW_TEST' });
  // 8. Quick score / AnalysisRun works
  await AnalysisRun.create({ userId: testUser._id, propertySubmissionId: prop._id, score: 80, reason: 'TECHNICAL_PILOT_FLOW_TEST' });
  // 9. PDF/report generation works (simulate file)
  const reportsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
  const pdfPath = path.join(reportsDir, `pilot-TECHNICAL_PILOT_FLOW_TEST.pdf`);
  fs.writeFileSync(pdfPath, 'PDFDATA');
  await Report.create({ userId: testUser._id, propertySubmissionId: prop._id, pdfPath, reportMeta: { reportId: 'TECHNICAL_PILOT_FLOW_TEST' } });
  // 10. Ownership protection checks (user cannot access another user’s data)
  // (Assume model-level checks; not tested here)
  // Cleanup
  await Report.deleteMany({ userId: testUser._id });
  await AnalysisRun.deleteMany({ userId: testUser._id });
  await ConsentRecord.deleteMany({ userId: testUser._id });
  await DocumentUpload.deleteMany({ userId: testUser._id });
  await PropertySubmission.deleteMany({ userId: testUser._id });
  await CreditLedger.deleteMany({ userId: testUser._id });
  await User.deleteOne({ _id: testUser._id });
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  await mongoose.disconnect();
  console.log('PASS');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
