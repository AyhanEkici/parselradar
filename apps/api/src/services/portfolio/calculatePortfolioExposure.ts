export function calculatePortfolioExposure(input: {
  items: Array<{ allocationWeight?: number; askingPriceTRY?: number; areaM2?: number; il?: string; ilce?: string }>;
}) {
  const totalWeight = input.items.reduce((sum, item) => sum + (item.allocationWeight || 0), 0);
  const totalValue = input.items.reduce((sum, item) => sum + (item.askingPriceTRY || 0), 0);

  const byCity: Record<string, number> = {};
  input.items.forEach((item) => {
    const key = String(item.il || 'unknown').toLowerCase();
    byCity[key] = (byCity[key] || 0) + (item.askingPriceTRY || 0);
  });

  return {
    totalWeight,
    totalValue,
    byCity,
    itemCount: input.items.length,
  };
}
