export const CONNECTOR_SCHEDULES = {
  municipality: { staleAfterMinutes: 1440, cadenceMinutes: 360 },
  tkgm: { staleAfterMinutes: 720, cadenceMinutes: 180 },
  listing: { staleAfterMinutes: 120, cadenceMinutes: 30 },
  infrastructure: { staleAfterMinutes: 1440, cadenceMinutes: 360 },
  demographic: { staleAfterMinutes: 10080, cadenceMinutes: 1440 },
} as const;
