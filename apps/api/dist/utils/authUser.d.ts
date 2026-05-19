import { AuthRequest } from '../middleware/auth';
export declare function requireAuthUser(req: AuthRequest): {
    _id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
};
