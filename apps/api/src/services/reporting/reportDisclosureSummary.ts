import { DisclosureMode } from '../governance/governanceTypes';

export function buildReportDisclosureSummary(input: {
  mode: DisclosureMode;
  lines: string[];
  compliance: string;
}) {
  return {
    mode: input.mode,
    compliance: input.compliance,
    lines: input.lines,
  };
}
