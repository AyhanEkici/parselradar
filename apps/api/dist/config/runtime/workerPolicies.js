"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKER_POLICIES = void 0;
exports.WORKER_POLICIES = {
    analysisWorker: { concurrency: 2, enabledByDefault: true },
    marketWorker: { concurrency: 2, enabledByDefault: true },
    geoWorker: { concurrency: 2, enabledByDefault: true },
    alertWorker: { concurrency: 1, enabledByDefault: true },
    ingestionWorker: { concurrency: 3, enabledByDefault: true },
};
