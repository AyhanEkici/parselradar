import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: Request, res: Response) => void;
import { AuthRequest } from '../middleware/auth';
export declare const getMe: (req: AuthRequest, res: Response) => Response<any, Record<string, any>> | undefined;
