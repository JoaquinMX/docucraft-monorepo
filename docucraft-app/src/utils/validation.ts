import type { AIAnalysis, UserStory } from "@/types/AIAnalysis";

/**
 * Transforms AI response array format to flat AIAnalysis object format
 * Filters out invalid or malformed diagrams
 */
export function transformAIResponseToAIAnalysis(aiResponse: any): AIAnalysis {
  const result: AIAnalysis = {};

  // Handle the case where the response has a 'text' property containing the array
  const responseArray = aiResponse?.text || aiResponse;

  if (Array.isArray(responseArray)) {
    responseArray.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.type) {
        return; // Skip invalid items
      }

      try {
        switch (item.type) {
          case "erd":
            if (typeof item.mermaid === 'string' && item.mermaid.trim()) {
              result.erd = item.mermaid.trim();
            }
            break;
          case "architecture":
            if (typeof item.mermaid === 'string' && item.mermaid.trim()) {
              result.architecture = item.mermaid.trim();
            }
            break;
          case "c4":
            if (typeof item.mermaid === 'string' && item.mermaid.trim()) {
              result.c4 = item.mermaid.trim();
            }
            break;
          case "user-stories":
            if (Array.isArray(item.data) && item.data.length > 0) {
              // Validate that each user story has required fields
              const validStories = item.data.filter((story: any) =>
                story &&
                typeof story === 'object' &&
                typeof story.role === 'string' &&
                typeof story.goal === 'string' &&
                typeof story.benefit === 'string'
              );
              if (validStories.length > 0) {
                result.userStories = validStories;
              }
            }
            break;
          case "gantt":
            if (typeof item.mermaid === 'string' && item.mermaid.trim()) {
              result.gantt = item.mermaid.trim();
            }
            break;
          case "kanban":
            if (typeof item.mermaid === 'string' && item.mermaid.trim()) {
              result.kanban = item.mermaid.trim();
            }
            break;
        }
      } catch (error) {
        // Skip this diagram if processing fails
        console.warn(`Skipping invalid diagram of type ${item.type}:`, error);
      }
    });
  }

  return result;
}

/**
 * Transforms worker response format to AIAnalysis object format
 * Handles the new format with status information
 */
export function transformWorkerResponseToAIAnalysis(workerResponse: any): AIAnalysis {
  const result: AIAnalysis = {};

  if (workerResponse?.results) {
    // Handle the new worker response format with results and status
    Object.entries(workerResponse.results).forEach(([diagramId, response]: [string, any]) => {
      const status = response.status;
      const diagramKey = diagramId as keyof AIAnalysis;
      const statusKey = `${diagramId}Status` as keyof AIAnalysis;

      if (response.success && response.result) {
        if (diagramId === 'user-stories') {
          // Parse JSON for user stories
          try {
            const parsed = JSON.parse(response.result.text);
            if (Array.isArray(parsed)) {
              result.userStories = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse user stories:', e);
          }
        } else {
          result[diagramKey] = response.result.text;
        }
      }

      // Set status
      if (status) {
        result[statusKey] = status;
      }
    });
  }

  return result;
}

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
    "erdStatus",
    "architectureStatus",
    "c4Status",
    "userStoriesStatus",
    "ganttStatus",
    "kanbanStatus",
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
