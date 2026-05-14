import PDFDocument from 'pdfkit';
import fs from 'fs';

import { IAnalysisRun } from '../models/AnalysisRun';

export interface ReportMeta {
  reportId?: string;
  userId: string;
  date: Date;
  reportType: string;
  pdfPath: string;
  creditsCharged: number;
}

export async function generateReportPDF(
  data: { analysisRun: IAnalysisRun; reportMeta: ReportMeta },
  filePath: string
) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.text('ParselRadar Raporu');
  // ... add more fields as required ...
  doc.end();
}
