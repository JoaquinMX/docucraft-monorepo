import type { DiagramId } from "../../utils/aiAnalysis";

export interface ProjectFormValues {
  projectName: string;
  projectDescription: string;
  keyObjectives: string;
  projectImage: string;
  selectedDiagrams: DiagramId[];
}

export interface FormElements {
  form: HTMLFormElement;
  submitButton: HTMLButtonElement;
  buttonText: HTMLSpanElement;
  loadingSpinner: HTMLDivElement;
  errorMessage: HTMLDivElement;
  progressContainer: HTMLDivElement;
  progressItems: HTMLDivElement;
}

export interface ProjectCreationResponse {
  success: boolean;
  projectId?: string;
  userId?: string;
  isAnonymous?: boolean;
  error?: string;
}

export interface NewProjectContext {
  workerUrl: string;
  db: import("firebase/firestore").Firestore;
}
