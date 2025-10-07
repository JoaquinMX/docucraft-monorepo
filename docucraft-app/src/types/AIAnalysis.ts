export interface AIAnalysis {
  erd?: string;
  architecture?: string;
  c4?: string;
  userStories?: UserStory[];
  gantt?: string;
  kanban?: string;
  erdStatus?: 'pending' | 'completed' | 'failed';
  architectureStatus?: 'pending' | 'completed' | 'failed';
  c4Status?: 'pending' | 'completed' | 'failed';
  userStoriesStatus?: 'pending' | 'completed' | 'failed';
  ganttStatus?: 'pending' | 'completed' | 'failed';
  kanbanStatus?: 'pending' | 'completed' | 'failed';
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
