import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { GoogleGenAI } from "@google/genai";
import { env } from "hono/adapter";
import { prompt } from "../../prompts/architecture";

type Env = {
  GOOGLE_AI_STUDIO_TOKEN: string;
};

export class AiCreateArchitecture extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Create Architecture Diagram",
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
        description: "Returns the created architecture diagram",
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

    const ai = new GoogleGenAI({
      apiKey: GOOGLE_AI_STUDIO_TOKEN,
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `
${prompt}

${aiRequest.text}`,
    });

    let text = response.text;

    // Clean the response if it contains markdown formatting
    if (text.includes("```mermaid") || text.includes("```")) {
      // Remove markdown code blocks
      text = text.replace(/```mermaid\s*/g, "").replace(/```\s*/g, "");
      // Trim any leading/trailing whitespace
      text = text.trim();
    }

    console.log(text);

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: {
          text: text,
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