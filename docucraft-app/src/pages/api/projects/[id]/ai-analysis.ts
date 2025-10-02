import type { APIRoute } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { FirestoreServerService } from "@/services/firestore-server";
import { validateAIAnalysis } from "@/utils/validation";

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    // Check authentication
    const sessionCookie = cookies.get("__session")?.value;
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const auth = getAuth(app);
    let user;
    let isAnonymous = false;

    try {
      const decodedCookie = await auth.verifySessionCookie(sessionCookie);
      user = await auth.getUser(decodedCookie.uid);
      isAnonymous = user.providerData.length === 0;
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authentication",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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

    const aiAnalysis = (body as { aiAnalysis?: unknown })?.aiAnalysis;

    // Validate AI analysis data structure
    if (!validateAIAnalysis(aiAnalysis)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid AI analysis data structure",
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
          message: "AI analysis saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the project with AI analysis for authenticated users only
    await FirestoreServerService.updateAIAnalysis(
      user.uid,
      projectId,
      aiAnalysis
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "AI analysis updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating AI analysis:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update AI analysis. Please try again.",
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
