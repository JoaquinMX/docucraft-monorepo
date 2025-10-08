import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const AIResponse = z.object({
  text: Str(),
});

export const ProjectDetails = z.object({
  name: Str(),
  description: Str(),
  keyObjectives: Str(),
  image: Str(),
});

export const TemplateMetadata = z.object({
  id: Str(),
  name: Str(),
  vertical: Str(),
  summary: Str(),
  recommendedStack: z.array(Str()),
  verticalId: Str().optional(),
});

export const TemplateAnswer = z.object({
  questionId: Str(),
  question: Str(),
  type: Str(),
  response: z.union([Str(), z.array(Str())]),
});

export const AIRequest = z.object({
  project: ProjectDetails,
  template: TemplateMetadata,
  followUpAnswers: z.array(TemplateAnswer).optional(),
  selectedDiagrams: z.array(z.string()).optional(),
});

export type AIRequestPayload = z.infer<typeof AIRequest>;
