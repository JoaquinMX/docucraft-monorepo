import type { APIRoute } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { BILLING_PLANS } from "@/constants/billing";
import { FirestoreServerService } from "@/services/firestore-server";

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

  let body: { planId?: string; paymentIntentId?: string } = {};
  try {
    body = await request.json();
  } catch (error) {
    // ignore, handled below
  }

  const planId = body.planId;
  if (!planId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Plan ID is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const plan = BILLING_PLANS[planId];

  if (!plan) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unknown plan",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const profile = await FirestoreServerService.applyPlanToUser(
      decodedCookie.uid,
      plan.id,
      plan.credits,
      plan.isSubscription,
      body.paymentIntentId
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
    console.error("Failed to grant plan", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to grant plan",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
