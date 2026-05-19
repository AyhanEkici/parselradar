export function sourceUsageDisclosure(input: {
  source: string;
  legalClass: string;
  governanceState: string;
  fetchedAt: string;
}) {
  const lines = [
    `Source: ${input.source}`,
    `Fetched at: ${input.fetchedAt}`,
    `Legal classification: ${input.legalClass}`,
    `Governance state: ${input.governanceState}`,
    'This connector is governed and may be limited by legal and operational controls.',
    'No official endorsement from municipalities, TKGM, or public institutions is implied.',
  ];

  return {
    source: input.source,
    mode: input.governanceState === 'ALLOW' ? 'GOVERNED_PUBLIC_REFERENCE' : 'RESTRICTED',
    lines,
  };
}
