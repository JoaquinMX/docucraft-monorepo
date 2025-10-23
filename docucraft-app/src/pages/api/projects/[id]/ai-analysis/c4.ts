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

    const c4Data = (body as { c4?: string })?.c4;

    // Validate C4 data
    if (typeof c4Data !== "string" || !c4Data.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid C4 data - must be a non-empty string",
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
          message: "C4 diagram saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the project's C4 diagram for authenticated users only
    await FirestoreServerService.updatePartialAIAnalysis(
      user.uid,
      projectId,
      { c4: c4Data.trim(), c4Status: 'completed' }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "C4 diagram updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating C4 diagram:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update C4 diagram. Please try again.",
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