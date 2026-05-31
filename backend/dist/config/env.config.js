"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const get_env_1 = require("../utils/get-env");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const envConfig = () => {
    const CLOUDINARY_API_SECRET = (0, get_env_1.getEnv)("CLOUDINARY_API_SECRET");
    // 🔥 fail fast (very important)
    if (!CLOUDINARY_API_SECRET) {
        throw new Error("CLOUDINARY_API_SECRET is missing");
    }
    return {
        NODE_ENV: (0, get_env_1.getEnv)("NODE_ENV", "development"),
        PORT: Number((0, get_env_1.getEnv)("PORT", "8000")), // ✅ fix type
        BASE_PATH: (0, get_env_1.getEnv)("BASE_PATH", "/api"),
        MONGO_URI: (0, get_env_1.getEnv)("MONGO_URI"),
        JWT_SECRET: (0, get_env_1.getEnv)("JWT_SECRET", "secert_jwt"),
        JWT_EXPIRES_IN: (0, get_env_1.getEnv)("JWT_EXPIRES_IN", "15m"),
        JWT_REFRESH_SECRET: (0, get_env_1.getEnv)("JWT_REFRESH_SECRET", "secert_jwt_refresh"),
        JWT_REFRESH_EXPIRES_IN: (0, get_env_1.getEnv)("JWT_REFRESH_EXPIRES_IN", "7d"),
        GEMINI_API_KEY: (0, get_env_1.getEnv)("GEMINI_API_KEY", ""),
        GEMINI_MODEL: (0, get_env_1.getEnv)("GEMINI_MODEL", "gemini-2.5-flash-lite"),
        GROQ_API_KEY: (0, get_env_1.getEnv)("GROQ_API_KEY", ""),
        GROQ_MODEL: (0, get_env_1.getEnv)("GROQ_MODEL", "llama-3.1-8b-instant"),
        GROQ_VISION_MODEL: (0, get_env_1.getEnv)("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct"),
        CLOUDINARY_CLOUD_NAME: (0, get_env_1.getEnv)("CLOUDINARY_CLOUD_NAME"),
        CLOUDINARY_API_KEY: (0, get_env_1.getEnv)("CLOUDINARY_API_KEY"),
        CLOUDINARY_API_SECRET,
        RESEND_API_KEY: (0, get_env_1.getEnv)("RESEND_API_KEY"),
        RESEND_MAILER_SENDER: (0, get_env_1.getEnv)("RESEND_MAILER_SENDER", ""),
        FRONTEND_ORIGIN: (0, get_env_1.getEnv)("FRONTEND_ORIGIN", "http://localhost:5173"), // ✅ fix
    };
};
exports.Env = envConfig();
