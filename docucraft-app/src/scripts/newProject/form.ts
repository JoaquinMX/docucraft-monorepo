import { isValidDiagramId } from "../../utils/aiAnalysis";
import type { DiagramId } from "../../utils/aiAnalysis";
import type { ProjectFormValues } from "./types";

export function getProjectFormValues(form: HTMLFormElement): ProjectFormValues {
  const formData = new FormData(form);
  const selectedDiagrams = formData.getAll("selectedDiagrams") as string[];

  const validDiagramIds = selectedDiagrams.filter((diagram): diagram is DiagramId =>
    isValidDiagramId(diagram)
  );

  return {
    projectName: (formData.get("projectName") as string) ?? "",
    projectDescription: (formData.get("projectDescription") as string) ?? "",
    keyObjectives: (formData.get("keyObjectives") as string) ?? "",
    projectImage: (formData.get("projectImage") as string) ?? "alpha",
    selectedDiagrams: validDiagramIds,
  };
}

export function buildAIRequestText(values: ProjectFormValues): string {
  return `Project Name: ${values.projectName}\n\nProject Description: ${values.projectDescription}\n\nKey Objectives: ${values.keyObjectives}`;
}

export function storeProjectLocally(
  projectId: string,
  values: ProjectFormValues
): void {
  localStorage.setItem(
    "projectData",
    JSON.stringify({
      id: projectId,
      name: values.projectName,
      description: values.projectDescription,
      keyObjectives: values.keyObjectives,
      image: values.projectImage,
      selectedDiagrams: values.selectedDiagrams,
    })
  );
}

export function storeAIResponseLocally(aiResult: Record<string, unknown>): void {
  localStorage.setItem("aiResponse", JSON.stringify(aiResult));
}
