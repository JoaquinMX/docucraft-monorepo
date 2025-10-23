import type { APIRoute } from "astro";
import { FirestoreServerService } from "@/services/firestore-server";
import type { AIAnalysis } from "@/types/AIAnalysis";
import type { DiagramId } from "@/utils/aiAnalysis";
import {
  DIAGRAM_CONFIG,
  createPendingAIAnalysis,
  extractPartialAIAnalysisFromWorker,
  isValidDiagramId,
} from "@/utils/aiAnalysis";
import { guardSession } from "@/server/auth/session";

const WORKER_ENDPOINT =
  import.meta.env.WORKER_URL || import.meta.env.PUBLIC_WORKER_URL;

export const POST: APIRoute = async ({ params, cookies }) => {
  let userId: string | undefined;
  let projectIdForCatch: string | undefined;
  let diagramIdForCatch: DiagramId | undefined;

  try {
    const session = await guardSession(cookies);
    if (!session.ok) {
      return session.response;
    }

    const { user, isAnonymous } = session;
    userId = user.uid;

    if (isAnonymous) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Anonymous users cannot regenerate diagrams",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const projectId = params.id;
    const diagramIdParam = params.diagram;

    if (!projectId || !diagramIdParam || !isValidDiagramId(diagramIdParam)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid diagram request" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!WORKER_ENDPOINT) {
      return new Response(
        JSON.stringify({ success: false, error: "Worker endpoint not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    projectIdForCatch = projectId;

    const project = await FirestoreServerService.getProject(
      user.uid,
      projectId
    );

    if (!project) {
      return new Response(
        JSON.stringify({ success: false, error: "Project not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const diagramId = diagramIdParam as DiagramId;
    diagramIdForCatch = diagramId;
    const { label } = DIAGRAM_CONFIG[diagramId];

    const aiRequestText = `Project Name: ${project.name}\n\nProject Description: ${project.description}\n\nKey Objectives: ${project.keyObjectives}`;

    await FirestoreServerService.updatePartialAIAnalysis(
      user.uid,
      projectId,
      createPendingAIAnalysis([diagramId])
    );

    const workerResponse = await fetch(`${WORKER_ENDPOINT}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: aiRequestText,
        selectedDiagrams: [diagramId],
      }),
    });

    if (!workerResponse.ok) {
      const failureStatus: Partial<AIAnalysis> = {
        [DIAGRAM_CONFIG[diagramId].statusField]: "failed",
      } as Partial<AIAnalysis>;

      await FirestoreServerService.updatePartialAIAnalysis(
        user.uid,
        projectId,
        failureStatus
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: `Worker failed to regenerate ${label}`,
        }),
        {
          status: workerResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const workerJson = await workerResponse.json();
    const partialUpdate = extractPartialAIAnalysisFromWorker(
      diagramId,
      workerJson
    );

    await FirestoreServerService.updatePartialAIAnalysis(
      user.uid,
      projectId,
      partialUpdate
    );

    return new Response(
      JSON.stringify({ success: true, partialUpdate }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error regenerating diagram:", error);

    if (userId && projectIdForCatch && diagramIdForCatch) {
      const statusField = DIAGRAM_CONFIG[diagramIdForCatch].statusField;
      const failureStatus: Partial<AIAnalysis> = {
        [statusField]: "failed",
      } as Partial<AIAnalysis>;

      try {
        await FirestoreServerService.updatePartialAIAnalysis(
          userId,
          projectIdForCatch,
          failureStatus
        );
      } catch (writeError) {
        console.error("Failed to record regeneration failure:", writeError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to regenerate diagram. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
