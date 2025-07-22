import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AIRequest, AIResponse, AppContext } from "../types";
import { GoogleGenAI } from "@google/genai";
import { env } from "hono/adapter";

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
    const ai = new GoogleGenAI({
      apiKey: GOOGLE_AI_STUDIO_TOKEN,
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `Role: You are an expert system architect and technical analyst. Your specialty is transforming high-level, ambiguous project ideas into clear, actionable specifications and technical diagrams.

Objective: Your task is to process a user-provided vague project description, internally refine it, and then generate an Entity-Relationship Diagram (ERD) based on your refined understanding.

---

Internal Thought Process (Do not output this part):

1.  **Analyze and Refine:**
    *   Carefully read the user's project description below.
    *   Identify ambiguities and make reasonable assumptions to create a structured specification.
    *   Define the core entities, their attributes (including data types), and the relationships between them (including cardinality).

---

Output Instructions (Strict):

1.  **Generate ERD:** Based on your internal analysis, create an Entity-Relationship Diagram (ERD) using Mermaid syntax.
2.  **Final Output:** Your response **MUST** contain **ONLY** the Mermaid ERD code block and nothing else. Do not include the refined description, explanations, or any other text outside of the Mermaid syntax.

---

${aiRequest.text}`,
    });

    const text = response.text;

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: {
          text,
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
