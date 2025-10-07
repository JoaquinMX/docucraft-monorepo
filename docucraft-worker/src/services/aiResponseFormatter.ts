export type DiagramFormat = "mermaid" | "json";

function stripCodeFence(text: string, language?: string): string {
  let cleaned = text;

  if (language) {
    const languageFence = new RegExp("```" + language + "\\s*", "gi");
    cleaned = cleaned.replace(languageFence, "");
  }

  return cleaned.replace(/```/g, "");
}

export function formatMermaidResponse(text: string): string {
  return stripCodeFence(text, "mermaid").trim();
}

export function formatJsonResponse(text: string): string {
  let cleaned = stripCodeFence(text, "json").trim();

  const attemptNormalize = (value: string): string | null => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch (error) {
      return null;
    }
  };

  let normalized = attemptNormalize(cleaned);

  if (normalized) {
    return normalized;
  }

  if (cleaned.includes("\\n") || cleaned.includes('\"')) {
    const unescaped = cleaned
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    normalized = attemptNormalize(unescaped);

    if (normalized) {
      return normalized;
    }

    cleaned = unescaped;
  }

  const reescaped = cleaned
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"')
    .replace(/\\/g, "\\\\");

  normalized = attemptNormalize(reescaped);

  if (!normalized) {
    throw new Error("Unable to normalize AI JSON response");
  }

  return normalized;
}

export function formatDiagramResponse(
  diagramFormat: DiagramFormat,
  text: string,
): string {
  if (diagramFormat === "json") {
    return formatJsonResponse(text);
  }

  return formatMermaidResponse(text);
}
