import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import creditRoutes from './routes/creditRoutes';
import stripeRoutes from './routes/stripeRoutes';
import propertyRoutes from './routes/propertyRoutes';
import documentRoutes from './routes/documentRoutes';
import consentRoutes from './routes/consentRoutes';
import analysisRoutes from './routes/analysisRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import auditRoutes from './routes/auditRoutes';
import cors from 'cors';

dotenv.config({ path: '../../.env' });

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({
  origin: clientUrl,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
});

app.use('/auth', authRoutes);
app.use('/credits', creditRoutes);
app.use('/stripe', stripeRoutes);
app.use('/properties', propertyRoutes);
app.use('/properties', documentRoutes);
app.use('/properties', consentRoutes);
app.use('/analysis', analysisRoutes);
app.use('/reports', reportRoutes);

app.use('/admin', adminRoutes);
app.use('/', auditRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
