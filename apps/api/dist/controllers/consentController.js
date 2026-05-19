"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitConsent = void 0;
const authUser_1 = require("../utils/authUser");
const ConsentRecord_1 = __importDefault(require("../models/ConsentRecord"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const submitConsent = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const property = await PropertySubmission_1.default.findOne({ _id: req.params.propertyId, userId: user._id });
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const { termsAccepted, privacyAccepted, ...rest } = req.body;
    if (!termsAccepted || !privacyAccepted)
        return res.status(400).json({ error: 'Açık rıza gerekli' });
    const consent = await ConsentRecord_1.default.findOneAndUpdate({ propertySubmissionId: property._id, userId: user._id }, { termsAccepted, privacyAccepted, ...rest }, { upsert: true, new: true });
    res.json(consent);
};
exports.submitConsent = submitConsent;
