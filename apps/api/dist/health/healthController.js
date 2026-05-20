"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = healthController;
const buildOperationalSnapshot_1 = require("../monitoring/buildOperationalSnapshot");
const degradedRuntime_1 = require("../runtime/degradedRuntime");
async function healthController(req, res) {
    const snapshot = await (0, buildOperationalSnapshot_1.buildOperationalSnapshot)();
    res.setHeader('X-Request-Id', req.requestId || '');
    res.json({
        status: snapshot.healthSummary.overall,
        runtimeStatus: snapshot.runtimeStatus,
        queueStates: snapshot.queueStates,
        workerStates: snapshot.workerStates,
        runtimeMetrics: snapshot.runtimeMetrics,
        operationalSnapshot: snapshot.operationalSnapshot,
        securitySignals: snapshot.securitySignals,
        healthSummary: snapshot.healthSummary,
        requestId: req.requestId,
        runtimeDiagnostics: (0, degradedRuntime_1.getRuntimeDiagnostics)(),
    });
}
