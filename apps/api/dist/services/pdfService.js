"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportPDF = generateReportPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
async function generateReportPDF(data, filePath) {
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream(filePath));
    doc.text('ParselRadar Raporu');
    // ... add more fields as required ...
    doc.end();
}
