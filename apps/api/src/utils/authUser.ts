import { AuthRequest } from '../middleware/auth';
import { HttpError } from './httpError';

export function requireAuthUser(req: AuthRequest) {
  if (!req.user) throw new HttpError('Yetkisiz', 401);
  return req.user;
}
