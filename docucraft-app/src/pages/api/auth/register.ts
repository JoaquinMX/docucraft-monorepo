import type { APIRoute } from "astro";
import { getAuth } from "firebase-admin/auth";
import { app } from "../../../firebase/server";
import { FirestoreServerService } from "@/services/firestore-server";
import { validateProjectData } from "@/utils/validation";
import type { Project } from "@/types/Project";

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = getAuth(app);

  try {
    /* Obtener los datos del formulario */
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing form data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    /* Crear un usuario */
    let user;
    try {
      user = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    /* Get project data from form if available */
    const projectDataJson = formData.get("projectData")?.toString();
    const aiResponseJson = formData.get("aiResponse")?.toString();

    let projectId: string | null = null;

    if (projectDataJson && aiResponseJson) {
      try {
        const projectData = JSON.parse(projectDataJson);
        const aiResponse = JSON.parse(aiResponseJson);

        // Validate project data
        if (validateProjectData(projectData)) {
          // Create project data for Firestore
          const firestoreProjectData: Omit<
            Project,
            "id" | "userId" | "image" | "createdAt" | "updatedAt"
          > = {
            name: projectData.name.trim(),
            description: projectData.description.trim(),
            keyObjectives: projectData.keyObjectives.trim(),
            aiAnalysis: aiResponse,
          };

          // Store image id (default to alpha if not specified)
          const imageId = projectData.image || "alpha";

          // Save project to Firestore
          projectId = await FirestoreServerService.createProject(
            user.uid,
            firestoreProjectData,
            imageId
          );
        }
      } catch (error) {
        console.error("Error saving project:", error);
        // Continue with registration even if project save fails
      }
    }

    // Note: We don't create a session cookie here
    // The user will need to sign in using the regular signin flow
    // This is more secure and follows Firebase Auth best practices

    /* Return success response with project info */
    return new Response(
      JSON.stringify({
        success: true,
        userId: user.uid,
        projectId,
        message: projectId
          ? "Account created and project saved successfully"
          : "Account created successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Registration failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
