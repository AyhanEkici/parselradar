import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const purchasePDF: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getReports: (req: AuthRequest, res: Response) => Promise<void>;
export declare const downloadReport: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
