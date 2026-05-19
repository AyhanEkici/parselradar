"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
function calculateScore(input) {
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
