// Shared constants for ParselRadar

export const CREDIT_COSTS = {
  QUICK_SCORE: 1,
  PARSEL_INSIGHT: 3,
  DETAILED_PDF_REPORT: 5,
  DEVELOPER_FIT: 10,
  HUMAN_REVIEW_REQUEST: 15,
};

export const STRIPE_CREDIT_PACKAGES = [
  5, 10, 25, 50
];

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DISCLAIMER = `Bu rapor; kullanıcı beyanı, açık kaynak, ilan bilgileri ve yüklenen belgeler üzerinden oluşturulan bilgilendirme amaçlı bir ön analizdir. Hukuki görüş, lisanslı değerleme raporu, yatırım tavsiyesi, tapu inceleme raporu veya emlak aracılık hizmeti değildir. Nihai karar öncesinde tapu, belediye, imar, takyidat, hissedarlık, şufa/önalım, yol ve teknik kontroller yetkili kurumlar ve uzmanlar üzerinden ayrıca teyit edilmelidir.`;
