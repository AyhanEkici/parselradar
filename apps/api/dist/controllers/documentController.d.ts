import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadDocument: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDocuments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
