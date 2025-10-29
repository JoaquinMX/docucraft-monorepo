import { z } from "zod";

const PaymentIntentResponseSchema = z.object({
  id: z.string(),
  client_secret: z.string().optional(),
  status: z.string(),
});

export type StripePaymentIntent = z.infer<typeof PaymentIntentResponseSchema>;

export type StripePaymentIntentResult =
  | { ok: true; paymentIntent: StripePaymentIntent }
  | { ok: false; error: StripeError };

export type StripeError =
  | { type: "api_error"; status: number; message: string }
  | { type: "invalid_response"; message: string }
  | { type: "network_error"; message: string };

export interface StripeAdapter {
  createPaymentIntent(
    input: StripePaymentIntentInput,
  ): Promise<StripePaymentIntentResult>;
}

export type StripePaymentIntentInput = {
  amount: number;
  currency: string;
  automaticPaymentMethodsEnabled?: boolean;
};

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type StripeAdapterOptions = {
  apiKey: string;
  fetch?: FetchLike;
};

export function createStripeAdapter({
  apiKey,
  fetch: fetchImpl = fetch,
}: StripeAdapterOptions): StripeAdapter {
  return {
    async createPaymentIntent({
      amount,
      currency,
      automaticPaymentMethodsEnabled,
    }) {
      const body = new URLSearchParams();
      body.append("amount", amount.toString());
      body.append("currency", currency);

      if (automaticPaymentMethodsEnabled !== undefined) {
        body.append(
          "automatic_payment_methods[enabled]",
          automaticPaymentMethodsEnabled ? "true" : "false",
        );
      }

      let response: Response;

      try {
        response = await fetchImpl("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });
      } catch (error) {
        return {
          ok: false,
          error: {
            type: "network_error",
            message:
              error instanceof Error ? error.message : "Failed to reach Stripe",
          },
        } satisfies StripePaymentIntentResult;
      }

      const stripeData = await response.json<unknown>();

      if (!response.ok) {
        const message =
          (stripeData as { error?: { message?: string } })?.error?.message ??
          "Failed to create payment intent";

        return {
          ok: false,
          error: {
            type: "api_error",
            status: response.status,
            message,
          },
        } satisfies StripePaymentIntentResult;
      }

      const parsed = PaymentIntentResponseSchema.safeParse(stripeData);

      if (!parsed.success) {
        return {
          ok: false,
          error: {
            type: "invalid_response",
            message: "Unexpected Stripe response structure",
          },
        } satisfies StripePaymentIntentResult;
      }

      return {
        ok: true,
        paymentIntent: parsed.data,
      } satisfies StripePaymentIntentResult;
    },
  } satisfies StripeAdapter;
}

export { PaymentIntentResponseSchema };
