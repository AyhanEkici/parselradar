import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProperties: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
