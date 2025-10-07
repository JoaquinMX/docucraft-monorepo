import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { env } from "hono/adapter";
import { generateAIContent } from "../services/aiGenerationService";
import { formatDiagramResponse } from "../services/aiResponseFormatter";

type Env = {
  GOOGLE_AI_STUDIO_TOKEN: string;
};

export class AiCreate extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Create a new AI response",
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
        description: "Returns the created AI response",
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

    const rawText = await generateAIContent("mvp", aiRequest, GOOGLE_AI_STUDIO_TOKEN);
    const formatted = formatDiagramResponse("json", rawText);

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: {
          text: JSON.parse(formatted),
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
