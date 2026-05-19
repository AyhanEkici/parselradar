"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BULLMQ_POLICIES = void 0;
exports.BULLMQ_POLICIES = {
    queueNames: {
        analysis: 'analysis',
        market: 'market',
        geo: 'geo',
        alert: 'alert',
        ingestion: 'ingestion',
    },
    defaultRemoveOnComplete: 200,
    defaultRemoveOnFail: 500,
};
