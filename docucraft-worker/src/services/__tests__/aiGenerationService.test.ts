import { describe, expect, it } from "bun:test";
import {
  PROMPT_CONFIG,
  generateAIContent,
  getPromptFormat,
  isPromptKey,
  type ClientFactory,
} from "../aiGenerationService";

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

    const result = await generateAIContent(
      "mvp",
      {
        project: {
          name: "Docucraft",
          description: "Generate documentation diagrams",
          keyObjectives: "Automate diagrams",
        },
      },
      "test-key",
      factory,
    );

    expect(result).toBe("raw-response");
    expect(recordedApiKey).toBe("test-key");
    expect(recordedRequests.length).toBe(1);
    expect(recordedRequests[0]?.model).toBe("gemini-2.5-flash-lite");
    expect(recordedRequests[0]?.contents).toContain(PROMPT_CONFIG.mvp.prompt);
    expect(recordedRequests[0]?.contents).toContain("Project Name: Docucraft");
  });

  it("throws when the prompt key is unknown", async () => {
    try {
      await generateAIContent(
        "unknown" as unknown as keyof typeof PROMPT_CONFIG,
        { text: "Test" },
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
      await generateAIContent("mvp", { text: "Build" }, "test-key", factory);
      throw new Error("Expected to throw for empty AI response");
    } catch (error) {
      expect((error as Error).message).toBe("AI response did not include text output");
    }
  });

  it("exposes helper utilities for prompt metadata", () => {
    expect(getPromptFormat("mvp")).toBe("json");
    expect(getPromptFormat("architecture")).toBe("mermaid");
    expect(isPromptKey("kanban")).toBe(true);
    expect(isPromptKey("not-real")).toBe(false);
  });

  it("includes template metadata and contextual answers when building prompts", async () => {
    const recordedRequests: Array<{ contents: string }> = [];

    const factory: ClientFactory = () => ({
      models: {
        generateContent: async (request) => {
          recordedRequests.push({ contents: request.contents });
          return { text: "ok" };
        },
      },
    });

    await generateAIContent(
      "architecture",
      {
        project: {
          name: "Retail Platform",
          description: "E-commerce storefront",
          keyObjectives: "Scale to global customers",
        },
        template: {
          id: "template-1",
          name: "Storefront",
          description: "Retail focused",
          vertical: "Retail",
          recommendedTechStack: {
            frontend: ["Next.js"],
            backend: ["NestJS"],
            database: ["PostgreSQL"],
            infrastructure: ["Vercel"],
            notes: ["Enable localisation"],
          },
        },
        contextualAnswers: [
          {
            id: "catalog",
            question: "Catalogue size",
            answer: "1,000 products",
          },
        ],
      },
      "key",
      factory,
    );

    expect(recordedRequests.length).toBe(1);
    const contents = recordedRequests[0]?.contents ?? "";
    expect(contents).toContain("Template: Storefront (Retail)");
    expect(contents).toContain("Frontend Stack: Next.js");
    expect(contents).toContain("- Catalogue size: 1,000 products");
  });
});
