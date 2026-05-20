import { UploadRisk } from './securityTypes';

export function uploadGovernanceEngine(input: { mimeType: string; sizeBytes: number; extension: string; malwareSignals: number }) {
  const riskyMime = /application\/x-msdownload|application\/x-dosexec|application\/javascript/i.test(input.mimeType);
  const oversized = input.sizeBytes > 25 * 1024 * 1024;
  const risk: UploadRisk =
    input.malwareSignals > 0 || riskyMime ? 'DANGEROUS' :
    oversized ? 'SUSPICIOUS' :
    'CLEAN';

  return {
    risk,
    blocked: risk === 'DANGEROUS',
    requiresReview: risk === 'SUSPICIOUS',
    extension: input.extension,
  };
}
