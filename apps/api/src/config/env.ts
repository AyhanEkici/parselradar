import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLIENT_URL',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
    throw new Error(
        `Missing required environment variables: ${missing.join(', ')}.\nCheck your .env file and deployment configuration.`
    );
}

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET!,
    MONGODB_URI: process.env.MONGODB_URI!,
    CLIENT_URL: process.env.CLIENT_URL!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_LIVE_SECRET_KEY: process.env.STRIPE_LIVE_SECRET_KEY || '',
    STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_PRICE_25_CREDITS: process.env.STRIPE_PRICE_25_CREDITS || '',
    STRIPE_PRICE_50_CREDITS: process.env.STRIPE_PRICE_50_CREDITS || '',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    PORT: process.env.PORT || '4000',
    API_URL: process.env.API_URL || '',
};

export const {
    NODE_ENV,
    JWT_SECRET,
    MONGODB_URI,
    CLIENT_URL,
    API_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    PORT
} = ENV;
