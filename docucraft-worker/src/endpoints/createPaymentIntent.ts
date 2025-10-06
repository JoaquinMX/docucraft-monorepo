import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { env } from "hono/adapter";
import type { AppContext } from "../types";

type Env = {
  STRIPE_SECRET_KEY: string;
};

const PaymentIntentResponseSchema = z.object({
  id: z.string(),
  client_secret: z.string().optional(),
  status: z.string(),
});

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

    const body = new URLSearchParams();
    body.append("amount", amountInMinorUnits.toString());
    body.append("currency", currency);
    body.append("automatic_payment_methods[enabled]", "true");

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const stripeData = await stripeResponse.json<unknown>();

    if (!stripeResponse.ok) {
      const errorMessage =
        (stripeData as { error?: { message?: string } })?.error?.message ??
        "Failed to create payment intent";

      return new Response(
        JSON.stringify({
          success: false,
          error: { message: errorMessage },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const parsedStripeData = PaymentIntentResponseSchema.safeParse(stripeData);

    if (!parsedStripeData.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: "Unexpected Stripe response structure" },
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
        paymentIntent: parsedStripeData.data,
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
