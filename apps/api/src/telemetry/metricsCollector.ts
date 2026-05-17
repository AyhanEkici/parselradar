import AnalysisRun from '../models/AnalysisRun';
import PropertySubmission from '../models/PropertySubmission';

export async function collectTelemetryMetrics() {
  const [analysisCount, propertyCount] = await Promise.all([
    AnalysisRun.countDocuments({}),
    PropertySubmission.countDocuments({}),
  ]);

  return {
    analysisCount,
    propertyCount,
    collectedAt: new Date().toISOString(),
  };
}
