import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const AIResponse = z.object({
  text: Str(),
});

export const FollowUpAnswer = z.object({
  id: Str(),
  prompt: Str(),
  answer: Str(),
});

export const ProjectDetails = z.object({
  name: Str(),
  description: Str(),
  keyObjectives: Str(),
});

export const TemplateDetails = z.object({
  id: Str(),
  name: Str(),
  description: Str(),
  verticalId: Str(),
  verticalLabel: z.string().min(1).nullable().optional(),
  recommendedStack: z.array(Str()),
});

export const AIRequest = z.object({
  project: ProjectDetails,
  template: TemplateDetails,
  followUpAnswers: z.array(FollowUpAnswer).optional(),
  selectedDiagrams: z.array(z.string()).optional(),
});

export type AIRequestPayload = z.infer<typeof AIRequest>;
