"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
const auth = async (req, res, next) => {
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token)
        return res.status(401).json({ error: 'Yetkisiz' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user)
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        req.user = {
            _id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Geçersiz oturum' });
    }
};
exports.auth = auth;
