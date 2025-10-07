import { z } from "zod";

const PaymentIntentResponseSchema = z.object({
  id: z.string(),
  client_secret: z.string().optional(),
  status: z.string(),
});

export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;

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

export type CreatePaymentIntentParams = {
  amount: number;
  currency: string;
  stripeSecretKey?: string | null;
};

export type CreatePaymentIntentSuccess = {
  ok: true;
  paymentIntent: PaymentIntentResponse;
};

export type CreatePaymentIntentError = {
  ok: false;
  error:
    | { type: "missing-secret-key"; message: string }
    | { type: "stripe-error"; message: string }
    | { type: "unexpected-response"; message: string }
    | { type: "network-error"; message: string };
};

export type CreatePaymentIntentResult =
  | CreatePaymentIntentSuccess
  | CreatePaymentIntentError;

export async function createPaymentIntent({
  amount,
  currency,
  stripeSecretKey,
}: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> {
  if (!stripeSecretKey) {
    return {
      ok: false,
      error: {
        type: "missing-secret-key",
        message: "Stripe secret key is not configured",
      },
    };
  }

  const normalizedCurrency = currency.toLowerCase();
  const currencyExponent = getCurrencyExponent(normalizedCurrency);
  const amountInMinorUnits = toMinorCurrencyUnit(amount, currencyExponent);
  const body = buildPaymentIntentRequestBody(amountInMinorUnits, normalizedCurrency);

  try {
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const stripeData = await stripeResponse.json<unknown>();

    if (!stripeResponse.ok) {
      const errorMessage =
        (stripeData as { error?: { message?: string } })?.error?.message ??
        "Failed to create payment intent";

      return {
        ok: false,
        error: {
          type: "stripe-error",
          message: errorMessage,
        },
      };
    }

    const parsedStripeData = PaymentIntentResponseSchema.safeParse(stripeData);

    if (!parsedStripeData.success) {
      return {
        ok: false,
        error: {
          type: "unexpected-response",
          message: "Unexpected Stripe response structure",
        },
      };
    }

    return {
      ok: true,
      paymentIntent: parsedStripeData.data,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reach Stripe to create payment intent";

    return {
      ok: false,
      error: {
        type: "network-error",
        message,
      },
    };
  }
}

function buildPaymentIntentRequestBody(amount: number, currency: string) {
  const body = new URLSearchParams();
  body.append("amount", amount.toString());
  body.append("currency", currency);
  body.append("automatic_payment_methods[enabled]", "true");
  return body;
}

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
