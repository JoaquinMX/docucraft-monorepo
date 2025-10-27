import type { APIRoute } from "astro";
import { firestoreServerAdapter } from "@/services/firestore/server";
import { validatePartialAIAnalysis } from "@/utils/validation";
import { guardSession } from "@/server/auth/session";

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const session = await guardSession(cookies);
    if (!session.ok) {
      return session.response;
    }

    const { user, isAnonymous } = session;

    const projectId = params.id;

    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, error: "Project ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const partialAIAnalysis = (body as { partialAIAnalysis?: unknown })
      ?.partialAIAnalysis;

    if (!validatePartialAIAnalysis(partialAIAnalysis)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid AI analysis data structure",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (isAnonymous) {
      return new Response(
        JSON.stringify({
          success: true,
          isAnonymous: true,
          message: "AI analysis saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await firestoreServerAdapter.updatePartialAIAnalysis(
      user.uid,
      projectId,
      partialAIAnalysis
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "AI analysis updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating partial AI analysis:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update AI analysis. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
