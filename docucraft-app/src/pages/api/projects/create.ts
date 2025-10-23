import type { APIRoute } from "astro";
import { FirestoreServerService } from "@/services/firestore-server";
import type { Project } from "@/types/Project";
import { DEFAULT_PROJECT_IMAGE_ID } from "@/constants/images";
import { sanitizeProjectImageInput } from "@/utils/project";
import { validateProjectData } from "@/utils/validation";
import {
  createPendingAIAnalysis,
  isValidDiagramId,
} from "@/utils/aiAnalysis";
import { guardSession } from "@/server/auth/session";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const session = await guardSession(cookies);
    if (!session.ok) {
      return session.response;
    }

    const { user, isAnonymous } = session;

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

    const { name, description, keyObjectives, aiAnalysis, selectedDiagrams } =
      body;

    const sanitizedDiagrams = Array.isArray(selectedDiagrams)
      ? selectedDiagrams.filter((diagram) => isValidDiagramId(diagram))
      : [];

    const seededAIAnalysis =
      sanitizedDiagrams.length > 0
        ? {
            ...createPendingAIAnalysis(sanitizedDiagrams),
            ...(aiAnalysis ?? {}),
          }
        : aiAnalysis;

    // Create project data (timestamps will be added by the service)
    const projectData: Omit<
      Project,
      "id" | "userId" | "image" | "createdAt" | "updatedAt"
    > = {
      name: name.trim(),
      description: description.trim(),
      keyObjectives: keyObjectives.trim(),
      ...(seededAIAnalysis && { aiAnalysis: seededAIAnalysis }),
      ...(sanitizedDiagrams.length > 0 && { selectedDiagrams: sanitizedDiagrams }),
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
