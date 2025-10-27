import type { APIRoute } from "astro";
import { firestoreServerAdapter } from "@/services/firestore/server";
import { validateUserStory } from "@/utils/validation";
import type { UserStory } from "@/types/AIAnalysis";
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

    const userStoriesData = (body as { userStories?: UserStory[] })?.userStories;

    // Validate user stories data
    if (!Array.isArray(userStoriesData) || userStoriesData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user stories data - must be a non-empty array",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate each user story
    for (const story of userStoriesData) {
      if (!validateUserStory(story)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid user story structure",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Anonymous users cannot save to Firestore
    if (isAnonymous) {
      return new Response(
        JSON.stringify({
          success: true,
          isAnonymous: true,
          message: "User stories saved in memory for anonymous user",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the project's user stories for authenticated users only
    await firestoreServerAdapter.updatePartialAIAnalysis(
      user.uid,
      projectId,
      { userStories: userStoriesData, userStoriesStatus: "completed" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "User stories updated successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating user stories:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update user stories. Please try again.",
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
