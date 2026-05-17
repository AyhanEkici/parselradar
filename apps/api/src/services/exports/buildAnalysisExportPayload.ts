export function buildAnalysisExportPayload(input: {
  property: Record<string, unknown>;
  analysis: Record<string, unknown>;
}) {
  return {
    version: 'V12',
    exportedAt: new Date().toISOString(),
    property: input.property,
    analysis: input.analysis,
  };
}
