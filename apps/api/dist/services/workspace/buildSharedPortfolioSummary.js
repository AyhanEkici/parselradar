"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSharedPortfolioSummary = buildSharedPortfolioSummary;
function buildSharedPortfolioSummary(input) {
    return {
        total: input.rows.length,
        rows: input.rows,
    };
}
