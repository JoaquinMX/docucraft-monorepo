import { describe, expect, test } from "bun:test";
import { createWorkerClient } from "../workerClient";
import type { DiagramId } from "../../utils/aiAnalysis";

const baseUrl = "https://worker.example";
const payload = { text: "Request", selectedDiagrams: ["erd" as DiagramId] as const };

describe("workerClient", () => {
  test("returns parsed data on success", async () => {
    const fetchImpl: typeof fetch = async (url, init) => {
      expect(url).toBe("https://worker.example/api/ai");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({ "Content-Type": "application/json" });
      expect(init?.body).toBe(JSON.stringify(payload));

      return {
        ok: true,
        status: 200,
        statusText: "OK",
        async json() {
          return { results: { erd: { success: true } } };
        },
        clone() {
          return {
            async text() {
              return JSON.stringify({ results: { erd: { success: true } } });
            },
          } as unknown as Response;
        },
      } as unknown as Response;
    };

    const client = createWorkerClient({ baseUrl, fetchImpl });
    const result = await client.requestAIAnalysis(payload);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.results).toEqual({ erd: { success: true } });
    }
  });

  test("returns http error details when response is not ok", async () => {
    const fetchImpl: typeof fetch = async () =>
      ({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        clone() {
          return {
            async text() {
              return "Service offline";
            },
          } as unknown as Response;
        },
      } as unknown as Response);

    const client = createWorkerClient({ baseUrl, fetchImpl });
    const result = await client.requestAIAnalysis(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject({
        type: "http",
        status: 503,
        statusText: "Service Unavailable",
        bodyText: "Service offline",
      });
    }
  });

  test("returns network error when fetch throws", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError("Network error");
    };

    const client = createWorkerClient({ baseUrl, fetchImpl });
    const result = await client.requestAIAnalysis(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("network");
      expect(result.error.message).toContain("Unable to reach");
    }
  });

  test("returns parse error when response JSON is invalid", async () => {
    const fetchImpl: typeof fetch = async () =>
      ({
        ok: true,
        status: 200,
        statusText: "OK",
        async json() {
          throw new SyntaxError("Unexpected token");
        },
        clone() {
          return {
            async text() {
              return "{ invalid";
            },
          } as unknown as Response;
        },
      } as unknown as Response);

    const client = createWorkerClient({ baseUrl, fetchImpl });
    const result = await client.requestAIAnalysis(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject({ type: "parse", bodyText: "{ invalid" });
    }
  });
});
