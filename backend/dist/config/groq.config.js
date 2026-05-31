"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqChatCompletion = exports.ensureGroqApiKey = exports.groqVisionModel = exports.groqTextModel = void 0;
const axios_1 = __importDefault(require("axios"));
const env_config_1 = require("./env.config");
const app_error_1 = require("../utils/app-error");
exports.groqTextModel = env_config_1.Env.GROQ_MODEL;
exports.groqVisionModel = env_config_1.Env.GROQ_VISION_MODEL;
const ensureGroqApiKey = () => {
    if (!env_config_1.Env.GROQ_API_KEY) {
        throw new app_error_1.ForbiddenException("GROQ_API_KEY is missing in backend .env");
    }
};
exports.ensureGroqApiKey = ensureGroqApiKey;
const groqChatCompletion = async ({ model, messages, temperature = 0.2, maxCompletionTokens = 1024, responseJson = false, }) => {
    (0, exports.ensureGroqApiKey)();
    const response = await axios_1.default.post("https://api.groq.com/openai/v1/chat/completions", {
        model,
        messages,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: 1,
        stream: false,
        ...(responseJson && { response_format: { type: "json_object" } }),
    }, {
        headers: {
            Authorization: `Bearer ${env_config_1.Env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
    });
    return response.data?.choices?.[0]?.message?.content;
};
exports.groqChatCompletion = groqChatCompletion;
