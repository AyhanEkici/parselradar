import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const quickScore: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const parselInsight: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const developerFit: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
