import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createPaymentIntent } from "../stripePaymentService";

describe("createPaymentIntent", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      delete (globalThis as Record<string, unknown>).fetch;
    }
    mock.restore();
  });

  it("creates a payment intent for zero-decimal currencies without scaling", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        id: "pi_123",
        status: "requires_payment_method",
      }),
      { status: 200 }
    );

    const fetchMock = mock(() => Promise.resolve(mockResponse));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createPaymentIntent({
      amount: 125,
      currency: "JPY",
      stripeSecretKey: "sk_test",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected successful result");

    const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("amount")).toBe("125");
    expect(body.get("currency")).toBe("jpy");
  });

  it("scales three-decimal currencies correctly", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        id: "pi_456",
        status: "requires_payment_method",
      }),
      { status: 200 }
    );

    const fetchMock = mock(() => Promise.resolve(mockResponse));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createPaymentIntent({
      amount: 10.1234,
      currency: "KWD",
      stripeSecretKey: "sk_test",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected successful result");

    const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("amount")).toBe("10123");
    expect(body.get("currency")).toBe("kwd");
  });

  it("maps Stripe error responses", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        error: {
          message: "Invalid amount",
        },
      }),
      { status: 400 }
    );

    const fetchMock = mock(() => Promise.resolve(mockResponse));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createPaymentIntent({
      amount: 20,
      currency: "USD",
      stripeSecretKey: "sk_test",
    });

    expect(result.ok).toBe(false);
    if (!("error" in result)) {
      throw new Error("Expected error result");
    }
    expect(result.error.type).toBe("stripe-error");
    expect(result.error.message).toBe("Invalid amount");
  });

  it("handles unexpected Stripe responses", async () => {
    const mockResponse = new Response(JSON.stringify({ foo: "bar" }), {
      status: 200,
    });

    const fetchMock = mock(() => Promise.resolve(mockResponse));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createPaymentIntent({
      amount: 20,
      currency: "USD",
      stripeSecretKey: "sk_test",
    });

    expect(result.ok).toBe(false);
    if (!("error" in result)) {
      throw new Error("Expected error result");
    }
    expect(result.error.type).toBe("unexpected-response");
  });

  it("returns a missing secret key error when the key is absent", async () => {
    const result = await createPaymentIntent({
      amount: 20,
      currency: "USD",
      stripeSecretKey: undefined,
    });

    expect(result.ok).toBe(false);
    if (!("error" in result)) {
      throw new Error("Expected error result");
    }
    expect(result.error.type).toBe("missing-secret-key");
  });

  it("reports network failures as network errors", async () => {
    const fetchMock = mock(() => Promise.reject(new Error("network down")));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createPaymentIntent({
      amount: 20,
      currency: "USD",
      stripeSecretKey: "sk_test",
    });

    expect(result.ok).toBe(false);
    if (!("error" in result)) {
      throw new Error("Expected error result");
    }
    expect(result.error.type).toBe("network-error");
    expect(result.error.message).toBe("network down");
  });
});
