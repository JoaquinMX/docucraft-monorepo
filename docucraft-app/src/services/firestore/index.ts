import type { Project } from "@/types/Project";
import type { AIAnalysis } from "@/types/AIAnalysis";
import type { ProjectImageId } from "@/constants/images";

export type FirestoreProjectInput = Omit<
  Project,
  "id" | "userId" | "image" | "createdAt" | "updatedAt"
>;

export interface FirestoreAdapter {
  createProject(
    userId: string,
    projectData: FirestoreProjectInput,
    imageId?: ProjectImageId
  ): Promise<string>;
  getProject(userId: string, projectId: string): Promise<Project | null>;
  getAllProjects(userId: string): Promise<Project[]>;
  updateProject(
    userId: string,
    projectId: string,
    updates: Partial<Project>
  ): Promise<void>;
  updateAIAnalysis(
    userId: string,
    projectId: string,
    aiAnalysis: AIAnalysis
  ): Promise<void>;
  updatePartialAIAnalysis(
    userId: string,
    projectId: string,
    partialAIAnalysis: Partial<AIAnalysis>
  ): Promise<void>;
  deleteProject(userId: string, projectId: string): Promise<void>;
}
