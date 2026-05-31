"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const defaults = {
    audience: ["user"],
};
const accessTokenSignOptions = {
    expiresIn: env_config_1.Env.JWT_EXPIRES_IN,
    secret: env_config_1.Env.JWT_SECRET,
};
const signJwtToken = (payload, options) => {
    const isAccessToken = !options || options === accessTokenSignOptions;
    const { secret, ...opts } = options || accessTokenSignOptions;
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        ...defaults,
        ...opts,
    });
    const expiresAt = isAccessToken
        ? jsonwebtoken_1.default.decode(token)?.exp * 1000
        : undefined;
    return {
        token,
        expiresAt,
    };
};
exports.signJwtToken = signJwtToken;
