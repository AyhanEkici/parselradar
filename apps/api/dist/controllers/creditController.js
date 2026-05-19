"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devAddCredits = exports.getCredits = void 0;
const env_1 = require("../config/env");
const CreditLedger_1 = __importDefault(require("../models/CreditLedger"));
const credits_1 = require("../utils/credits");
const authUser_1 = require("../utils/authUser");
const getCredits = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const credits = await (0, credits_1.getUserCredits)(user._id);
    res.json({ credits });
};
exports.getCredits = getCredits;
const devAddCredits = async (req, res) => {
    if (env_1.NODE_ENV === 'production')
        return res.status(403).json({ error: 'Prod ortamda dev kredi eklenemez' });
    const user = (0, authUser_1.requireAuthUser)(req);
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0)
        return res.status(400).json({ error: 'Geçersiz miktar' });
    await CreditLedger_1.default.create({ userId: user._id, type: 'DEV_ADD', amount, reason: 'Dev ekleme' });
    res.json({ ok: true });
};
exports.devAddCredits = devAddCredits;
