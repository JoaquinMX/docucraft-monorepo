import { GoogleGenAI } from "@google/genai";
import type { AIRequestPayload } from "../types";
import { prompt as architecturePrompt } from "../../prompts/architecture";
import { prompt as c4Prompt } from "../../prompts/c4";
import { prompt as erdPrompt } from "../../prompts/erd";
import { prompt as ganttPrompt } from "../../prompts/gantt";
import { prompt as kanbanPrompt } from "../../prompts/kanban";
import { prompt as mvpPrompt } from "../../prompts/mvp";
import { prompt as userStoriesPrompt } from "../../prompts/user-stories";
import type { DiagramFormat } from "./aiResponseFormatter";

export const MODEL_NAME = "gemini-2.5-flash-lite";

type PromptConfiguration = {
  prompt: string;
  format: DiagramFormat;
};

export const PROMPT_CONFIG: Record<PromptKey, PromptConfiguration> = {
  mvp: { prompt: mvpPrompt, format: "json" },
  architecture: { prompt: architecturePrompt, format: "mermaid" },
  c4: { prompt: c4Prompt, format: "mermaid" },
  erd: { prompt: erdPrompt, format: "mermaid" },
  gantt: { prompt: ganttPrompt, format: "mermaid" },
  kanban: { prompt: kanbanPrompt, format: "mermaid" },
  "user-stories": { prompt: userStoriesPrompt, format: "json" },
};

export type PromptKey = keyof typeof PROMPT_CONFIG;

export function isPromptKey(value: string): value is PromptKey {
  return value in PROMPT_CONFIG;
}

export function getPromptFormat(promptKey: PromptKey): DiagramFormat {
  return PROMPT_CONFIG[promptKey].format;
}

type GoogleClient = {
  models: {
    generateContent: (
      request: { model: string; contents: string },
    ) => Promise<
      { text?: string | (() => string | Promise<string>) } & Record<string, unknown>
    >;
  };
};

export type ClientFactory = (apiKey: string) => GoogleClient;

const defaultClientFactory: ClientFactory = (apiKey: string) =>
  new GoogleGenAI({
    apiKey,
  });

export function buildPromptContext(request: AIRequestPayload): string {
  const sections: string[] = [];

  if (request.project) {
    const { name, description, keyObjectives } = request.project;
    sections.push(
      `Project Name: ${name}`,
      `Project Description: ${description}`,
      `Key Objectives: ${keyObjectives}`,
    );
  }

  if (request.template) {
    const { name, description, vertical, recommendedTechStack } =
      request.template;

    const stackLines: string[] = [];

    if (recommendedTechStack.frontend?.length) {
      stackLines.push(
        `Frontend Stack: ${recommendedTechStack.frontend.join(", ")}`,
      );
    }

    if (recommendedTechStack.backend?.length) {
      stackLines.push(
        `Backend Stack: ${recommendedTechStack.backend.join(", ")}`,
      );
    }

    if (recommendedTechStack.database?.length) {
      stackLines.push(
        `Data Layer: ${recommendedTechStack.database.join(", ")}`,
      );
    }

    if (recommendedTechStack.infrastructure?.length) {
      stackLines.push(
        `Infrastructure: ${recommendedTechStack.infrastructure.join(", ")}`,
      );
    }

    if (recommendedTechStack.notes?.length) {
      stackLines.push(
        `Implementation Notes: ${recommendedTechStack.notes.join(" | ")}`,
      );
    }

    const templateSection = [`Template: ${name} (${vertical})`, description]
      .concat(stackLines)
      .filter(Boolean)
      .join("\n");

    sections.push(templateSection);
  }

  if (request.contextualAnswers?.length) {
    const answerLines = request.contextualAnswers
      .map((entry) => {
        const value = Array.isArray(entry.answer)
          ? entry.answer.join(", ")
          : entry.answer;
        return `- ${entry.question}: ${value}`;
      })
      .join("\n");

    sections.push(`Contextual Insights:\n${answerLines}`);
  }

  if (sections.length > 0) {
    return sections.join("\n\n");
  }

  if (request.text) {
    return request.text;
  }

  throw new Error("AI request payload is missing project context");
}

export async function generateAIContent(
  promptKey: PromptKey,
  request: AIRequestPayload,
  apiKey: string,
  clientFactory: ClientFactory = defaultClientFactory,
): Promise<string> {
  const configuration = PROMPT_CONFIG[promptKey];

  if (!configuration) {
    throw new Error(`Unknown prompt key: ${promptKey}`);
  }

  const ai = clientFactory(apiKey);

  const promptContext = buildPromptContext(request);

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
${configuration.prompt}

${promptContext}`,
  });

  const rawText =
    typeof response.text === "function" ? await response.text() : response.text;

  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    throw new Error("AI response did not include text output");
  }

  return rawText;
}
