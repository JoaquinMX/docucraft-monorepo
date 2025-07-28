import type { AIAnalysis, UserStory } from "@/types/AIAnalysis";

/**
 * Validates AI analysis data structure
 */
export function validateAIAnalysis(aiAnalysis: any): aiAnalysis is AIAnalysis {
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
  if (aiAnalysis.userStories && Array.isArray(aiAnalysis.userStories)) {
    for (const story of aiAnalysis.userStories) {
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
export function validateUserStory(story: any): story is UserStory {
  return (
    story &&
    typeof story === "object" &&
    typeof story.role === "string" &&
    typeof story.goal === "string" &&
    typeof story.benefit === "string" &&
    (story.storyPoints === undefined || typeof story.storyPoints === "number") &&
    (story.acceptanceCriteria === undefined || 
      (Array.isArray(story.acceptanceCriteria) &&
       story.acceptanceCriteria.every(
         (criterion: any) => typeof criterion === "string"
       )))
  );
}

/**
 * Validates project data structure
 */
export function validateProjectData(data: any): data is {
  name: string;
  description: string;
  keyObjectives: string;
  aiAnalysis?: AIAnalysis;
} {
  return (
    data &&
    typeof data === "object" &&
    typeof data.name === "string" &&
    typeof data.description === "string" &&
    typeof data.keyObjectives === "string" &&
    (data.aiAnalysis === undefined || validateAIAnalysis(data.aiAnalysis))
  );
}
