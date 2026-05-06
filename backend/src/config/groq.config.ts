import axios from "axios";
import { Env } from "./env.config";
import { ForbiddenException } from "../utils/app-error";

type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

export const groqTextModel = Env.GROQ_MODEL;
export const groqVisionModel = Env.GROQ_VISION_MODEL;

export const ensureGroqApiKey = () => {
  if (!Env.GROQ_API_KEY) {
    throw new ForbiddenException("GROQ_API_KEY is missing in backend .env");
  }
};

export const groqChatCompletion = async ({
  model,
  messages,
  temperature = 0.2,
  maxCompletionTokens = 1024,
  responseJson = false,
}: {
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  maxCompletionTokens?: number;
  responseJson?: boolean;
}) => {
  ensureGroqApiKey();

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages,
      temperature,
      max_completion_tokens: maxCompletionTokens,
      top_p: 1,
      stream: false,
      ...(responseJson && { response_format: { type: "json_object" } }),
    },
    {
      headers: {
        Authorization: `Bearer ${Env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content as string | undefined;
};
