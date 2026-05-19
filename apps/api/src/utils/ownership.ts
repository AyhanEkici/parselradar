import { HttpError } from './httpError';

function normalizeId(value: unknown) {
  if (!value) return '';
  return String((value as any)?._id || value);
}

export function isAdmin(user?: { role?: string } | null) {
  return String(user?.role || '').toUpperCase() === 'ADMIN';
}

export function getUserId(user?: { _id?: unknown; id?: unknown } | null) {
  return normalizeId(user?._id || user?.id);
}

export function requireOwnerOrAdmin(resourceOwnerId: unknown, user?: { _id?: unknown; id?: unknown; role?: string } | null) {
  const ownerId = normalizeId(resourceOwnerId);
  const actorId = getUserId(user);
  if (isAdmin(user)) return true;
  if (ownerId && actorId && ownerId === actorId) return true;
  throw new HttpError('Forbidden', 403);
}

export function buildOwnerScopedFilter<T extends Record<string, any>>(user?: { _id?: unknown; id?: unknown; role?: string } | null, baseFilter: T = {} as T): T {
  if (isAdmin(user)) return { ...baseFilter };
  return { ...baseFilter, userId: getUserId(user) };
}

export function assertOwnerOrAdmin(resource: { userId?: unknown; ownerId?: unknown } | null | undefined, user?: { _id?: unknown; id?: unknown; role?: string } | null) {
  if (!resource) throw new HttpError('Not Found', 404);
  const owner = resource.userId || resource.ownerId;
  return requireOwnerOrAdmin(owner, user);
}

export function assertAdmin(user?: { role?: string } | null) {
  if (isAdmin(user)) return true;
  throw new HttpError('Forbidden', 403);
}
