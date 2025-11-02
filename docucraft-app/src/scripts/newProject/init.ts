import {
  createPendingAIAnalysis,
  type DiagramId,
} from "../../utils/aiAnalysis";
import { getFormElements, hideError, hideProgress, renderProgress, setSubmittingState, showError } from "./dom";
import { getProjectFormValues, buildAIRequestText, storeProjectLocally, storeAIResponseLocally } from "./form";
import { createProject, persistFailureStatus, persistPartialAIAnalysis } from "./projectApi";
import { generateAIAnalyses } from "./aiOrchestrator";
import { formatWorkerClientError } from "../../services/workerClient";
import { subscribeToProgress } from "./progressSubscription";
import type { NewProjectContext, ProjectCreationResponse } from "./types";

function resolveProjectId(response: ProjectCreationResponse): string {
  if (response.projectId) {
    return response.projectId;
  }

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `temp-${Date.now()}`;
}

function setupProgressSubscription(
  response: ProjectCreationResponse,
  diagrams: DiagramId[],
  context: NewProjectContext,
  onUpdate: (aiAnalysis: Record<string, unknown>) => void
): (() => void) | null {
  if (!response.userId || !response.projectId || diagrams.length === 0) {
    return null;
  }

  return subscribeToProgress({
    db: context.db,
    userId: response.userId,
    projectId: response.projectId,
    diagrams,
    onUpdate,
  });
}

export function initNewProjectPage(context: NewProjectContext): void {
  const elements = getFormElements();

  if (!elements) {
    console.error("Required form elements not found");
    return;
  }

  let unsubscribeProgress: (() => void) | null = null;

  document.addEventListener("astro:beforeunload", () => {
    if (unsubscribeProgress) {
      unsubscribeProgress();
      unsubscribeProgress = null;
    }
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideError(elements);
    setSubmittingState(elements, true);

    try {
      const values = getProjectFormValues(elements.form);

      if (values.selectedDiagrams.length > 0) {
        renderProgress(
          elements,
          values.selectedDiagrams,
          createPendingAIAnalysis(values.selectedDiagrams)
        );
      }

      const aiRequestText = buildAIRequestText(values);
      const projectResponse = await createProject(values);
      const isAnonymous = Boolean(projectResponse.isAnonymous);
      if (!isAnonymous && !projectResponse.projectId) {
        throw new Error("Missing project identifier from server response");
      }
      const resolvedProjectId = resolveProjectId(projectResponse);

      storeProjectLocally(resolvedProjectId, values);

      if (unsubscribeProgress) {
        unsubscribeProgress();
        unsubscribeProgress = null;
      }

      if (!isAnonymous && projectResponse.projectId && values.selectedDiagrams.length > 0) {
        unsubscribeProgress = setupProgressSubscription(
          projectResponse,
          values.selectedDiagrams,
          context,
          (aiAnalysis) => renderProgress(elements, values.selectedDiagrams, aiAnalysis)
        );
      }

      const partialUpdateHandler = async (
        diagramId: DiagramId,
        partial: Record<string, unknown>
      ) => {
        if (!projectResponse.projectId) {
          return;
        }

        try {
          await persistPartialAIAnalysis(projectResponse.projectId, partial);
        } catch (error) {
          console.warn(
            "Failed to persist partial AI analysis update for diagram",
            diagramId,
            error
          );
        }
      };

      const failureStatusHandler = async (
        diagramId: DiagramId,
        partialStatus: Record<string, unknown>
      ) => {
        if (!projectResponse.projectId) {
          return;
        }

        const [statusField] = Object.keys(partialStatus);

        if (!statusField) {
          return;
        }

        try {
          await persistFailureStatus(
            projectResponse.projectId,
            diagramId,
            statusField
          );
        } catch (error) {
          console.warn("Failed to persist failure status for diagram", diagramId, error);
        }
      };

      const aiResult = await generateAIAnalyses({
        diagramIds: values.selectedDiagrams,
        workerUrl: context.workerUrl,
        aiRequestText,
        isAnonymous,
        projectId: projectResponse.projectId,
        onPartialUpdate: isAnonymous ? undefined : partialUpdateHandler,
        onFailureStatus: isAnonymous ? undefined : failureStatusHandler,
      });

      if (!aiResult.success) {
        const message = aiResult.error
          ? formatWorkerClientError(aiResult.error)
          : "We couldn't generate diagrams at this time. Please try again.";
        showError(elements, message);
        setSubmittingState(elements, false);
        hideProgress(elements);
        return;
      }

      storeAIResponseLocally(aiResult);

      const redirectUrl = isAnonymous
        ? "/new-project/ai-response"
        : `/projects/${projectResponse.projectId}`;

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error creating project:", error);

      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      showError(elements, message);
      setSubmittingState(elements, false);
      hideProgress(elements);
    }
  });
}
