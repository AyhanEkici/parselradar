export type RawListing = Record<string, unknown>;

export type NormalizedListing = {
  externalId: string;
  city?: string;
  district?: string;
  areaM2?: number;
  pricePerM2?: number;
  askingPriceTRY?: number;
  latitude?: number;
  longitude?: number;
  source: string;
};

function toNumber(value: unknown) {
  return typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : undefined;
}

export function normalizeListingData(input: { listing: RawListing; source: string }): NormalizedListing {
  const areaM2 = toNumber(input.listing.areaM2 ?? input.listing.area);
  const askingPriceTRY = toNumber(input.listing.askingPriceTRY ?? input.listing.priceTRY ?? input.listing.price);
  const pricePerM2 = toNumber(input.listing.pricePerM2) ?? (areaM2 && askingPriceTRY ? Math.round(askingPriceTRY / areaM2) : undefined);

  return {
    externalId: String(input.listing.externalId || input.listing.id || `${input.source}-${input.listing.il || input.listing.city || 'unknown'}-${input.listing.ilce || input.listing.district || 'unknown'}-${areaM2 || 0}`),
    city: String(input.listing.il || input.listing.city || '').toLowerCase() || undefined,
    district: String(input.listing.ilce || input.listing.district || '').toLowerCase() || undefined,
    areaM2,
    pricePerM2,
    askingPriceTRY,
    latitude: toNumber(input.listing.latitude),
    longitude: toNumber(input.listing.longitude),
    source: input.source,
  };
}
