"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSharedWatchlistSummary = buildSharedWatchlistSummary;
function buildSharedWatchlistSummary(input) {
    return {
        total: input.rows.length,
        rows: input.rows,
    };
}
