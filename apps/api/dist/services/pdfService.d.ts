import { IAnalysisRun } from '../models/AnalysisRun';
export interface ReportMeta {
    reportId?: string;
    userId: string;
    date: Date;
    reportType: string;
    pdfPath: string;
    creditsCharged: number;
}
export declare function generateReportPDF(data: {
    analysisRun: IAnalysisRun;
    reportMeta: ReportMeta;
}, filePath: string): Promise<void>;
