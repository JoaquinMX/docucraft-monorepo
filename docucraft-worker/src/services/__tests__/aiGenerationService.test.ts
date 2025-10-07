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
      { text: "Build an app" },
      "test-key",
      factory,
    );

    expect(result).toBe("raw-response");
    expect(recordedApiKey).toBe("test-key");
    expect(recordedRequests.length).toBe(1);
    expect(recordedRequests[0]?.model).toBe("gemini-2.5-flash-lite");
    expect(recordedRequests[0]?.contents).toContain(PROMPT_CONFIG.mvp.prompt);
    expect(recordedRequests[0]?.contents).toContain("Build an app");
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
});
