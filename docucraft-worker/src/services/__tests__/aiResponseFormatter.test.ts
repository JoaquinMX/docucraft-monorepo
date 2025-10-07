import { describe, expect, it } from "bun:test";
import {
  formatDiagramResponse,
  formatJsonResponse,
  formatMermaidResponse,
} from "../aiResponseFormatter";

describe("aiResponseFormatter", () => {
  it("strips mermaid code fences", () => {
    const input = "```mermaid\ngraph TD;\nA-->B\n```";
    expect(formatMermaidResponse(input)).toBe("graph TD;\nA-->B");
  });

  it("normalizes JSON content inside code fences", () => {
    const input = "```json\n{\"name\":\"DocuCraft\"}\n```";
    expect(formatJsonResponse(input)).toBe('{"name":"DocuCraft"}');
  });

  it("cleans escaped JSON payloads", () => {
    const input = '{"name":"DocuCraft","details":"Line1\\nLine2"}';
    expect(formatJsonResponse(input)).toBe(
      '{"name":"DocuCraft","details":"Line1\\nLine2"}',
    );
  });

  it("throws when JSON cannot be normalized", () => {
    expect(() => formatJsonResponse("not-json")).toThrow(
      "Unable to normalize AI JSON response",
    );
  });

  it("delegates formatting based on diagram type", () => {
    const mermaid = formatDiagramResponse(
      "mermaid",
      "```mermaid\nsequenceDiagram\nA->>B: Hi\n```",
    );
    const json = formatDiagramResponse(
      "json",
      "```json\n{\"ok\":true}\n```",
    );

    expect(mermaid).toBe("sequenceDiagram\nA->>B: Hi");
    expect(json).toBe('{"ok":true}');
  });
});
