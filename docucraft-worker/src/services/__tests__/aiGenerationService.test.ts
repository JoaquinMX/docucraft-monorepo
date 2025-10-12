import { describe, expect, it } from "bun:test";
import {
  PROMPT_CONFIG,
  buildPromptContext,
  generateAIContent,
  getPromptFormat,
  isPromptKey,
  type ClientFactory,
} from "../aiGenerationService";

const baseRequest = {
  project: {
    name: "LaunchPad",
    description: "Platform for orchestrating product launches",
    keyObjectives: "Centralize communications and track milestones",
  },
  template: {
    id: "saas-product-analytics",
    name: "Product Analytics Platform",
    description: "Analyze customer behavior and lifecycle events",
    verticalId: "saas",
    verticalLabel: "SaaS Platforms",
    recommendedStack: ["React", "Node.js", "PostgreSQL"],
  },
  followUpAnswers: [
    {
      id: "core-metrics",
      prompt: "Which metrics are most critical for your stakeholders?",
      answer: "Activation rate and retention",
    },
    {
      id: "event-ingestion",
      prompt: "How will product events be ingested into the platform?",
      answer: "Client SDKs",
    },
  ],
} as const;

describe("aiGenerationService", () => {
  it("generates content using the configured prompt", async () => {
    const recordedRequests: Array<{ model: string; contents: string }> = [];
    let recordedApiKey: string | null = null;

    const factory: ClientFactory = (apiKey) => {
      recordedApiKey = apiKey;
      return {
        models: {
          generateContent: async (request) => {
            recordedRequests.push(request);
            return { text: "raw-response" };
          },
        },
      };
    };

    const result = await generateAIContent("mvp", baseRequest, "test-key", factory);

    expect(result).toBe("raw-response");
    expect(recordedApiKey).toBe("test-key");
    expect(recordedRequests.length).toBe(1);
    expect(recordedRequests[0]?.model).toBe("gemini-2.5-flash-lite");
    expect(recordedRequests[0]?.contents).toContain(PROMPT_CONFIG.mvp.prompt);
    expect(recordedRequests[0]?.contents).toContain("Project Overview:");
    expect(recordedRequests[0]?.contents).toContain("Product Analytics Platform");
    expect(recordedRequests[0]?.contents).toContain(
      "Recommended Tech Stack: React, Node.js, PostgreSQL",
    );
  });

  it("throws when the prompt key is unknown", async () => {
    try {
      await generateAIContent(
        "unknown" as unknown as keyof typeof PROMPT_CONFIG,
        baseRequest,
        "key",
      );
      throw new Error("Expected to throw for unknown prompt key");
    } catch (error) {
      expect((error as Error).message).toBe("Unknown prompt key: unknown");
    }
  });

  it("throws when the AI response is empty", async () => {
    const factory: ClientFactory = () => ({
      models: {
        generateContent: async () => ({ text: "   " }),
      },
    });

    try {
      await generateAIContent("mvp", baseRequest, "test-key", factory);
      throw new Error("Expected to throw for empty AI response");
    } catch (error) {
      expect((error as Error).message).toBe("AI response did not include text output");
    }
  });

  it("builds prompt context with template and follow-up answers", () => {
    const context = buildPromptContext(baseRequest);
    expect(context).toContain("Project Overview:");
    expect(context).toContain("LaunchPad");
    expect(context).toContain("Template Context:");
    expect(context).toContain("Product Analytics Platform");
    expect(context).toContain("Follow-up Answers:");
    expect(context).toContain("Activation rate and retention");
    expect(context).toContain("Client SDKs");
  });

  it("exposes helper utilities for prompt metadata", () => {
    expect(getPromptFormat("mvp")).toBe("json");
    expect(getPromptFormat("architecture")).toBe("mermaid");
    expect(isPromptKey("kanban")).toBe(true);
    expect(isPromptKey("not-real")).toBe(false);
  });
});
