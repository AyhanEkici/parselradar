import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createCheckoutSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const stripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
