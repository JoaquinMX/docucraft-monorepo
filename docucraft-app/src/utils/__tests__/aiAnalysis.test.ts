import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  DIAGRAM_CONFIG,
  createPendingAIAnalysis,
  extractPartialAIAnalysisFromWorker,
  getDiagramLabel,
  isValidDiagramId,
  transformWorkerResponseToAIAnalysis,
} from "@/utils/aiAnalysis";

describe("aiAnalysis utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validates known diagram identifiers", () => {
    expect(isValidDiagramId("erd")).toBe(true);
    expect(isValidDiagramId("unknown")).toBe(false);
  });

  it("returns the label for a diagram id", () => {
    expect(getDiagramLabel("kanban")).toBe(DIAGRAM_CONFIG.kanban.label);
  });

  it("marks requested diagrams as pending", () => {
    const pending = createPendingAIAnalysis(["erd", "user-stories", "invalid"]);

    expect(pending).toEqual({
      erdStatus: "pending",
      userStoriesStatus: "pending",
    });
  });

  it("transforms worker responses into AI analysis format", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const workerResponse = {
      results: {
        erd: {
          status: "completed",
          success: true,
          result: { text: "graph TD" },
        },
        "user-stories": {
          status: "completed",
          success: true,
          result: { text: JSON.stringify([{ role: "dev", goal: "ship", benefit: "value", storyPoints: 3, acceptanceCriteria: ["done"] }]) },
        },
        invalid: {
          status: "completed",
          success: true,
          result: { text: "ignored" },
        },
        gantt: {
          status: "failed",
          success: false,
          result: null,
        },
      },
    };

    const transformed = transformWorkerResponseToAIAnalysis(workerResponse);

    expect(transformed).toEqual({
      erd: "graph TD",
      erdStatus: "completed",
      userStories: [
        {
          role: "dev",
          goal: "ship",
          benefit: "value",
          storyPoints: 3,
          acceptanceCriteria: ["done"],
        },
      ],
      userStoriesStatus: "completed",
      ganttStatus: "failed",
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns empty analysis when worker response lacks results", () => {
    expect(transformWorkerResponseToAIAnalysis({})).toEqual({});
  });

  it("extracts partial analysis data for a diagram", () => {
    const partial = extractPartialAIAnalysisFromWorker("kanban", {
      results: {
        kanban: {
          status: "completed",
          success: true,
          result: { text: "kanban text" },
        },
      },
    });

    expect(partial).toEqual({
      kanban: "kanban text",
      kanbanStatus: "completed",
    });
  });

  it("defaults status to failed when worker omits status", () => {
    const partial = extractPartialAIAnalysisFromWorker("architecture", {
      results: {
        architecture: {
          success: true,
          result: { text: "diagram" },
        },
      },
    });

    expect(partial).toEqual({
      architecture: "diagram",
      architectureStatus: "failed",
    });
  });

  it("defaults status when the worker omits a diagram entry", () => {
    const partial = extractPartialAIAnalysisFromWorker("c4", {
      results: {},
    });

    expect(partial).toEqual({
      c4Status: "failed",
    });
  });

  it("ignores unparsable user story payloads", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const transformed = transformWorkerResponseToAIAnalysis({
      results: {
        "user-stories": {
          status: "completed",
          success: true,
          result: { text: "not json" },
        },
      },
    });

    expect(transformed).toEqual({
      userStoriesStatus: "completed",
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it("ignores user story payloads that do not parse to an array", () => {
    const transformed = transformWorkerResponseToAIAnalysis({
      results: {
        "user-stories": {
          status: "completed",
          success: true,
          result: { text: JSON.stringify({ role: "pm" }) },
        },
      },
    });

    expect(transformed).toEqual({
      userStoriesStatus: "completed",
    });
  });
});
