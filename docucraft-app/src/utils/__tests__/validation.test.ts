import { describe, expect, it, beforeEach, vi } from "vitest";

import type { AIAnalysis, UserStory } from "@/types/AIAnalysis";
import {
  transformAIResponseToAIAnalysis,
  validateAIAnalysis,
  validatePartialAIAnalysis,
  validateProjectData,
  validateUserStory,
} from "@/utils/validation";

describe("validation utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("transformAIResponseToAIAnalysis", () => {
    it("flattens valid items and ignores invalid entries", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const response = {
        text: [
          { type: "erd", mermaid: " diagram  " },
          { type: "architecture", mermaid: " system " },
          { type: "c4", mermaid: " context " },
          { type: "gantt", mermaid: " chart " },
          { type: "user-stories", data: [{ role: "pm", goal: "plan", benefit: "clarity" }] },
          { type: "kanban", mermaid: "board" },
          null,
          { type: "gantt", mermaid: 42 },
          { type: "unknown", mermaid: "ignored" },
        ],
      };

      const result = transformAIResponseToAIAnalysis(response);

      expect(result).toEqual({
        erd: "diagram",
        architecture: "system",
        c4: "context",
        gantt: "chart",
        userStories: [{ role: "pm", goal: "plan", benefit: "clarity" }],
        kanban: "board",
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("handles raw arrays and filters invalid entries", () => {
      const badStory: any = { type: "user-stories", data: [{ role: "dev" }] };
      const result = transformAIResponseToAIAnalysis([badStory]);

      expect(result).toEqual({});
    });

    it("logs and skips diagrams when processing throws", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const erroredItem: any = { type: "gantt" };
      Object.defineProperty(erroredItem, "mermaid", {
        get() {
          throw new Error("bad mermaid");
        },
      });

      const result = transformAIResponseToAIAnalysis([erroredItem]);

      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(
        "Skipping invalid diagram of type gantt:",
        expect.any(Error)
      );
    });
  });

  describe("validateUserStory", () => {
    it("accepts complete stories with optional fields", () => {
      const story: UserStory = {
        role: "dev",
        goal: "build",
        benefit: "value",
        storyPoints: 5,
        acceptanceCriteria: ["passes tests"],
      };

      expect(validateUserStory(story)).toBe(true);
    });

    it("rejects malformed acceptance criteria", () => {
      const story = {
        role: "dev",
        goal: "build",
        benefit: "value",
        acceptanceCriteria: ["ok", 3],
      };

      expect(validateUserStory(story)).toBe(false);
    });

    it("rejects non-object inputs and invalid story points", () => {
      expect(validateUserStory(null)).toBe(false);

      const story = {
        role: "dev",
        goal: "build",
        benefit: "value",
        storyPoints: "a lot",
      };

      expect(validateUserStory(story)).toBe(false);
    });
  });

  describe("validateAIAnalysis", () => {
    it("validates analyses with recognized fields", () => {
      const analysis: AIAnalysis = {
        erd: "graph",
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
      };

      expect(validateAIAnalysis(analysis)).toBe(true);
    });

    it("rejects analyses with invalid user stories", () => {
      const analysis = {
        erd: "graph",
        userStories: [{ role: "dev" }],
      };

      expect(validateAIAnalysis(analysis)).toBe(false);
    });

    it("rejects non-object payloads", () => {
      expect(validateAIAnalysis(null)).toBe(false);
    });

    it("rejects payloads without recognized fields", () => {
      expect(validateAIAnalysis({})).toBe(false);
    });
  });

  describe("validatePartialAIAnalysis", () => {
    it("accepts subsets of diagram data", () => {
      expect(
        validatePartialAIAnalysis({
          erd: "graph TD",
          erdStatus: "completed",
          userStories: [
            {
              role: "pm",
              goal: "plan",
              benefit: "value",
              storyPoints: 2,
              acceptanceCriteria: [],
            },
          ],
        })
      ).toBe(true);
    });

    it("rejects unknown fields and invalid values", () => {
      expect(
        validatePartialAIAnalysis({ unknown: "value" })
      ).toBe(false);
      expect(
        validatePartialAIAnalysis({ erdStatus: "not-a-status" })
      ).toBe(false);
      expect(
        validatePartialAIAnalysis({ erd: "   " })
      ).toBe(false);
      expect(
        validatePartialAIAnalysis({ userStories: "not an array" })
      ).toBe(false);
      expect(
        validatePartialAIAnalysis({ erd: 123 })
      ).toBe(false);
    });

    it("rejects non-object payloads", () => {
      expect(validatePartialAIAnalysis(null)).toBe(false);
    });
  });

  describe("validateProjectData", () => {
    it("accepts fully populated project payloads", () => {
      const project = {
        name: "Project",
        description: "Description",
        keyObjectives: "Objectives",
        image: "data:image/png;base64,...",
        aiAnalysis: { erd: "graph" },
        selectedDiagrams: ["erd", "kanban"],
      };

      expect(validateProjectData(project)).toBe(true);
    });

    it("rejects payloads with invalid fields", () => {
      expect(
        validateProjectData({ name: "", description: "desc", keyObjectives: "obj" })
      ).toBe(false);

      expect(
        validateProjectData({
          name: "Project",
          description: "Description",
          keyObjectives: "Objectives",
          image: 123,
        })
      ).toBe(false);

      expect(
        validateProjectData({
          name: "Project",
          description: "Description",
          keyObjectives: "Objectives",
          aiAnalysis: { userStories: [{ role: "dev" }] },
        })
      ).toBe(false);

      expect(
        validateProjectData({
          name: "Project",
          description: "Description",
          keyObjectives: "Objectives",
          selectedDiagrams: ["unknown"],
        })
      ).toBe(false);

      expect(
        validateProjectData({
          name: "Project",
          description: "Description",
          keyObjectives: "Objectives",
          selectedDiagrams: "not an array",
        })
      ).toBe(false);
      expect(validateProjectData(null)).toBe(false);
    });
  });
});
