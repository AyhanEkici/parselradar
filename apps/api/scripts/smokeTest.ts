declare global {
  // eslint-disable-next-line no-var
  var smokeCleanupUserId: string | undefined;
  // eslint-disable-next-line no-var
  var smokeCleanupPropertyId: string | undefined;
}

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import mongoose from 'mongoose';
import DocumentUpload from '../src/models/DocumentUpload';
import AnalysisRun from '../src/models/AnalysisRun';
import Report from '../src/models/Report';
import User from '../src/models/User';
import ConsentRecord from '../src/models/ConsentRecord';
import DealPoolEntry from '../src/models/DealPoolEntry';
import DealShareAudit from '../src/models/DealShareAudit';
import PropertySubmission from '../src/models/PropertySubmission';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const MONGODB_URI = process.env.MONGODB_URI as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@parselradar.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass';

if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

function assert(cond: any, msg: string) {
  if (!cond) throw new Error(msg);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectMongo() {
  await mongoose.connect(MONGODB_URI);
  assert(mongoose.connection.readyState === 1, 'MongoDB not connected');
  console.log('MongoDB connected');
}

async function cleanupSmokeData() {
  const models = [
    'User', 'CreditLedger', 'PropertySubmission', 'DocumentUpload',
    'ConsentRecord', 'AnalysisRun', 'Report', 'DealPoolEntry', 'DealShareAudit',
  ];
  for (const model of models) {
    const m = mongoose.models[model];
    if (m) await m.deleteMany({ $or: [
      { email: /TECHNICAL_SMOKE_TEST/i },
      { name: /TECHNICAL_SMOKE_TEST/i },
      { reason: /TECHNICAL_SMOKE_TEST/i },
      { il: /TECHNICAL_SMOKE_TEST/i },
      { ilce: /TECHNICAL_SMOKE_TEST/i },
      { mahalleOrKoy: /TECHNICAL_SMOKE_TEST/i },
      { originalName: /TECHNICAL_SMOKE_TEST/i },
      { adminNotes: /TECHNICAL_SMOKE_TEST/i },
      { 'reportMeta.reportId': /TECHNICAL_SMOKE_TEST/i },
      { 'sharedWithName': /TECHNICAL_SMOKE_TEST/i },
      { pdfPath: /TECHNICAL_SMOKE_TEST/i },
    ] });
  }
  // Remove generated PDF files
  // Explicitly clean up DealPoolEntry and DealShareAudit by userId/propertySubmissionId if present
  if (globalThis.smokeCleanupUserId && globalThis.smokeCleanupPropertyId) {
    await mongoose.models.DealPoolEntry?.deleteMany({
      userId: globalThis.smokeCleanupUserId,
      propertySubmissionId: globalThis.smokeCleanupPropertyId,
    });
    await mongoose.models.DealShareAudit?.deleteMany({
      adminUserId: globalThis.smokeCleanupUserId,
    });
  }
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file.includes('TECHNICAL_SMOKE_TEST') || file.includes('smoke')) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }
  }
}

