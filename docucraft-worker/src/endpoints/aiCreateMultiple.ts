import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { GoogleGenAI } from "@google/genai";
import { env } from "hono/adapter";
import { prompt as erdPrompt } from "../../prompts/erd";
import { prompt as architecturePrompt } from "../../prompts/architecture";
import { prompt as c4Prompt } from "../../prompts/c4";
import { prompt as userStoriesPrompt } from "../../prompts/user-stories";
import { prompt as ganttPrompt } from "../../prompts/gantt";
import { prompt as kanbanPrompt } from "../../prompts/kanban";

type Env = {
  GOOGLE_AI_STUDIO_TOKEN: string;
};

const diagramPrompts = {
  erd: erdPrompt,
  architecture: architecturePrompt,
  c4: c4Prompt,
  "user-stories": userStoriesPrompt,
  gantt: ganttPrompt,
  kanban: kanbanPrompt,
};

const diagramFormats = {
  erd: "mermaid",
  architecture: "mermaid",
  c4: "mermaid",
  "user-stories": "json",
  gantt: "mermaid",
  kanban: "mermaid",
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

    const ai = new GoogleGenAI({
      apiKey: GOOGLE_AI_STUDIO_TOKEN,
    });

    const results: Record<string, { success: boolean; result?: z.infer<typeof AIResponse>; error?: string; status: 'pending' | 'completed' | 'failed' }> = {};

    // Process diagrams sequentially
    for (const diagramId of selectedDiagrams) {
      try {
        const prompt = diagramPrompts[diagramId as keyof typeof diagramPrompts];
        const format = diagramFormats[diagramId as keyof typeof diagramFormats];

        if (!prompt) {
          results[diagramId] = {
            success: false,
            error: `Unknown diagram type: ${diagramId}`,
            status: 'failed',
          };
          continue;
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: `
${prompt}

${aiRequest.text}`,
        });

        let text = response.text;

        // Clean the response based on format
        if (format === "mermaid") {
          if (text.includes("```mermaid") || text.includes("```")) {
            text = text.replace(/```mermaid\s*/g, "").replace(/```\s*/g, "");
            text = text.trim();
          }
        } else if (format === "json") {
          // Clean JSON response similar to aiCreate.ts
          if (text.includes("```json") || text.includes("```")) {
            text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
            text = text.trim();
          }

          if (text.includes("\\n") || text.includes('\\"')) {
            try {
              const parsedText = JSON.parse(text);
              text = JSON.stringify(parsedText);
            } catch (error) {
              text = text
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");
            }
          }

          try {
            JSON.parse(text);
          } catch (error) {
            text = text
              .replace(/\n/g, "\\n")
              .replace(/"/g, '\\"')
              .replace(/\\/g, "\\\\");
          }
        }

        results[diagramId] = {
          success: true,
          result: { text },
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