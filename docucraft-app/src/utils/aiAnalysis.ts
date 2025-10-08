import type { AIAnalysis, UserStory } from "@/types/AIAnalysis";

export const DIAGRAM_CONFIG = {
  erd: {
    label: "Entity Relationship Diagram",
    field: "erd" as const,
    statusField: "erdStatus" as const,
  },
  architecture: {
    label: "System Architecture",
    field: "architecture" as const,
    statusField: "architectureStatus" as const,
  },
  c4: {
    label: "C4 Context Diagram",
    field: "c4" as const,
    statusField: "c4Status" as const,
  },
  "user-stories": {
    label: "User Stories",
    field: "userStories" as const,
    statusField: "userStoriesStatus" as const,
  },
  gantt: {
    label: "Gantt Chart",
    field: "gantt" as const,
    statusField: "ganttStatus" as const,
  },
  kanban: {
    label: "Kanban Board",
    field: "kanban" as const,
    statusField: "kanbanStatus" as const,
  },
} as const;

export type DiagramId = keyof typeof DIAGRAM_CONFIG;

export function isValidDiagramId(value: unknown): value is DiagramId {
  return typeof value === "string" && value in DIAGRAM_CONFIG;
}

export function getDiagramLabel(diagramId: DiagramId): string {
  return DIAGRAM_CONFIG[diagramId].label;
}

export function createPendingAIAnalysis(
  diagrams: readonly string[]
): Partial<AIAnalysis> {
  const pending: Partial<AIAnalysis> = {};

  diagrams.forEach((diagramId) => {
    if (isValidDiagramId(diagramId)) {
      const { statusField } = DIAGRAM_CONFIG[diagramId];
      pending[statusField] = "pending";
    }
  });

  return pending;
}

export function transformWorkerResponseToAIAnalysis(
  workerResponse: any
): AIAnalysis {
  const result: AIAnalysis = {};

  if (workerResponse?.results) {
    Object.entries(workerResponse.results).forEach(
      ([diagramId, response]: [string, any]) => {
        if (!isValidDiagramId(diagramId)) {
          return;
        }

        const { field, statusField } = DIAGRAM_CONFIG[diagramId];
        const status = response.status;

        if (response.success && response.result) {
          if (diagramId === "user-stories") {
            try {
              const parsed = JSON.parse(response.result.text);
              if (Array.isArray(parsed)) {
                result[field] = parsed as UserStory[];
              }
            } catch (error) {
              console.warn("Failed to parse user stories:", error);
            }
          } else {
            result[field] = response.result.text;
          }
        }

        if (status) {
          result[statusField] = status;
        }
      }
    );
  }

  return result;
}

export function extractPartialAIAnalysisFromWorker(
  diagramId: DiagramId,
  workerResponse: any
): Partial<AIAnalysis> {
  const transformed = transformWorkerResponseToAIAnalysis(workerResponse);
  const { field, statusField } = DIAGRAM_CONFIG[diagramId];
  const partial: Partial<AIAnalysis> = {};

  if (statusField in transformed) {
    partial[statusField] = transformed[statusField];
  }

  if (field in transformed) {
    partial[field] = transformed[field];
  }

  if (!(statusField in partial)) {
    // Default to failed if the worker did not provide a status
    partial[statusField] = "failed";
  }

  return partial;
}
