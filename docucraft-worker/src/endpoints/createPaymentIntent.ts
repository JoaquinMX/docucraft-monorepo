import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { env } from "hono/adapter";
import { createStripeAdapter, PaymentIntentResponseSchema } from "../adapters/stripe";
import type { AppContext } from "../types";

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
              paymentIntent: PaymentIntentResponseSchema,
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

    const currencyExponent = getCurrencyExponent(currency);
    const amountInMinorUnits = toMinorCurrencyUnit(
      requestedAmount,
      currencyExponent
    );

    const { STRIPE_SECRET_KEY } = env(c) as Env;

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Stripe secret key is not configured" },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const stripe = createStripeAdapter({
      apiKey: STRIPE_SECRET_KEY,
    });

    const result = await stripe.createPaymentIntent({
      amount: amountInMinorUnits,
      currency,
      automaticPaymentMethodsEnabled: true,
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: result.error.message },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const THREE_DECIMAL_CURRENCIES = new Set([
  "bhd",
  "jod",
  "kwd",
  "omr",
  "tnd",
]);

function getCurrencyExponent(currency: string): number {
  if (THREE_DECIMAL_CURRENCIES.has(currency)) {
    return 3;
  }

  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return 0;
  }

  return 2;
}

function toMinorCurrencyUnit(amount: number, exponent: number): number {
  const multiplier = 10 ** exponent;
  return Math.round(amount * multiplier);
}
