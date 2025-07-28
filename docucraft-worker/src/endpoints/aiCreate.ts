import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { GoogleGenAI } from "@google/genai";
import { env } from "hono/adapter";
import { prompt } from "../../prompts/mvp";

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

    // Get current date for Gantt chart
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
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
    if (text.includes("```json") || text.includes("```")) {
      // Remove markdown code blocks
      text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      // Trim any leading/trailing whitespace
      text = text.trim();
    }

    // Clean escaped JSON if the response contains escaped characters
    if (text.includes("\\n") || text.includes('\\"')) {
      try {
        // Parse the escaped JSON string to get the actual JSON
        const parsedText = JSON.parse(text);
        text = JSON.stringify(parsedText);
      } catch (error) {
        // If parsing fails, try to clean common escape sequences
        text = text
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      }
    }

    // Additional JSON safety check - ensure proper escaping
    try {
      // Test if the text can be parsed as JSON
      JSON.parse(text);
    } catch (error) {
      console.error("JSON parsing failed after cleaning:", error);
      // If still failing, try to fix common JSON issues
      text = text
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')
        .replace(/\\/g, "\\\\");
    }

    console.log(text);

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: {
          text: JSON.parse(text),
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
