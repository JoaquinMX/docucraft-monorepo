import type { AIAnalysis } from "./AIAnalysis";

export interface Project {
  id: string;
  userId: string; // Add userId field for user-based structure
  name: string;
  description: string;
  keyObjectives: string;
  createdAt: string;
  updatedAt: string;
  image: string;
  aiAnalysis?: AIAnalysis;
}
