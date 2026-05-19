"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthUser = requireAuthUser;
const httpError_1 = require("./httpError");
function requireAuthUser(req) {
    if (!req.user)
        throw new httpError_1.HttpError('Yetkisiz', 401);
    return req.user;
}
