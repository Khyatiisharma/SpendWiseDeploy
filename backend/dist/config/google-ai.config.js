"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAIModel = exports.genAI = void 0;
const genai_1 = require("@google/genai");
const env_config_1 = require("./env.config");
exports.genAI = new genai_1.GoogleGenAI({ apiKey: env_config_1.Env.GEMINI_API_KEY });
exports.genAIModel = env_config_1.Env.GEMINI_MODEL;
