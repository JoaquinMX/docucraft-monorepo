import type { DiagramId } from "../utils/aiAnalysis";

export interface WorkerClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export interface WorkerAIRequestPayload {
  text: string;
  selectedDiagrams: readonly DiagramId[];
}

export interface WorkerAIResponse {
  results?: Record<string, unknown>;
  [key: string]: unknown;
}

export type WorkerClientError =
  | {
      type: "network";
      message: string;
      cause?: unknown;
    }
  | {
      type: "http";
      status: number;
      statusText?: string;
      bodyText?: string;
    }
  | {
      type: "parse";
      message: string;
      bodyText?: string;
    }
  | {
      type: "unknown";
      message: string;
      cause?: unknown;
    };

export type WorkerClientResult<TResponse> =
  | { ok: true; data: TResponse }
  | { ok: false; error: WorkerClientError };

export interface WorkerClient {
  requestAIAnalysis(
    payload: WorkerAIRequestPayload
  ): Promise<WorkerClientResult<WorkerAIResponse>>;
}

function resolveUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}

function createNetworkError(cause: unknown): WorkerClientError {
  return {
    type: "network",
    message: "Unable to reach the AI worker service",
    cause,
  };
}

function createHttpError(response: Response, bodyText?: string): WorkerClientError {
  return {
    type: "http",
    status: response.status,
    statusText: response.statusText,
    bodyText,
  };
}

function createParseError(bodyText?: string): WorkerClientError {
  return {
    type: "parse",
    message: "Received an invalid response from the AI worker service",
    bodyText,
  };
}

async function tryReadBodyText(response: Response | null): Promise<string | undefined> {
  if (!response || typeof response.text !== "function") {
    return undefined;
  }

  try {
    return await response.text();
  } catch (error) {
    console.warn("Failed to read worker response body", error);
    return undefined;
  }
}

export function formatWorkerClientError(error: WorkerClientError): string {
  switch (error.type) {
    case "network":
      return "We couldn't reach the AI worker. Check your connection and try again.";
    case "http": {
      const statusMessage = error.statusText ? ` (${error.statusText})` : "";
      if (error.status >= 500) {
        return "The AI worker encountered an internal error. Please try again in a moment.";
      }
      return `The AI worker returned an unexpected response: ${error.status}${statusMessage}.`;
    }
    case "parse":
      return "The AI worker returned data we couldn't understand. Please try again.";
    case "unknown":
      return error.message;
    default: {
      const exhaustive: never = error;
      return exhaustive;
    }
  }
}

export function createWorkerClient({
  baseUrl,
  fetchImpl = fetch,
}: WorkerClientOptions): WorkerClient {
  const resolvedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return {
    async requestAIAnalysis(
      payload: WorkerAIRequestPayload
    ): Promise<WorkerClientResult<WorkerAIResponse>> {
      const url = resolveUrl(resolvedBase, "api/ai");
      let response: Response;

      try {
        response = await fetchImpl(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        return { ok: false, error: createNetworkError(error) };
      }

      const responseClone = typeof response.clone === "function" ? response.clone() : null;

      if (!response.ok) {
        const bodyText = await tryReadBodyText(responseClone);
        return { ok: false, error: createHttpError(response, bodyText) };
      }

      try {
        const data = (await response.json()) as WorkerAIResponse;
        return { ok: true, data };
      } catch (error) {
        const bodyText = await tryReadBodyText(responseClone);
        return { ok: false, error: createParseError(bodyText) };
      }
    },
  };
}
