import type { AIAnalysis, UserStory } from "@/types/AIAnalysis";

/**
 * Validates AI analysis data structure
 */
export function validateAIAnalysis(aiAnalysis: unknown): aiAnalysis is AIAnalysis {
  if (!aiAnalysis || typeof aiAnalysis !== "object") {
    return false;
  }

  const validFields = [
    "erd",
    "architecture",
    "c4",
    "userStories",
    "gantt",
    "kanban",
  ];
  const hasValidFields = validFields.some((field) => field in aiAnalysis);

  if (!hasValidFields) {
    return false;
  }

  // Validate user stories if present
  if (
    "userStories" in aiAnalysis &&
    Array.isArray((aiAnalysis as { userStories?: unknown }).userStories)
  ) {
    for (const story of (aiAnalysis as { userStories: unknown[] }).userStories) {
      if (!validateUserStory(story)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates user story structure
 */
export function validateUserStory(story: unknown): story is UserStory {
  if (!story || typeof story !== "object") {
    return false;
  }

  const candidate = story as Record<string, unknown>;

  const hasValidAcceptanceCriteria = (() => {
    const criteria = candidate.acceptanceCriteria;
    if (criteria === undefined) {
      return true;
    }

    return (
      Array.isArray(criteria) &&
      criteria.every((criterion) => typeof criterion === "string")
    );
  })();

  return (
    typeof candidate.role === "string" &&
    typeof candidate.goal === "string" &&
    typeof candidate.benefit === "string" &&
    (candidate.storyPoints === undefined ||
      typeof candidate.storyPoints === "number") &&
    hasValidAcceptanceCriteria
  );
}

/**
 * Validates project data structure
 */
export function validateProjectData(data: unknown): data is {
  name: string;
  description: string;
  keyObjectives: string;
  image?: unknown;
  aiAnalysis?: AIAnalysis;
} {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Record<string, unknown>;

  const hasValidTextField = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !hasValidTextField(candidate.name) ||
    !hasValidTextField(candidate.description) ||
    !hasValidTextField(candidate.keyObjectives)
  ) {
    return false;
  }

  if (
    candidate.image !== undefined &&
    typeof candidate.image !== "string"
  ) {
    return false;
  }

  if (
    candidate.aiAnalysis !== undefined &&
    !validateAIAnalysis(candidate.aiAnalysis)
  ) {
    return false;
  }

  return true;
}
