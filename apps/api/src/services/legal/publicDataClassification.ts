import { SourceType } from '../connectors/connectorCapabilityMatrix';

export function publicDataClassification(input: {
  sourceType: SourceType;
  legalClass: 'PUBLIC_REFERENCE_METADATA' | 'PUBLIC_AGGREGATE_REFERENCE' | 'PUBLIC_INFRA_REFERENCE';
}) {
  const restrictionBase = [
    'No hidden scraping',
    'No uncontrolled crawling',
    'No implied official endorsement',
    'Metadata/reference scope only',
  ];

  const governanceState = input.legalClass === 'PUBLIC_REFERENCE_METADATA' || input.legalClass === 'PUBLIC_AGGREGATE_REFERENCE' || input.legalClass === 'PUBLIC_INFRA_REFERENCE'
    ? 'ALLOW'
    : 'RESTRICT';

  return {
    legalClass: input.legalClass,
    governanceState,
    usageRestrictions: restrictionBase,
    disclaimer:
      'ParselRadar uses public references and does not imply endorsement by municipalities, TKGM, or other institutions.',
  } as const;
}
