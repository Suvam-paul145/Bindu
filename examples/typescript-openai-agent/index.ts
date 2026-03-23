/**
 * TypeScript OpenAI Agent — Bindufied
 *
 * Demonstrates using the Bindu TypeScript SDK with the OpenAI SDK directly.
 * No LangChain, no framework — just the OpenAI client and Bindu.
 *
 * Usage:
 *   1. Set OPENAI_API_KEY in .env or environment
 *   2. npx tsx index.ts
 */

import { bindufy, ChatMessage } from "@bindu/sdk";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI();

// bindufy — one call, full microservice
bindufy(
  {
    author: "dev@example.com",
    name: "openai-assistant-agent",
    description: "An assistant built with the OpenAI SDK and Bindu",
    version: "1.0.0",
    deployment: {
      url: "http://localhost:3773",
      expose: true,
      cors_origins: ["http://localhost:5173"],
    },
    skills: ["skills/question-answering"],
  },
  async (messages: ChatMessage[]) => {
    // Call OpenAI directly — developer uses whatever they want
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });

    return response.choices[0].message.content || "";
  }
);
