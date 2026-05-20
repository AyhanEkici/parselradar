export function abnormalUsageDetector(input: { requestRate: number; exportRate: number; uploadRate: number }) {
  const score = input.requestRate * 0.5 + input.exportRate * 2 + input.uploadRate * 1.5;
  return {
    score,
    abnormal: score >= 120,
  };
}
