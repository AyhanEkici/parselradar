import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const admin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
