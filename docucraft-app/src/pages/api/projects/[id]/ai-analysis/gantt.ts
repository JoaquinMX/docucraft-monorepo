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

    const ganttData = (body as { gantt?: string })?.gantt;

    // Validate gantt data
    if (typeof ganttData !== "string" || !ganttData.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid gantt data - must be a non-empty string",
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
          message: "Gantt chart saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the project's gantt chart for authenticated users only
    await FirestoreServerService.updatePartialAIAnalysis(
      user.uid,
      projectId,
      { gantt: ganttData.trim(), ganttStatus: 'completed' }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Gantt chart updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating gantt chart:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update gantt chart. Please try again.",
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