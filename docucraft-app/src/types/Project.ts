import type { ProjectImageId } from "@/constants/images";
import type { AIAnalysis } from "./AIAnalysis";

export interface Project {
  id: string;
  userId: string; // Add userId field for user-based structure
  name: string;
  description: string;
  keyObjectives: string;
  createdAt: string;
  updatedAt: string;
  image: ProjectImageId;
  aiAnalysis?: AIAnalysis;
}
