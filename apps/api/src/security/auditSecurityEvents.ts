import { SecuritySignal } from '../runtime/runtimeState';

type SecurityAuditRecord = {
  at: string;
  source: string;
  signal: SecuritySignal;
};

const securityAuditLog: SecurityAuditRecord[] = [];

export function auditSecurityEvents(source: string, signals: SecuritySignal[]) {
  const now = new Date().toISOString();
  signals.forEach((signal) => {
    securityAuditLog.unshift({ at: now, source, signal });
  });
  if (securityAuditLog.length > 200) {
    securityAuditLog.length = 200;
  }
  return securityAuditLog.slice(0, 50);
}

export function getSecurityAuditEvents() {
  return securityAuditLog.slice(0, 50);
}
