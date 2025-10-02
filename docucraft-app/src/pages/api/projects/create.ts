import type { APIRoute } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { FirestoreServerService } from "@/services/firestore-server";
import type { Project } from "@/types/Project";
import { DEFAULT_PROJECT_IMAGE_ID } from "@/constants/images";
import { sanitizeProjectImageInput } from "@/utils/project";
import { validateProjectData } from "@/utils/validation";

export const POST: APIRoute = async ({ request, cookies }) => {
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

    if (!validateProjectData(body)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid project data structure",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const sanitizedImageId = sanitizeProjectImageInput(
      body.image ?? DEFAULT_PROJECT_IMAGE_ID
    );

    // Anonymous users cannot save to Firestore
    if (isAnonymous) {
      return new Response(
        JSON.stringify({
          success: true,
          isAnonymous: true,
          message: "Project created in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { name, description, keyObjectives, aiAnalysis } = body;

    // Create project data (timestamps will be added by the service)
    const projectData: Omit<
      Project,
      "id" | "userId" | "image" | "createdAt" | "updatedAt"
    > = {
      name: name.trim(),
      description: description.trim(),
      keyObjectives: keyObjectives.trim(),
      ...(aiAnalysis && { aiAnalysis }),
    };

    // Save to Firestore for authenticated users only
    const projectId = await FirestoreServerService.createProject(
      user.uid,
      projectData,
      sanitizedImageId
    );

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        userId: user.uid,
        message: "Project created successfully",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating project:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create project. Please try again.",
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
