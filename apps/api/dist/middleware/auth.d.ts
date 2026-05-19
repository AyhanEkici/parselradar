import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        _id: string;
        email: string;
        name: string;
        role: 'USER' | 'ADMIN';
    };
}
export declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
