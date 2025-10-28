import type { DiagramId } from "../../utils/aiAnalysis";
import type { ProjectFormValues, ProjectCreationResponse } from "./types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

type FetchFn = typeof fetch;

export async function createProject(
  values: ProjectFormValues,
  fetchFn: FetchFn = fetch
): Promise<ProjectCreationResponse> {
  const response = await fetchFn("/api/projects/create", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      name: values.projectName,
      description: values.projectDescription,
      keyObjectives: values.keyObjectives,
      image: values.projectImage,
      selectedDiagrams: values.selectedDiagrams,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`);
  }

  const result = (await response.json()) as ProjectCreationResponse;

  if (!result.success) {
    throw new Error(result.error || "Failed to create project");
  }

  return result;
}

export async function persistPartialAIAnalysis(
  projectId: string,
  partialAIAnalysis: Record<string, unknown>,
  fetchFn: FetchFn = fetch
): Promise<void> {
  const response = await fetchFn(`/api/projects/${projectId}/ai-analysis/partial`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ partialAIAnalysis }),
  });

  if (!response.ok) {
    throw new Error("Failed to persist partial AI analysis update");
  }
}

export async function persistFailureStatus(
  projectId: string,
  diagramId: DiagramId,
  statusField: string,
  fetchFn: FetchFn = fetch
): Promise<void> {
  const response = await fetchFn(`/api/projects/${projectId}/ai-analysis/partial`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      partialAIAnalysis: {
        [statusField]: "failed",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist failure status for diagram ${diagramId}`);
  }
}
