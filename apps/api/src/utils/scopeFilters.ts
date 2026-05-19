import { buildOwnerScopedFilter } from './ownership';

type Actor = { _id?: unknown; id?: unknown; role?: string } | null | undefined;

export function propertyOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function analysisOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function reportOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function documentOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function portfolioOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function watchlistOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function notificationOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}

export function alertOwnerScope(user: Actor, baseFilter: Record<string, any> = {}) {
  return buildOwnerScopedFilter(user, baseFilter);
}
