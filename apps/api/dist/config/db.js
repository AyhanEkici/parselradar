"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    if (!env_1.MONGODB_URI)
        throw new Error('MONGODB_URI missing');
    await mongoose_1.default.connect(env_1.MONGODB_URI);
};
exports.connectDB = connectDB;
