import type { APIRoute } from "astro";
import type { DiagramId } from "@/utils/aiAnalysis";
import { isValidDiagramId } from "@/utils/aiAnalysis";
import { guardSession } from "@/server/auth/session";
import { regenerateDiagram } from "@/server/aiRegeneration";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export const POST: APIRoute = async ({ params, cookies }) => {
  const session = await guardSession(cookies);
  if (!session.ok) {
    return session.response;
  }

  const { user, isAnonymous } = session;

  if (isAnonymous) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Anonymous users cannot regenerate diagrams",
      }),
      {
        status: 403,
        headers: JSON_HEADERS,
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
        headers: JSON_HEADERS,
      }
    );
  }

  const diagramId = diagramIdParam as DiagramId;

  const result = await regenerateDiagram({
    userId: user.uid,
    projectId,
    diagramId,
  });

  if (result.success) {
    return new Response(
      JSON.stringify({ success: true, partialUpdate: result.partialUpdate }),
      {
        status: result.status,
        headers: JSON_HEADERS,
      }
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: result.error }),
    {
      status: result.status,
      headers: JSON_HEADERS,
    }
  );
};
