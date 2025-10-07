import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { env } from "hono/adapter";
import type { AppContext } from "../types";
import {
  createPaymentIntent,
  type CreatePaymentIntentError,
  type CreatePaymentIntentResult,
} from "../services/stripePaymentService";

type Env = {
  STRIPE_SECRET_KEY: string;
};

const PaymentIntentRequestSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().trim().min(1).optional(),
});

export class CreatePaymentIntent extends OpenAPIRoute {
  schema = {
    tags: ["Payments"],
    summary: "Create a Stripe payment intent",
    description:
      "Creates a Stripe payment intent with a default amount of 20 USD unless overridden.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: PaymentIntentRequestSchema,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created Stripe payment intent",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              paymentIntent: z.object({
                id: z.string(),
                client_secret: z.string().optional(),
                status: z.string(),
              }),
            }),
          },
        },
      },
      "400": {
        description: "Stripe returned an error creating the payment intent",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.object({
                message: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext): Promise<Response> {
    const data = await this.getValidatedData<typeof this.schema>();
    const requestBody = data.body ?? {};

    const requestedAmount = requestBody.amount ?? 20;
    const currency = (requestBody.currency ?? "usd").toLowerCase();

    const { STRIPE_SECRET_KEY } = env(c) as Env;

    const result = await createPaymentIntent({
      amount: requestedAmount,
      currency,
      stripeSecretKey: STRIPE_SECRET_KEY,
    });

    return mapServiceResultToResponse(result);
  }
}

function mapServiceResultToResponse(result: CreatePaymentIntentResult): Response {
  if (result.ok) {
    return new Response(
      JSON.stringify({
        success: true,
        paymentIntent: result.paymentIntent,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const status = mapErrorTypeToStatus(result.error.type);

  return new Response(
    JSON.stringify({
      success: false,
      error: { message: result.error.message },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

function mapErrorTypeToStatus(
  type: CreatePaymentIntentError["error"]["type"]
): number {
  switch (type) {
    case "missing-secret-key":
      return 500;
    case "network-error":
      return 502;
    case "stripe-error":
    case "unexpected-response":
    default:
      return 400;
  }
}
