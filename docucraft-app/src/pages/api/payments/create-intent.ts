import type { APIRoute } from "astro";

const resolveWorkerUrl = () =>
  process.env.WORKER_URL ?? import.meta.env.WORKER_URL ?? "";

export const POST: APIRoute = async ({ request }) => {
  const workerUrl = resolveWorkerUrl();

  if (!workerUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Worker URL is not configured",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch (error) {
    // Default to empty payload when no JSON body is provided
    payload = {};
  }

  try {
    const response = await fetch(`${workerUrl.replace(/\/$/, "")}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok || !responseBody) {
      const errorMessage =
        (responseBody as { error?: { message?: string } })?.error?.message ??
        `Failed to create payment intent (status ${response.status})`;

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const clientSecret = (responseBody as { paymentIntent?: { client_secret?: string } })
      ?.paymentIntent?.client_secret;

    if (!clientSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment intent did not include a client secret",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret,
        paymentIntent: (responseBody as { paymentIntent?: unknown })?.paymentIntent,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to proxy payment intent request", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to create payment intent",
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
