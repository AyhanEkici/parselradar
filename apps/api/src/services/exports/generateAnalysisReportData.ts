export function generateAnalysisReportData(input: {
  property: Record<string, unknown>;
  analysis: Record<string, any>;
}) {
  const analysis = input.analysis || {};
  return {
    title: String(input.property?.['addressText'] || 'Property Analysis'),
    score: analysis.score || 0,
    signal: analysis.signal || '-',
    summary: analysis.summary || analysis.previewSummary?.summary || '-',
    intelligence: {
      sourceConfidence: analysis.sourceConfidence || 'low',
      freshnessScore: analysis.freshnessScore || 0,
      analysisVersion: analysis.analysisVersion || '-',
    },
    recommendations: analysis.recommendations || [],
    generatedAt: new Date().toISOString(),
  };
}
