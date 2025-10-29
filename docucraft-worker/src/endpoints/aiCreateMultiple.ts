import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { env } from "hono/adapter";
import {
  generateSelectedDiagrams,
  type DiagramGenerationResult,
} from "../use-cases/generateDiagram";

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

    const mapResult = (result: DiagramGenerationResult): {
      success: boolean;
      result?: z.infer<typeof AIResponse>;
      error?: string;
      status: 'pending' | 'completed' | 'failed';
    } => {
      if (result.success) {
        return {
          success: true,
          result: { text: result.result.text },
          status: result.status,
        };
      }

      return {
        success: false,
        error: result.error,
        status: result.status,
      };
    };

    const generationResults = await generateSelectedDiagrams({
      diagramIds: selectedDiagrams,
      request: aiRequest,
      apiKey: GOOGLE_AI_STUDIO_TOKEN,
    });

    const settledResults = await Promise.allSettled(
      selectedDiagrams.map(async (diagramId) => {
        const result = generationResults[diagramId];

        if (!result) {
          throw new Error(`No result for diagram: ${diagramId}`);
        }

        return mapResult(result);
      })
    );

    const results = selectedDiagrams.reduce<
      Record<
        string,
        {
          success: boolean;
          result?: z.infer<typeof AIResponse>;
          error?: string;
          status: 'pending' | 'completed' | 'failed';
        }
      >
    >((acc, diagramId, index) => {
      const settled = settledResults[index];

      if (settled?.status === 'fulfilled') {
        acc[diagramId] = settled.value;
        return acc;
      }

      const reason = settled?.status === 'rejected' ? settled.reason : undefined;

      acc[diagramId] = {
        success: false,
        status: 'failed',
        error:
          reason instanceof Error
            ? reason.message
            : typeof reason === 'string'
              ? reason
              : `No result for diagram: ${diagramId}`,
      };

      return acc;
    }, {});

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