"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.storage = void 0;
const multer_1 = __importDefault(require("multer"));
exports.storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error('Geçersiz dosya türü'));
};
exports.upload = (0, multer_1.default)({
    storage: exports.storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
