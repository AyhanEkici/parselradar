import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const submitConsent: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
