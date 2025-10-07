import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { env } from "hono/adapter";
import {
  generateAIContent,
  getPromptFormat,
  isPromptKey,
} from "../services/aiGenerationService";
import { formatDiagramResponse } from "../services/aiResponseFormatter";

type Env = {
  GOOGLE_AI_STUDIO_TOKEN: string;
};

export class AiCreateMultiple extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Create multiple AI diagrams",
    request: {
      body: {
        content: {
          "application/json": {
            schema: AIRequest,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created diagrams",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              results: z.record(z.object({
                success: Bool(),
                result: AIResponse.optional(),
                error: z.string().optional(),
                status: z.enum(['pending', 'completed', 'failed']),
              })),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext): Promise<Response> {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the validated request body
    const aiRequest = data.body;
    const { GOOGLE_AI_STUDIO_TOKEN } = env(c) as Env;
    const selectedDiagrams = aiRequest.selectedDiagrams || [];

    const results: Record<string, { success: boolean; result?: z.infer<typeof AIResponse>; error?: string; status: 'pending' | 'completed' | 'failed' }> = {};

    // Process diagrams sequentially
    for (const diagramId of selectedDiagrams) {
      try {
        if (!isPromptKey(diagramId)) {
          results[diagramId] = {
            success: false,
            error: `Unknown diagram type: ${diagramId}`,
            status: 'failed',
          };
          continue;
        }

        const format = getPromptFormat(diagramId);
        const rawText = await generateAIContent(
          diagramId,
          aiRequest,
          GOOGLE_AI_STUDIO_TOKEN,
        );
        const formatted = formatDiagramResponse(format, rawText);

        results[diagramId] = {
          success: true,
          result: { text: formatted },
          status: 'completed',
        };
      } catch (error) {
        console.error(`Error generating ${diagramId}:`, error);
        results[diagramId] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          status: 'failed',
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}