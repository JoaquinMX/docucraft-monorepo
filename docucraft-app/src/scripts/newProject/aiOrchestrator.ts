import {
  DIAGRAM_CONFIG,
  extractPartialAIAnalysisFromWorker,
} from "../../utils/aiAnalysis";
import type { DiagramId } from "../../utils/aiAnalysis";
import {
  createWorkerClient,
  formatWorkerClientError,
  type WorkerClientError,
} from "../../services/workerClient";

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
  error?: WorkerClientError;
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
  let encounteredError: WorkerClientError | undefined;
  const workerClient = createWorkerClient({
    baseUrl: workerUrl,
    fetchImpl: fetchFn,
  });

  for (const diagramId of diagramIds) {
    try {
      const aiResponse = await workerClient.requestAIAnalysis({
        text: aiRequestText,
        selectedDiagrams: [diagramId],
      });

      if (!aiResponse.ok) {
        encounteredError = encounteredError ?? aiResponse.error;
        const message = formatWorkerClientError(aiResponse.error);

        aggregatedResults[diagramId] = {
          success: false,
          error: message,
          status: "failed",
        };

        if (!isAnonymous && projectId && onFailureStatus) {
          const statusField = DIAGRAM_CONFIG[diagramId].statusField;
          await onFailureStatus(diagramId, { [statusField]: "failed" });
        }

        continue;
      }

      const aiResult = aiResponse.data;
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

      if (!encounteredError) {
        encounteredError = {
          type: "unknown",
          message,
          cause: error,
        };
      }
    }
  }

  return {
    success: encounteredError ? false : true,
    results: aggregatedResults,
    error: encounteredError,
  };
}