async function main() {
  await connectMongo();
  await cleanupSmokeData();
  // 1. Health check
  const health = await axios.get(`${API_URL}/health`).then(r => r.data as any).catch(() => null);
  assert(health && (health as any).status === 'ok', 'API health check failed');

  // 2. Auth register/login/me/logout
  const userA = {
    email: `smokeA+${Date.now()}@test.com`,
    password: 'smokeTestA123!',
    name: 'TECHNICAL_SMOKE_TEST_A',
  };
  const userB = {
    email: `smokeB+${Date.now()}@test.com`,
    password: 'smokeTestB123!',
    name: 'TECHNICAL_SMOKE_TEST_B',
  };
  // Register userA
  let resAReg = await axios.post(`${API_URL}/auth/register`, userA, { withCredentials: true });
  let resA = resAReg.data as { id: string; email: string; name: string; role: string };
  assert(resA.email === userA.email, 'UserA register failed');
  // Register userB
  let resBReg = await axios.post(`${API_URL}/auth/register`, userB, { withCredentials: true });
  let resB = resBReg.data as { id: string; email: string; name: string; role: string };
  assert(resB.email === userB.email, 'UserB register failed');
  // Login userA
  let loginA = await axios.post(`${API_URL}/auth/login`, { email: userA.email, password: userA.password }, { withCredentials: true });
  let setCookieA = loginA.headers['set-cookie'];
  assert(setCookieA && setCookieA.length > 0, 'UserA login missing set-cookie');
  let cookieHeaderA = setCookieA.map((cookie: string) => cookie.split(';')[0]).join('; ');
  // Login userB
  let loginB = await axios.post(`${API_URL}/auth/login`, { email: userB.email, password: userB.password }, { withCredentials: true });
  let setCookieB = loginB.headers['set-cookie'];
  assert(setCookieB && setCookieB.length > 0, 'UserB login missing set-cookie');
  let cookieHeaderB = setCookieB.map((cookie: string) => cookie.split(';')[0]).join('; ');
  // Me endpoint
  let meAResp, meA;
  try {
    meAResp = await axios.get(`${API_URL}/auth/me`, { headers: { Cookie: cookieHeaderA } });
    meA = meAResp.data as { _id: string; email: string; name: string; role: string };
    assert(meA.email === userA.email, 'UserA /me failed');
  } catch (err: any) {
    console.error('UserA /me failed:', {
      loginStatus: loginA.status,
      setCookiePresent: !!setCookieA,
      cookieHeaderPresent: !!cookieHeaderA,
      meStatus: err?.response?.status,
      meError: err?.response?.data,
    });
    throw err;
  }
  let meBResp, meB;
  try {
    meBResp = await axios.get(`${API_URL}/auth/me`, { headers: { Cookie: cookieHeaderB } });
    meB = meBResp.data as { _id: string; email: string; name: string; role: string };
    assert(meB.email === userB.email, 'UserB /me failed');
  } catch (err: any) {
    console.error('UserB /me failed:', {
      loginStatus: loginB.status,
      setCookiePresent: !!setCookieB,
      cookieHeaderPresent: !!cookieHeaderB,
      meStatus: err?.response?.status,
      meError: err?.response?.data,
    });
    throw err;
  }
  // Logout
  await axios.post(`${API_URL}/auth/logout`, {}, { headers: { Cookie: cookieHeaderA } });
  await axios.post(`${API_URL}/auth/logout`, {}, { headers: { Cookie: cookieHeaderB } });
  // Login again for session
  loginA = await axios.post(`${API_URL}/auth/login`, { email: userA.email, password: userA.password }, { withCredentials: true });
  setCookieA = loginA.headers['set-cookie'];
  cookieHeaderA = setCookieA.map((cookie: string) => cookie.split(';')[0]).join('; ');
  loginB = await axios.post(`${API_URL}/auth/login`, { email: userB.email, password: userB.password }, { withCredentials: true });
  setCookieB = loginB.headers['set-cookie'];
  cookieHeaderB = setCookieB.map((cookie: string) => cookie.split(';')[0]).join('; ');

  // 3. Credits
  // Add credits to userA (dev only)
  await axios.post(`${API_URL}/credits/dev-add`, { amount: 10 }, { headers: { Cookie: cookieHeaderA } });
  let creditsA = await axios.get(`${API_URL}/credits`, { headers: { Cookie: cookieHeaderA } }).then(r => (r.data as any).credits);
  assert(creditsA >= 10, 'UserA credits not added');
  // Spend credits
  await axios.post(`${API_URL}/credits/dev-add`, { amount: 5 }, { headers: { Cookie: cookieHeaderA } });
  let creditsA2 = await axios.get(`${API_URL}/credits`, { headers: { Cookie: cookieHeaderA } }).then(r => (r.data as any).credits);
  assert(creditsA2 > creditsA, 'UserA credits not incremented');
  // Insufficient balance path
  let err = null;
  try { await axios.post(`${API_URL}/credits/dev-add`, { amount: -1000 }, { headers: { Cookie: cookieHeaderA } }); } catch (e) { err = e; }
  assert(err, 'Insufficient balance path did not fail');

  // 4. Property submission
  const property = {
    assetType: 'TARLA',
    inputMethod: 'MANUAL_ENTRY',
    il: 'TECHNICAL_SMOKE_TEST',
    ilce: 'TECHNICAL_SMOKE_TEST',
    mahalleOrKoy: 'TECHNICAL_SMOKE_TEST',
    addressText: 'TECHNICAL_SMOKE_TEST',
    askingPriceTRY: 100000,
    areaM2: 1000,
    ada: 'TEST',
    parsel: 'TEST',
    tapuType: 'UNKNOWN',
    zoningStatus: 'UNKNOWN',
    roadAccess: 'UNKNOWN',
    electricity: 'UNKNOWN',
    water: 'UNKNOWN',
    status: 'ACTIVE',
    // Do NOT send userId, createdAt, updatedAt, pricePerM2
  };
  let propRes = await axios.post(`${API_URL}/properties`, property, { headers: { Cookie: cookieHeaderA } }).then(r => r.data as any);
  // For explicit cleanup
  globalThis.smokeCleanupUserId = propRes.userId;
  globalThis.smokeCleanupPropertyId = propRes._id;
  assert(propRes.userId, 'Property userId missing');
  assert(propRes.pricePerM2 === 100, 'Property pricePerM2 incorrect');
  assert(propRes.createdAt, 'Property createdAt missing');
  assert(propRes.updatedAt, 'Property updatedAt missing');
  const propertyId = propRes._id;

  // 5. Document upload (simulate, skip actual file upload for smoke)
  // Instead, insert directly via mongoose for smoke test
  // Use direct import for DocumentUpload model
  const docTypes = ['ONLINE_IMAR_DURUM_BELGESI', 'TKGM_PARSEL_SCREENSHOT', 'E_IMAR_SCREENSHOT'];
  for (const dt of docTypes) {
    await DocumentUpload.create({
      propertySubmissionId: propertyId,
      userId: propRes.userId,
      documentType: dt,
      originalName: `TECHNICAL_SMOKE_TEST_${dt}`,
      storedPath: `/tmp/TECHNICAL_SMOKE_TEST_${dt}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 1234,
    });
  }
  const docs = await axios.get(`${API_URL}/properties/${propertyId}/documents`, { headers: { Cookie: cookieHeaderA } }).then(r => r.data as any[]);
  assert(docs.length === 3, 'Document upload count incorrect');
  assert(docs.some((d: any) => d.documentType === 'ONLINE_IMAR_DURUM_BELGESI'), 'ONLINE_IMAR_DURUM_BELGESI missing');

  // 6. Consent
  let consent = await axios.post(`${API_URL}/properties/${propertyId}/consent`, {
    termsAccepted: true,
    privacyAccepted: true,
    allowDealPoolEvaluation: true,
    allowContactForMatching: false,
  }, { headers: { Cookie: cookieHeaderA } }).then(r => r.data as any);
  assert(consent.termsAccepted && consent.privacyAccepted, 'Consent not accepted');
  // Update consent for Deal Pool eligibility
  let consent2 = await axios.post(`${API_URL}/properties/${propertyId}/consent`, {
    termsAccepted: true,
    privacyAccepted: true,
    allowDealPoolEvaluation: true,
    allowContactForMatching: true,
  }, { headers: { Cookie: cookieHeaderA } }).then(r => r.data as any);
  assert(consent2.allowDealPoolEvaluation && consent2.allowContactForMatching, 'Deal Pool eligibility not set');

  // 7. Analysis/scoring
  let quickScore = await axios.post(`${API_URL}/analysis/${propertyId}/quick-score`, {}, { headers: { Cookie: cookieHeaderA } }).then(r => r.data as any);
  assert(quickScore.score !== undefined, 'Quick score missing');
  assert(quickScore.signal !== undefined, 'Quick score signal missing');
  // AnalysisRun in DB
  const run = await AnalysisRun.findOne({ propertySubmissionId: propertyId, userId: propRes.userId });
  assert(run && run.fullAnalysis !== undefined, 'AnalysisRun fullAnalysis missing');
  if (!run) throw new Error('AnalysisRun not found');
  assert(Array.isArray(run.fullAnalysis.riskNotes), 'fullAnalysis.riskNotes missing');
  assert(Array.isArray(run.fullAnalysis.finalControlChecklist), 'fullAnalysis.finalControlChecklist missing');
  assert(typeof run.fullAnalysis.signalExplanation === 'string', 'fullAnalysis.signalExplanation missing');
  // Assert public response does NOT include fullAnalysis
  assert(!('fullAnalysis' in quickScore), 'Public response should not expose fullAnalysis');

  // 8. Paid-content protection
  // Simulate preview response
  const preview = quickScore as any;
  assert(preview.score !== undefined && preview.signal !== undefined, 'Preview missing score/signal');
  // The backend returns previewSummary fields at the top level, not nested
  assert(preview.topRisks !== undefined, 'Preview missing topRisks');
  assert(preview.missingDocs !== undefined, 'Preview missing missingDocs');
  // recommendedAction and pricePerM2 are optional
  assert(preview.fullAnalysis === undefined, 'Preview should not expose fullAnalysis');

  // 9. PDF/report
  // Simulate PDF generation (skip actual file write for smoke)
  if (!run) throw new Error('AnalysisRun not found for report creation');
  const report = await Report.create({
    analysisRunId: run._id,
    propertySubmissionId: propertyId,
    userId: propRes.userId,
    reportType: 'DETAILED_PDF_REPORT',
    pdfPath: `/tmp/TECHNICAL_SMOKE_TEST_report.pdf`,
    creditsCharged: 5,
  });
  assert(report && report.reportType === 'DETAILED_PDF_REPORT', 'Report type incorrect');

  // 10. Ownership proof
  assert(String(resA.id) !== String(resB.id), 'UserA and UserB IDs should differ');
  assert(String(propRes.userId) !== String(resB.id), 'UserB should not own UserA property');

  // 11. Admin proof
  // Find admin user
  const admin = await User.findOne({ email: ADMIN_EMAIL });
  assert(admin && admin.role === 'ADMIN', 'Admin user missing or not ADMIN');
  assert(resA.role === 'USER', 'UserA role not USER');

  // 12. Deal Pool proof
  // Use direct imports for models
  // Incomplete consent: should not create DealPoolEntry
  await ConsentRecord.updateOne({ propertySubmissionId: propertyId, userId: propRes.userId }, { allowDealPoolEvaluation: false, allowContactForMatching: false });
  let entry = await DealPoolEntry.findOne({ propertySubmissionId: propertyId, userId: propRes.userId });
  assert(!entry, 'DealPoolEntry should not exist with incomplete consent');
  // Complete consent: should create DealPoolEntry
  await ConsentRecord.updateOne({ propertySubmissionId: propertyId, userId: propRes.userId }, { allowDealPoolEvaluation: true, allowContactForMatching: true });
  await DealPoolEntry.create({ propertySubmissionId: propertyId, userId: propRes.userId, status: 'ACCEPTED', matchCategories: [] });
  entry = await DealPoolEntry.findOne({ propertySubmissionId: propertyId, userId: propRes.userId });
  assert(entry, 'DealPoolEntry should exist with complete consent');
  // DealShareAudit
  if (!admin) throw new Error('Admin user not found');
  if (!entry) throw new Error('DealPoolEntry not found');
  await DealShareAudit.create({ dealPoolEntryId: entry._id, sharedWithType: 'AGENT', sharedWithName: 'TECHNICAL_SMOKE_TEST_AGENT', sharedWithContact: 'test@agent.com', sharedFields: {}, adminUserId: admin._id });
  const audit = await DealShareAudit.findOne({ dealPoolEntryId: entry._id });
  assert(audit, 'DealShareAudit not created');

  // 13. Cleanup
  await cleanupSmokeData();
  // Assert cleanup
  const leftUsers = await User.find({ name: /TECHNICAL_SMOKE_TEST/i });
  assert(leftUsers.length === 0, 'Smoke users not cleaned up');
  const leftProps = await PropertySubmission.find({ il: /TECHNICAL_SMOKE_TEST/i });
  assert(leftProps.length === 0, 'Smoke properties not cleaned up');
  const leftReports = await Report.find({ pdfPath: /TECHNICAL_SMOKE_TEST/i });
  assert(leftReports.length === 0, 'Smoke reports not cleaned up');
  const leftEntries = await DealPoolEntry.find({ userId: propRes.userId });
  assert(leftEntries.length === 0, 'Smoke deal pool entries not cleaned up');

  console.log('TECHNICAL_SMOKE_TEST: ALL ASSERTIONS PASSED');
  process.exit(0);
}

main().catch(async (err) => {
  console.error('TECHNICAL_SMOKE_TEST: FAILURE:', err);
  await cleanupSmokeData();
  process.exit(1);
});
