"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.livenessController = livenessController;
function livenessController(req, res) {
    res.status(200).json({
        status: 'live',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
    });
}
