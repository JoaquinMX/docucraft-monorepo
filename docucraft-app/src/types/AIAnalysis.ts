export interface AIAnalysis {
  erd?: string;
  architecture?: string;
  c4?: string;
  userStories?: UserStory[];
  gantt?: string;
  kanban?: string;
}

export interface UserStory {
  role: string;
  goal: string;
  benefit: string;
  storyPoints: number;
  acceptanceCriteria: string[];
}

export interface AIAnalysisResponse {
  type: "erd" | "architecture" | "c4" | "user-stories" | "gantt" | "kanban";
  mermaid?: string;
  data?: UserStory[];
}
