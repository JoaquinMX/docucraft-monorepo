import type { APIRoute } from "astro";
import { FirestoreServerService } from "@/services/firestore-server";
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
        JSON.stringify({
          success: false,
          error: "Project ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON payload",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const erdData = (body as { erd?: string })?.erd;

    // Validate ERD data
    if (typeof erdData !== "string" || !erdData.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid ERD data - must be a non-empty string",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Anonymous users cannot save to Firestore
    if (isAnonymous) {
      return new Response(
        JSON.stringify({
          success: true,
          isAnonymous: true,
          message: "ERD saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the project's ERD for authenticated users only
    await FirestoreServerService.updatePartialAIAnalysis(
      user.uid,
      projectId,
      { erd: erdData.trim(), erdStatus: 'completed' }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "ERD updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating ERD:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update ERD. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};