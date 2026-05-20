export function sensitiveDataScanner(input: { fields: string[] }) {
  const sensitivePatterns = [/password/i, /token/i, /secret/i, /credential/i, /cookie/i, /authorization/i];
  const matched = input.fields.filter((field) => sensitivePatterns.some((p) => p.test(field)));
  return {
    hasSensitiveData: matched.length > 0,
    sensitiveFields: matched,
  };
}
