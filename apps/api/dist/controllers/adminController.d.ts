import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAllProperties: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPropertyById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reviewProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptDealPool: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const shareDealPool: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
