import type { APIRoute } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { FirestoreServerService } from "@/services/firestore-server";
import { InsufficientCreditsError } from "@/types/Billing";

const auth = getAuth(app);

export const POST: APIRoute = async ({ request, cookies }) => {
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

  let amount = 1;
  try {
    const body = await request.json();
    if (typeof body.amount === "number") {
      amount = body.amount;
    }
  } catch (error) {
    // Default amount is 1
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Amount must be a positive number",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const profile = await FirestoreServerService.consumeCredits(
      decodedCookie.uid,
      amount
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
    if (error instanceof InsufficientCreditsError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Insufficient credits",
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Failed to consume credits", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to consume credits",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
