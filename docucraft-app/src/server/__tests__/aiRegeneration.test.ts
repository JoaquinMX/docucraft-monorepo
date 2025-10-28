import { describe, expect, it } from "bun:test";
import type { RegenerationDependencies } from "@/server/aiRegeneration";
import { regenerateDiagram } from "@/server/aiRegeneration";
import { DIAGRAM_CONFIG } from "@/utils/aiAnalysis";

const baseProject = {
  id: "project-123",
  userId: "user-123",
  name: "Test Project",
  description: "Project description",
  keyObjectives: "Objective A, Objective B",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  image: "alpha" as const,
};

describe("regenerateDiagram", () => {
  it("marks the diagram as failed when the worker returns an error", async () => {
    const pendingCalls: Array<[string, string, Record<string, unknown>]> = [];
    const failureCalls: Array<[string, string, Record<string, unknown>]> = [];

    const firestore: RegenerationDependencies["firestore"] = {
      async getProject() {
        return baseProject;
      },
      async updatePartialAIAnalysis(userId, projectId, update) {
        const statusField = DIAGRAM_CONFIG.erd.statusField;
        if (update[statusField] === "pending") {
          pendingCalls.push([userId, projectId, update]);
        } else {
          failureCalls.push([userId, projectId, update]);
        }
      },
    };

    const workerResponses: Array<Record<string, unknown>> = [];

    const fetchImpl: NonNullable<RegenerationDependencies["fetchImpl"]> = async (
      _input,
      _init
    ) => {
      workerResponses.push({});
      return {
        ok: false,
        status: 502,
      } as Response;
    };

    const errorLogs: unknown[] = [];
    const dependencies: RegenerationDependencies = {
      firestore,
      workerEndpoint: "https://worker.example.com",
      fetchImpl,
      logger: {
        error: (...args: unknown[]) => {
          errorLogs.push(args);
        },
      },
    };

    const result = await regenerateDiagram(
      {
        userId: "user-123",
        projectId: "project-123",
        diagramId: "erd",
      },
      dependencies
    );

    expect(result).toEqual({
      success: false,
      status: 502,
      error: `Worker failed to regenerate ${DIAGRAM_CONFIG.erd.label}`,
    });

    expect(pendingCalls).toHaveLength(1);
    expect(pendingCalls[0]?.[0]).toBe("user-123");
    expect(pendingCalls[0]?.[1]).toBe("project-123");
    expect(pendingCalls[0]?.[2]).toHaveProperty(
      DIAGRAM_CONFIG.erd.statusField,
      "pending"
    );

    expect(failureCalls).toHaveLength(1);
    expect(failureCalls[0]?.[0]).toBe("user-123");
    expect(failureCalls[0]?.[1]).toBe("project-123");
    expect(failureCalls[0]?.[2]).toEqual({
      [DIAGRAM_CONFIG.erd.statusField]: "failed",
    });

    expect(workerResponses).toHaveLength(1);
    expect(errorLogs.length).toBeGreaterThanOrEqual(0);
  });
});
