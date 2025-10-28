import {
  DIAGRAM_CONFIG,
  extractPartialAIAnalysisFromWorker,
} from "../../utils/aiAnalysis";
import type { DiagramId } from "../../utils/aiAnalysis";

interface GenerateAIAnalysesOptions {
  diagramIds: DiagramId[];
  workerUrl: string;
  aiRequestText: string;
  isAnonymous: boolean;
  projectId?: string;
  fetchFn?: typeof fetch;
  onPartialUpdate?: (
    diagramId: DiagramId,
    partialAIAnalysis: Record<string, unknown>
  ) => Promise<void> | void;
  onFailureStatus?: (
    diagramId: DiagramId,
    partialStatus: Record<string, unknown>
  ) => Promise<void> | void;
}

export interface AIAnalysisResult {
  success: boolean;
  results: Record<string, unknown>;
}

export async function generateAIAnalyses({
  diagramIds,
  workerUrl,
  aiRequestText,
  isAnonymous,
  projectId,
  fetchFn = fetch,
  onPartialUpdate,
  onFailureStatus,
}: GenerateAIAnalysesOptions): Promise<AIAnalysisResult> {
  const aggregatedResults: Record<string, unknown> = {};

  for (const diagramId of diagramIds) {
    try {
      const response = await fetchFn(`${workerUrl}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: aiRequestText,
          selectedDiagrams: [diagramId],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const aiResult = await response.json();
      const diagramResult = aiResult?.results?.[diagramId];

      if (diagramResult) {
        aggregatedResults[diagramId] = diagramResult;
      } else {
        aggregatedResults[diagramId] = {
          success: false,
          status: "failed",
          error: "No result returned",
        };
      }

      if (!isAnonymous && projectId && onPartialUpdate) {
        const partialUpdate = extractPartialAIAnalysisFromWorker(diagramId, aiResult);
        await onPartialUpdate(diagramId, partialUpdate);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      aggregatedResults[diagramId] = {
        success: false,
        error: message,
        status: "failed",
      };

      if (!isAnonymous && projectId && onFailureStatus) {
        const statusField = DIAGRAM_CONFIG[diagramId].statusField;
        await onFailureStatus(diagramId, { [statusField]: "failed" });
      }
    }
  }

  return {
    success: true,
    results: aggregatedResults,
  };
}
