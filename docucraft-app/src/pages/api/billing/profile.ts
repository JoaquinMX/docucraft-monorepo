import type { APIRoute } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { FirestoreServerService } from "@/services/firestore-server";

const auth = getAuth(app);

export const GET: APIRoute = async ({ cookies }) => {
  const sessionCookie = cookies.get("__session")?.value;

  if (!sessionCookie) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const profile = await FirestoreServerService.getOrCreateUserBillingProfile(
      decodedCookie.uid
    );

    return new Response(
      JSON.stringify({
        success: true,
        profile,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to load billing profile", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to load billing profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
