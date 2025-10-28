import { DIAGRAM_CONFIG } from "../../utils/aiAnalysis";
import type { DiagramId } from "../../utils/aiAnalysis";
import type { FormElements } from "./types";

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40",
  completed: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
  failed: "bg-red-500/10 text-red-300 border border-red-500/40",
};

export function getFormElements(): FormElements | null {
  const form = document.getElementById("projectForm") as HTMLFormElement | null;
  const submitButton = document.getElementById("submitButton") as HTMLButtonElement | null;
  const buttonText = document.getElementById("buttonText") as HTMLSpanElement | null;
  const loadingSpinner = document.getElementById("loadingSpinner") as HTMLDivElement | null;
  const errorMessage = document.getElementById("errorMessage") as HTMLDivElement | null;
  const progressContainer = document.getElementById("progressContainer") as HTMLDivElement | null;
  const progressItems = document.getElementById("progressItems") as HTMLDivElement | null;

  if (
    !form ||
    !submitButton ||
    !buttonText ||
    !loadingSpinner ||
    !errorMessage ||
    !progressContainer ||
    !progressItems
  ) {
    return null;
  }

  return {
    form,
    submitButton,
    buttonText,
    loadingSpinner,
    errorMessage,
    progressContainer,
    progressItems,
  };
}

export function setSubmittingState(elements: FormElements, isSubmitting: boolean): void {
  elements.submitButton.disabled = isSubmitting;
  elements.buttonText.textContent = isSubmitting ? "Creating Project..." : "Create Project";

  if (isSubmitting) {
    elements.loadingSpinner.classList.remove("hidden");
  } else {
    elements.loadingSpinner.classList.add("hidden");
  }
}

export function renderProgress(
  elements: Pick<FormElements, "progressContainer" | "progressItems">,
  diagrams: DiagramId[],
  aiAnalysis: Record<string, any>
): void {
  elements.progressContainer.classList.remove("hidden");
  elements.progressItems.innerHTML = "";

  diagrams.forEach((diagramId) => {
    const config = DIAGRAM_CONFIG[diagramId];
    const status = (aiAnalysis?.[config.statusField] as string) || "pending";
    const chipClass = statusClasses[status] || statusClasses.pending;

    const item = document.createElement("div");
    item.className =
      "flex items-center justify-between rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2";
    item.innerHTML = `
      <span class="text-white text-sm font-medium">${config.label}</span>
      <span class="text-xs font-medium px-2 py-1 rounded-full ${chipClass}">
        ${status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    `;

    elements.progressItems.appendChild(item);
  });
}

export function hideProgress(elements: Pick<FormElements, "progressContainer">): void {
  elements.progressContainer.classList.add("hidden");
}

export function showError(elements: FormElements, message: string): void {
  const text = elements.errorMessage.querySelector("p");
  if (text) {
    text.textContent = message;
  }
  elements.errorMessage.classList.remove("hidden");
}

export function hideError(elements: FormElements): void {
  elements.errorMessage.classList.add("hidden");
}
