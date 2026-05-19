"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCredits = getUserCredits;
const CreditLedger_1 = __importDefault(require("../models/CreditLedger"));
const mongoose_1 = __importDefault(require("mongoose"));
async function getUserCredits(userId) {
    const id = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    const result = await CreditLedger_1.default.aggregate([
        { $match: { userId: id } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
}
