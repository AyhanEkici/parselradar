import PropertySubmission from '../models/PropertySubmission';
import Report from '../models/Report';
import AnalysisRun from '../models/AnalysisRun';

export async function buildProductAnalytics() {
  const [properties, reports, analyses] = await Promise.all([
    PropertySubmission.countDocuments({}),
    Report.countDocuments({}),
    AnalysisRun.countDocuments({}),
  ]);

  return {
    properties,
    reports,
    analyses,
    productState: analyses > 0 ? 'ACTIVE' : 'READY',
  };
}
