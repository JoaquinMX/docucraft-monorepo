import type { AIRequestPayload } from "../types";
import {
  ensureMemoizedClientFactory,
  generateAIContent,
  getPromptFormat,
  isPromptKey,
  type ClientFactory,
  type PromptKey,
} from "../services/aiGenerationService";
import { formatDiagramResponse, type DiagramFormat } from "../services/aiResponseFormatter";

export type DiagramGenerationStatus = "pending" | "completed" | "failed";

export type DiagramGenerationSuccess = {
  success: true;
  status: "completed";
  diagramId: PromptKey;
  diagramFormat: DiagramFormat;
  result: { text: string };
};

export type DiagramGenerationFailure = {
  success: false;
  status: "failed";
  diagramId: string;
  error: string;
};

export type DiagramGenerationResult =
  | DiagramGenerationSuccess
  | DiagramGenerationFailure;

type GenerateDiagramParams = {
  diagramId: string;
  request: Pick<AIRequestPayload, "text">;
  apiKey: string;
  clientFactory?: ClientFactory;
};

export async function generateDiagram({
  diagramId,
  request,
  apiKey,
  clientFactory,
}: GenerateDiagramParams): Promise<DiagramGenerationResult> {
  if (!isPromptKey(diagramId)) {
    return {
      success: false,
      status: "failed",
      diagramId,
      error: `Unknown diagram type: ${diagramId}`,
    };
  }

  try {
    const diagramFormat = getPromptFormat(diagramId);
    const resolvedFactory = ensureMemoizedClientFactory(clientFactory);
    const rawText = await generateAIContent(
      diagramId,
      request,
      apiKey,
      resolvedFactory,
    );
    const formatted = formatDiagramResponse(diagramFormat, rawText);

    return {
      success: true,
      status: "completed",
      diagramId,
      diagramFormat,
      result: { text: formatted },
    };
  } catch (error) {
    console.error(`Error generating ${diagramId}:`, error);
    return {
      success: false,
      status: "failed",
      diagramId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

type GenerateSelectedDiagramsParams = {
  diagramIds: string[];
  request: AIRequestPayload;
  apiKey: string;
  clientFactory?: ClientFactory;
};

export async function generateSelectedDiagrams({
  diagramIds,
  request,
  apiKey,
  clientFactory,
}: GenerateSelectedDiagramsParams): Promise<Record<string, DiagramGenerationResult>> {
  const memoizedFactory = ensureMemoizedClientFactory(clientFactory);

  const entries = await Promise.all(
    diagramIds.map(async (diagramId) => {
      const result = await generateDiagram({
        diagramId,
        request,
        apiKey,
        clientFactory: memoizedFactory,
      });

      return [diagramId, result] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<string, DiagramGenerationResult>;
}
