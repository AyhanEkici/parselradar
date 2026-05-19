"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_POLICIES = void 0;
exports.QUEUE_POLICIES = {
    analysis: { maxRetries: 3, backoffMs: 5000, deadLetterEnabled: true },
    market: { maxRetries: 4, backoffMs: 7000, deadLetterEnabled: true },
    geo: { maxRetries: 4, backoffMs: 7000, deadLetterEnabled: true },
    alert: { maxRetries: 2, backoffMs: 2500, deadLetterEnabled: true },
    ingestion: { maxRetries: 5, backoffMs: 9000, deadLetterEnabled: true },
};
