import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useToast } from '../components/ui';
import GovernanceBadge from '../components/governance/GovernanceBadge';
import ConfidenceMeter from '../components/confidence/ConfidenceMeter';
import EvidenceStrengthCard from '../components/confidence/EvidenceStrengthCard';
import DisclosurePanel from '../components/disclosure/DisclosurePanel';
const DISCLAIMER = `Bu rapor; kullanıcı beyanı, açık kaynak, ilan bilgileri ve yüklenen belgeler üzerinden oluşturulan bilgilendirme amaçlı bir ön analizdir. Hukuki görüş, lisanslı değerleme raporu, yatırım tavsiyesi, tapu inceleme raporu veya emlak aracılık hizmeti değildir. Nihai karar öncesinde tapu, belediye, imar, takyidat, hissedarlık, şufa/önalım, yol ve teknik kontroller yetkili kurumlar ve uzmanlar üzerinden ayrıca teyit edilmelidir.`;

export default function PropertyResult() {
  const { id } = useParams();
  interface AnalysisResult {
    signal: string;
    score: number;
    pricePerM2?: number;
    id?: string;
    topRisks?: string[];
    missingDocs?: string[];
    recommendedAction?: string;
    governanceClassification?: string;
    reportEvidenceSummary?: {
      evidenceStrength?: string;
      sourcesAvailable?: number;
      sourcesTotal?: number;
    };
    reportConfidenceSummary?: {
      score?: number;
      classification?: string;
    };
    reportDisclosureSummary?: {
      mode?: string;
      lines?: string[];
    };
  }
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const toast = useToast();

  const runAnalysis = async (type: string) => {
    setResult(null);
    setPdfId(null);
    const loadingToastId = toast.loading('Analiz çalıştırılıyor...');
    try {
      const res = await apiFetch(`analysis/${id}/${type}` , { method: 'POST' });
      setResult(res);
      setAnalysisRunId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('Analiz tamamlandı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'Analiz başarısız');
    }
  };

  const purchasePDF = async () => {
    if (!analysisRunId) return;
    const loadingToastId = toast.loading('PDF satın alma işlemi başlatılıyor...');
    try {
      const res = await apiFetch(`reports/${analysisRunId}/purchase-pdf`, { method: 'POST' });
      setPdfId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('PDF satın alma başarılı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'PDF alınamadı');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Analiz Sonucu</h2>
      <div className="space-x-2 mb-4">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => runAnalysis('quick-score')}>Hızlı İlan Kontrolü</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => runAnalysis('parsel-insight')}>Parsel Insight</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => runAnalysis('developer-fit')}>Developer Fit</button>
      </div>
      {result && (
        <div className="border p-4 rounded mb-4">
          <div className="mb-3">
            <GovernanceBadge classification={result.governanceClassification} />
          </div>
          <div><b>Signal:</b> {result.signal}</div>
          <div><b>Skor:</b> {result.score}</div>
          <div><b>TL/m²:</b> {result.pricePerM2 || '-'}</div>
          <div><b>En büyük 3 risk:</b> {(result.topRisks || []).join(', ')}</div>
          <div><b>Eksik belgeler:</b> {(result.missingDocs || []).join(', ')}</div>
          <div><b>Önerilen sonraki adım:</b> {result.recommendedAction || '-'}</div>
          <div className="mt-2 text-yellow-700">PDF raporun tamamı için satın alma gereklidir.</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ConfidenceMeter
              score={result.reportConfidenceSummary?.score}
              classification={result.reportConfidenceSummary?.classification}
            />
            <EvidenceStrengthCard
              evidenceStrength={result.reportEvidenceSummary?.evidenceStrength}
              sourcesAvailable={result.reportEvidenceSummary?.sourcesAvailable}
              sourcesTotal={result.reportEvidenceSummary?.sourcesTotal}
            />
          </div>
          <div className="mt-3">
            <DisclosurePanel
              mode={result.reportDisclosureSummary?.mode}
              lines={result.reportDisclosureSummary?.lines}
            />
          </div>
        </div>
      )}
      {analysisRunId && !pdfId && (
        <button className="bg-green-600 text-white px-4 py-2 rounded mb-2" onClick={purchasePDF}>PDF Rapor Satın Al</button>
      )}
      {pdfId && (
        <a className="bg-blue-600 text-white px-4 py-2 rounded" href={`/reports/${pdfId}/download`}>PDF Raporu İndir</a>
      )}
      <div className="mt-6 text-xs text-gray-600 border-t pt-4">{DISCLAIMER}</div>
    </div>
  );
}
