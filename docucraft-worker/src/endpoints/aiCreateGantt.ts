import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { env } from "hono/adapter";
import { generateDiagram } from "../use-cases/generateDiagram";

type Env = {
  GOOGLE_AI_STUDIO_TOKEN: string;
};

export class AiCreateGantt extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Create Gantt Chart",
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
        description: "Returns the created gantt chart",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  aiResponse: AIResponse,
                }),
              }),
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

    const result = await generateDiagram({
      diagramId: "gantt",
      request: aiRequest,
      apiKey: GOOGLE_AI_STUDIO_TOKEN,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          status: result.status,
          error: result.error,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: {
          text: result.result.text,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}