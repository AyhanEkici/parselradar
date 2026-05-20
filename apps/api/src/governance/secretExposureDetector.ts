export function secretExposureDetector(input: { text: string }) {
  const patterns = [/AKIA[0-9A-Z]{16}/, /ghp_[A-Za-z0-9]{20,}/, /sk_live_[A-Za-z0-9]{16,}/, /-----BEGIN PRIVATE KEY-----/];
  const matched = patterns.some((pattern) => pattern.test(input.text));
  return {
    exposed: matched,
    requiresIncident: matched,
  };
}
