import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const AIResponse = z.object({
  text: Str(),
});

const RecommendedTechStack = z.object({
  frontend: z.array(z.string()).optional(),
  backend: z.array(z.string()).optional(),
  database: z.array(z.string()).optional(),
  infrastructure: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
});

export const TemplateMetadata = z.object({
  id: Str(),
  name: Str(),
  description: Str(),
  vertical: Str(),
  recommendedTechStack: RecommendedTechStack,
});

export const ContextualAnswer = z.object({
  id: Str(),
  question: Str(),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const ProjectDetails = z.object({
  name: Str(),
  description: Str(),
  keyObjectives: Str(),
});

export const AIRequest = z
  .object({
    text: Str().optional(),
    project: ProjectDetails.optional(),
    template: TemplateMetadata.optional(),
    contextualAnswers: z.array(ContextualAnswer).optional(),
    selectedDiagrams: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.project) {
      return;
    }

    if (data.text && data.text.trim().length > 0) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["project"],
      message: "Either project details or text must be provided",
    });
  });

export type AIRequestPayload = z.infer<typeof AIRequest>;
