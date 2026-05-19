"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAnalysisExportPayload = buildAnalysisExportPayload;
function buildAnalysisExportPayload(input) {
    return {
        version: 'V12',
        exportedAt: new Date().toISOString(),
        property: input.property,
        analysis: input.analysis,
    };
}
