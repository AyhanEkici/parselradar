"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readinessController = readinessController;
const buildOperationalSnapshot_1 = require("../monitoring/buildOperationalSnapshot");
async function readinessController(req, res) {
    const snapshot = await (0, buildOperationalSnapshot_1.buildOperationalSnapshot)();
    const readyStates = ['READY', 'RUNNING'];
    const isReady = readyStates.includes(snapshot.runtimeStatus.state);
    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        runtimeState: snapshot.runtimeStatus.state,
        healthSummary: snapshot.healthSummary,
        requestId: req.requestId,
    });
}
