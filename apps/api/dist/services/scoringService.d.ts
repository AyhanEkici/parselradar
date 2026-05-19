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
export declare function calculateScore(input: ScoringInput): ScoringResult;
