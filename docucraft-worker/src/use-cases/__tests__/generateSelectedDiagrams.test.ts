import { describe, expect, it } from "bun:test";
import { generateSelectedDiagrams } from "../generateDiagram";
import type { ClientFactory } from "../../services/aiGenerationService";

describe("generateSelectedDiagrams", () => {
  it("creates a single client per request", async () => {
    let createCount = 0;
    const responses = [
      '{"goal":"ship"}',
      "```mermaid\ngraph TD;A-->B\n```",
    ];

    const baseFactory: ClientFactory = () => {
      createCount += 1;
      let call = 0;

      return {
        models: {
          generateContent: async () => ({
            text: responses[call++] ?? responses[responses.length - 1]!,
          }),
        },
      };
    };

    const result = await generateSelectedDiagrams({
      diagramIds: ["mvp", "architecture"],
      request: { text: "Build an app", selectedDiagrams: ["mvp", "architecture"] },
      apiKey: "shared-key",
      clientFactory: baseFactory,
    });

    expect(createCount).toBe(1);
    expect(result.mvp?.success).toBe(true);
    expect(result.mvp?.diagramFormat).toBe("json");
    expect(result.mvp?.result.text).toBe('{"goal":"ship"}');
    expect(result.architecture?.success).toBe(true);
    expect(result.architecture?.diagramFormat).toBe("mermaid");
    expect(result.architecture?.result.text).toBe("graph TD;A-->B");
  });

  it("executes diagram generation concurrently", async () => {
    const delays: Array<{ resolve: () => void }> = [];
    let activeCalls = 0;
    let maxActiveCalls = 0;

    const baseFactory: ClientFactory = () => ({
      models: {
        generateContent: () => {
          activeCalls += 1;
          maxActiveCalls = Math.max(maxActiveCalls, activeCalls);

          return new Promise<{ text: string }>((resolve) => {
            delays.push({
              resolve: () => {
                activeCalls -= 1;
                resolve({ text: "```mermaid\ngraph TD;A-->B\n```" });
              },
            });
          });
        },
      },
    });

    const generationPromise = generateSelectedDiagrams({
      diagramIds: ["architecture", "c4"],
      request: { text: "Build an app" },
      apiKey: "shared-key",
      clientFactory: baseFactory,
    });

    expect(delays).toHaveLength(2);

    delays.forEach(({ resolve }) => resolve());

    await generationPromise;

    expect(maxActiveCalls).toBeGreaterThan(1);
  });
});
