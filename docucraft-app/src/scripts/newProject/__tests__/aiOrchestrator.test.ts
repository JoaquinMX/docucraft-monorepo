import { describe, expect, test } from "bun:test";
import { generateAIAnalyses } from "../aiOrchestrator";

const workerUrl = "https://example.com";

describe("generateAIAnalyses", () => {
  test("aggregates AI results and persists partial updates", async () => {
    const diagramIds = ["erd", "gantt"] as const;

    const responses = [
      {
        ok: true,
        status: 200,
        statusText: "OK",
        async json() {
          return {
            results: {
              erd: {
                success: true,
                status: "completed",
                result: { text: "ERD content" },
              },
            },
          };
        },
      },
      {
        ok: true,
        status: 200,
        statusText: "OK",
        async json() {
          return {
            results: {
              gantt: {
                success: true,
                status: "completed",
                result: { text: "Gantt content" },
              },
            },
          };
        },
      },
    ];

    let callIndex = 0;
    const fetchMock = async () => responses[callIndex++];

    const partialUpdates: Array<[string, Record<string, unknown>]> = [];
    const failureStatuses: Array<[string, Record<string, unknown>]> = [];

    const result = await generateAIAnalyses({
      diagramIds: [...diagramIds],
      workerUrl,
      aiRequestText: "Request",
      isAnonymous: false,
      projectId: "project-123",
      fetchFn: fetchMock,
      onPartialUpdate: (diagramId, partial) => {
        partialUpdates.push([diagramId, partial]);
      },
      onFailureStatus: (diagramId, status) => {
        failureStatuses.push([diagramId, status]);
      },
    });

    expect(callIndex).toBe(2);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.results).toEqual({
      erd: {
        success: true,
        status: "completed",
        result: { text: "ERD content" },
      },
      gantt: {
        success: true,
        status: "completed",
        result: { text: "Gantt content" },
      },
    });
    expect(partialUpdates).toEqual([
      ["erd", { erd: "ERD content", erdStatus: "completed" }],
      ["gantt", { gantt: "Gantt content", ganttStatus: "completed" }],
    ]);
    expect(failureStatuses).toHaveLength(0);
  });

  test("captures failures and emits failure status", async () => {
    const diagramIds = ["erd"] as const;

    let callIndex = 0;
    const fetchMock = async () => {
      callIndex += 1;
      return {
        ok: false,
        status: 500,
        statusText: "Server Error",
      } as const;
    };

    const partialUpdates: Array<[string, Record<string, unknown>]> = [];
    const failureStatuses: Array<[string, Record<string, unknown>]> = [];

    const result = await generateAIAnalyses({
      diagramIds: [...diagramIds],
      workerUrl,
      aiRequestText: "Request",
      isAnonymous: false,
      projectId: "project-123",
      fetchFn: fetchMock,
      onPartialUpdate: (diagramId, partial) => {
        partialUpdates.push([diagramId, partial]);
      },
      onFailureStatus: (diagramId, status) => {
        failureStatuses.push([diagramId, status]);
      },
    });

    expect(callIndex).toBe(1);
    expect(result.success).toBe(false);
    expect(result.error).toMatchObject({ type: "http", status: 500 });
    expect(result.results.erd).toMatchObject({
      success: false,
      status: "failed",
    });
    expect(partialUpdates).toHaveLength(0);
    expect(failureStatuses).toEqual([["erd", { erdStatus: "failed" }]]);
  });
});
