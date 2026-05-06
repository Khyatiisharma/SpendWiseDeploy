import path from "path";
import dotenv from "dotenv";
import { getEnv } from "../utils/get-env";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envConfig = () => {
  const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");

  // 🔥 fail fast (very important)
  if (!CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is missing");
  }

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),

    PORT: Number(getEnv("PORT", "8000")), // ✅ fix type
    BASE_PATH: getEnv("BASE_PATH", "/api"),
    MONGO_URI: getEnv("MONGO_URI"),

    JWT_SECRET: getEnv("JWT_SECRET", "secert_jwt"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secert_jwt_refresh"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

    GEMINI_API_KEY: getEnv("GEMINI_API_KEY", ""),
    GEMINI_MODEL: getEnv("GEMINI_MODEL", "gemini-2.5-flash-lite"),
    GROQ_API_KEY: getEnv("GROQ_API_KEY", ""),
    GROQ_MODEL: getEnv("GROQ_MODEL", "llama-3.1-8b-instant"),
    GROQ_VISION_MODEL: getEnv(
      "GROQ_VISION_MODEL",
      "meta-llama/llama-4-scout-17b-16e-instruct"
    ),

    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET,

    RESEND_API_KEY: getEnv("RESEND_API_KEY"),
    RESEND_MAILER_SENDER: getEnv("RESEND_MAILER_SENDER", ""),

    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"), // ✅ fix
  };
};

export const Env = envConfig();
