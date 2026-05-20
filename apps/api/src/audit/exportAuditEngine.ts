import { ExportRisk } from '../security/securityTypes';

export function exportAuditEngine(input: { userId?: string; format: string; recordCount: number; blocked?: boolean }) {
  const exportRisk: ExportRisk = input.blocked ? 'BLOCKED' : input.recordCount > 1000 ? 'RESTRICTED' : input.recordCount > 200 ? 'REVIEW' : 'SAFE';
  return {
    timestamp: new Date().toISOString(),
    userId: input.userId || null,
    format: input.format,
    recordCount: input.recordCount,
    exportRisk,
  };
}
