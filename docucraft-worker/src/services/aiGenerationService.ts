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

function buildPromptContext(request: AIRequestPayload): string {
  const lines: string[] = ["---", "Project Inputs:"];

  const project = request.project;
  lines.push(`Project Name: ${project.name}`);
  lines.push(`Project Description: ${project.description}`);
  lines.push(`Key Objectives: ${project.keyObjectives}`);
  if (project.image) {
    lines.push(`Reference Image: ${project.image}`);
  }

  const template = request.template;
  if (template) {
    lines.push("", "Selected Template:");
    lines.push(`Name: ${template.name}`);
    const verticalLabel = template.verticalId
      ? `${template.vertical} (${template.verticalId})`
      : template.vertical;
    lines.push(`Vertical: ${verticalLabel}`);
    lines.push(`Summary: ${template.summary}`);

    const stack = template.recommendedStack?.filter(
      (item) => typeof item === "string" && item.trim().length > 0,
    );
    if (stack && stack.length > 0) {
      lines.push("Recommended Stack:");
      stack.forEach((item) => lines.push(`- ${item}`));
    }
  }

  const followUpAnswers = request.followUpAnswers ?? [];
  if (followUpAnswers.length > 0) {
    lines.push("", "Contextual Answers:");
    followUpAnswers.forEach((answer, index) => {
      const heading = `${index + 1}. ${answer.question}`;
      if (Array.isArray(answer.response)) {
        lines.push(heading);
        answer.response
          .filter((value) => typeof value === "string" && value.trim().length > 0)
          .forEach((value) => lines.push(`   - ${value}`));
      } else if (typeof answer.response === "string") {
        const trimmed = answer.response.trim();
        lines.push(heading);
        if (trimmed.length > 0) {
          lines.push(`   ${trimmed}`);
        }
      }
    });
  }

  const diagrams = request.selectedDiagrams ?? [];
  if (diagrams.length > 0) {
    lines.push("", "Requested Diagram Types:");
    diagrams.forEach((diagram) => lines.push(`- ${diagram}`));
  }

  return lines.join("\n");
}
