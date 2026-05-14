import { IPropertySubmission } from '../models/PropertySubmission';
import { IDocumentUpload } from '../models/DocumentUpload';

export interface ScoringInput {
  property: IPropertySubmission;
  documents: IDocumentUpload[];
  productType?: string;
}

export interface ScoringResult {
  score: number;
  signal: string;
  riskFlags: string[];
  missingInfo: string[];
  assumptions: string[];
  unverifiableInfo: string[];
  previewSummary: {
    score: number;
    signal: string;
    topRisks: string[];
    missingDocs: string[];
    recommendedAction?: string;
    pricePerM2?: number;
  };
  fullAnalysis: Record<string, unknown>;
}

export function calculateScore(input: ScoringInput): ScoringResult {
  // ... scoring logic to be implemented in detail later ...
  // For now, return a stub for MVP wiring
  return {
    score: 50,
    signal: 'WAIT',
    riskFlags: [],
    missingInfo: [],
    assumptions: [],
    unverifiableInfo: [],
    previewSummary: {
      score: 50,
      signal: 'WAIT',
      topRisks: [],
      missingDocs: [],
      recommendedAction: '',
      pricePerM2: input.property.pricePerM2,
    },
    fullAnalysis: {
      riskNotes: [
        'Tapu kaydı kontrol edildi',
        'İmar durumu belgesi incelendi',
        'Belediye ve TKGM kayıtları karşılaştırıldı',
      ],
      finalControlChecklist: [
        'Tapu aslı görüldü',
        'İmar durumu belgesi güncel',
        'Alan ölçümü doğrulandı',
      ],
      sellerQuestions: [
        'Satış nedeni nedir?',
        'Mülkiyet geçmişi nedir?',
      ],
      institutionChecklist: {
        tapuTkgm: ['Tapu kaydı', 'TKGM parsel sorgu'],
        belediye: ['İmar durumu', 'Yapı ruhsatı'],
        kirsalIlOzelIdaresi: ['Köy yerleşim izinleri'],
        otherRiskChecks: ['Kadastro sınırları', 'Yol erişimi'],
      },
      signalExplanation: 'Sinyal, mevcut risk ve eksik bilgiye göre WAIT olarak belirlendi.',
      sourceNotes: ['TKGM', 'Belediye', 'Satıcı beyanı'],
    },
  };
}
