import { describe, expect, it } from "bun:test";
import {
  PROMPT_CONFIG,
  generateAIContent,
  getPromptFormat,
  isPromptKey,
  type ClientFactory,
} from "../aiGenerationService";

describe("aiGenerationService", () => {
  const createRequest = () => ({
    project: {
      name: "Acme Payments",
      description: "A unified orchestration layer for global payment routing.",
      keyObjectives:
        "Improve authorization rates, reduce fraud, and centralize settlement reporting.",
      image: "alpha",
    },
    template: {
      id: "payment-orchestration",
      name: "Payment Orchestration Platform",
      vertical: "Financial Services",
      verticalId: "fintech",
      summary: "Route transactions across multiple PSPs with smart failover.",
      recommendedStack: ["Next.js", "NestJS", "PostgreSQL"],
    },
    followUpAnswers: [
      {
        questionId: "compliance",
        question: "What compliance frameworks are non-negotiable for launch?",
        type: "textarea",
        response: "PCI DSS Level 1 and SOC 2 Type II",
      },
      {
        questionId: "payment-methods",
        question: "Which payment methods must be supported on day one?",
        type: "multi-select",
        response: ["Card payments (Visa, Mastercard)", "Bank transfers / ACH"],
      },
    ],
    selectedDiagrams: ["erd", "architecture"],
  });

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
      createRequest(),
      "test-key",
      factory,
    );

    expect(result).toBe("raw-response");
    expect(recordedApiKey).toBe("test-key");
    expect(recordedRequests.length).toBe(1);
    expect(recordedRequests[0]?.model).toBe("gemini-2.5-flash-lite");
    expect(recordedRequests[0]?.contents).toContain(PROMPT_CONFIG.mvp.prompt);
    expect(recordedRequests[0]?.contents).toContain("Project Name: Acme Payments");
  });

  it("includes template metadata and contextual answers in the prompt", async () => {
    let capturedContents = "";
    const factory: ClientFactory = () => ({
      models: {
        generateContent: async (request) => {
          capturedContents = request.contents;
          return { text: "ok" };
        },
      },
    });

    await generateAIContent("architecture", createRequest(), "token", factory);

    expect(capturedContents).toContain("Selected Template:");
    expect(capturedContents).toContain("Name: Payment Orchestration Platform");
    expect(capturedContents).toContain("Vertical: Financial Services (fintech)");
    expect(capturedContents).toContain("Recommended Stack:");
    expect(capturedContents).toContain("- Next.js");
    expect(capturedContents).toContain("Contextual Answers:");
    expect(capturedContents).toContain("PCI DSS Level 1 and SOC 2 Type II");
    expect(capturedContents).toContain("- Card payments (Visa, Mastercard)");
    expect(capturedContents).toContain("Requested Diagram Types:");
    expect(capturedContents).toContain("- erd");
  });

  it("throws when the prompt key is unknown", async () => {
    try {
      await generateAIContent(
        "unknown" as unknown as keyof typeof PROMPT_CONFIG,
        createRequest(),
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
      await generateAIContent("mvp", createRequest(), "test-key", factory);
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
