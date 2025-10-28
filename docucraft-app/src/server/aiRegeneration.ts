import type { AIAnalysis } from "@/types/AIAnalysis";
import type { Project } from "@/types/Project";
import type { DiagramId } from "@/utils/aiAnalysis";
import {
  DIAGRAM_CONFIG,
  createPendingAIAnalysis,
  extractPartialAIAnalysisFromWorker,
} from "@/utils/aiAnalysis";

export interface RegenerationInput {
  userId: string;
  projectId: string;
  diagramId: DiagramId;
}

interface FirestoreLike {
  getProject(userId: string, projectId: string): Promise<Project | null>;
  updatePartialAIAnalysis(
    userId: string,
    projectId: string,
    partial: Partial<AIAnalysis>
  ): Promise<void>;
}

export interface RegenerationDependencies {
  firestore?: FirestoreLike;
  workerEndpoint?: string;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "error">;
}

export type RegenerationSuccess = {
  success: true;
  status: 200;
  partialUpdate: Partial<AIAnalysis>;
};

export type RegenerationFailure = {
  success: false;
  status: number;
  error: string;
};

export type RegenerationResult = RegenerationSuccess | RegenerationFailure;

interface ResolvedDependencies {
  firestore: FirestoreLike;
  workerEndpoint?: string;
  fetchImpl: typeof fetch;
  logger: Pick<Console, "error">;
}

async function resolveDependencies(
  overrides: RegenerationDependencies = {}
): Promise<ResolvedDependencies> {
  const workerEndpoint =
    overrides.workerEndpoint ||
    import.meta.env.WORKER_URL ||
    import.meta.env.PUBLIC_WORKER_URL;

  const firestore =
    overrides.firestore ||
    (await import("../services/firestore/server")).firestoreServerAdapter;

  return {
    firestore,
    workerEndpoint,
    fetchImpl: overrides.fetchImpl ?? fetch,
    logger: overrides.logger ?? console,
  };
}

export async function regenerateDiagram(
  input: RegenerationInput,
  dependencies: RegenerationDependencies = {}
): Promise<RegenerationResult> {
  const { userId, projectId, diagramId } = input;
  const { firestore, workerEndpoint, fetchImpl, logger } =
    await resolveDependencies(dependencies);

  if (!workerEndpoint) {
    return {
      success: false,
      status: 500,
      error: "Worker endpoint not configured",
    };
  }

  let project: Project | null = null;

  try {
    project = await firestore.getProject(userId, projectId);
  } catch (error) {
    logger.error("Error fetching project for regeneration:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to load project for regeneration",
    };
  }

  if (!project) {
    return {
      success: false,
      status: 404,
      error: "Project not found",
    };
  }

  const { label, statusField } = DIAGRAM_CONFIG[diagramId];
  const failureStatus: Partial<AIAnalysis> = {
    [statusField]: "failed",
  } as Partial<AIAnalysis>;

  const aiRequestText = `Project Name: ${project.name}\n\nProject Description: ${project.description}\n\nKey Objectives: ${project.keyObjectives}`;

  const markFailure = async () => {
    try {
      await firestore.updatePartialAIAnalysis(userId, projectId, failureStatus);
    } catch (writeError) {
      logger.error("Failed to record regeneration failure:", writeError);
    }
  };

  try {
    await firestore.updatePartialAIAnalysis(
      userId,
      projectId,
      createPendingAIAnalysis([diagramId])
    );

    const workerResponse = await fetchImpl(`${workerEndpoint}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: aiRequestText,
        selectedDiagrams: [diagramId],
      }),
    });

    if (!workerResponse.ok) {
      await markFailure();

      return {
        success: false,
        status: workerResponse.status,
        error: `Worker failed to regenerate ${label}`,
      };
    }

    const workerJson = await workerResponse.json();
    const partialUpdate = extractPartialAIAnalysisFromWorker(
      diagramId,
      workerJson
    );

    await firestore.updatePartialAIAnalysis(userId, projectId, partialUpdate);

    return {
      success: true,
      status: 200,
      partialUpdate,
    };
  } catch (error) {
    logger.error("Error regenerating diagram:", error);
    await markFailure();

    return {
      success: false,
      status: 500,
      error: "Failed to regenerate diagram. Please try again.",
    };
  }
}
