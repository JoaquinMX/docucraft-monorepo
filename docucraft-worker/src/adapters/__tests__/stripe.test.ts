import { describe, expect, it } from "bun:test";
import { createStripeAdapter } from "../stripe";

describe("createStripeAdapter", () => {
  it("returns a payment intent when Stripe succeeds", async () => {
    const fetchMock: typeof fetch = async (_input, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({
        Authorization: "Bearer sk_test_123",
        "Content-Type": "application/x-www-form-urlencoded",
      });

      expect(init?.body).toBeInstanceOf(URLSearchParams);
      const body = init?.body as URLSearchParams | undefined;
      expect(body?.get("amount")).toBe("2000");
      expect(body?.get("currency")).toBe("usd");
      expect(body?.get("automatic_payment_methods[enabled]")).toBe("true");

      return new Response(
        JSON.stringify({
          id: "pi_123",
          client_secret: "secret",
          status: "requires_payment_method",
        }),
        { status: 200 },
      );
    };

    const stripe = createStripeAdapter({
      apiKey: "sk_test_123",
      fetch: fetchMock,
    });

    const result = await stripe.createPaymentIntent({
      amount: 2000,
      currency: "usd",
      automaticPaymentMethodsEnabled: true,
    });

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      paymentIntent: {
        id: "pi_123",
        client_secret: "secret",
        status: "requires_payment_method",
      },
    });
  });

  it("returns a structured error when Stripe responds with an error", async () => {
    const fetchMock: typeof fetch = async () =>
      new Response(
        JSON.stringify({ error: { message: "Invalid amount" } }),
        { status: 400 },
      );

    const stripe = createStripeAdapter({
      apiKey: "sk_test_123",
      fetch: fetchMock,
    });

    const result = await stripe.createPaymentIntent({
      amount: 50,
      currency: "usd",
    });

    expect(result.ok).toBe(false);
    expect(result).toEqual({
      ok: false,
      error: {
        type: "api_error",
        status: 400,
        message: "Invalid amount",
      },
    });
  });

  it("wraps network failures in a structured error", async () => {
    const fetchMock: typeof fetch = async () => {
      throw new Error("Network down");
    };

    const stripe = createStripeAdapter({
      apiKey: "sk_test_123",
      fetch: fetchMock,
    });

    const result = await stripe.createPaymentIntent({
      amount: 50,
      currency: "usd",
    });

    expect(result.ok).toBe(false);
    expect(result).toEqual({
      ok: false,
      error: {
        type: "network_error",
        message: "Network down",
      },
    });
  });
});
