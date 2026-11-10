import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleRequest } from "../../supabase/functions/create-donation-checkout/index.ts";

/**
 * These pin down the money path: the amount is validated here rather than in
 * the browser, and the two frequencies must produce different Stripe modes.
 */

const env: Record<string, string> = {};

const post = (body: unknown, origin = "https://behtjamaa.org") =>
  new Request("https://example.supabase.co/functions/v1/create-donation-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });

const bodyOf = (call: unknown[]) => new URLSearchParams((call[1] as RequestInit).body as string);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal("Deno", { env: { get: (key: string) => env[key] } });
  env.STRIPE_SECRET_KEY = "sk_test_123";
  delete env.SITE_URL;
  fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/pay/cs_test_1" }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("create-donation-checkout", () => {
  it("creates a one-time payment session for the entered amount", async () => {
    const res = await handleRequest(post({ amount: 75, frequency: "once" }));
    const json = await res.json();

    expect(json).toEqual({ ok: true, url: "https://checkout.stripe.com/c/pay/cs_test_1" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer sk_test_123");

    const params = bodyOf(fetchMock.mock.calls[0]);
    expect(params.get("mode")).toBe("payment");
    expect(params.get("line_items[0][price_data][unit_amount]")).toBe("7500");
    expect(params.get("line_items[0][price_data][recurring][interval]")).toBeNull();
    expect(params.get("payment_intent_data[metadata][source]")).toBe("donate-page");
  });

  it("creates a monthly subscription with a recurring price", async () => {
    await handleRequest(post({ amount: 50, frequency: "monthly" }));

    const params = bodyOf(fetchMock.mock.calls[0]);
    expect(params.get("mode")).toBe("subscription");
    expect(params.get("line_items[0][price_data][unit_amount]")).toBe("5000");
    expect(params.get("line_items[0][price_data][recurring][interval]")).toBe("month");
    // Stripe rejects payment_intent_data outside payment mode.
    expect(params.get("payment_intent_data[metadata][source]")).toBeNull();
  });

  it("sends the visitor back to the origin that started the checkout", async () => {
    await handleRequest(post({ amount: 25, frequency: "once" }, "https://staging.behtjamaa.org"));

    const params = bodyOf(fetchMock.mock.calls[0]);
    expect(params.get("success_url")).toBe(
      "https://staging.behtjamaa.org/donate?status=success&session_id={CHECKOUT_SESSION_ID}",
    );
    expect(params.get("cancel_url")).toBe("https://staging.behtjamaa.org/donate?status=cancelled");
  });

  it("falls back to SITE_URL when there is no Origin header", async () => {
    env.SITE_URL = "https://behtjamaa.org";
    const req = new Request("https://example.supabase.co/functions/v1/create-donation-checkout", {
      method: "POST",
      body: JSON.stringify({ amount: 25, frequency: "once" }),
    });

    await handleRequest(req);

    expect(bodyOf(fetchMock.mock.calls[0]).get("cancel_url")).toBe(
      "https://behtjamaa.org/donate?status=cancelled",
    );
  });

  it("refuses to start a checkout before the Stripe secret is configured", async () => {
    delete env.STRIPE_SECRET_KEY;

    const json = await handleRequest(post({ amount: 25, frequency: "once" })).then((r) => r.json());

    expect(json.ok).toBe(false);
    expect(json.error).toContain("STRIPE_SECRET_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["zero", 0],
    ["negative", -50],
    ["below the minimum", 0.5],
    ["not a number", "abc"],
    ["absent", undefined],
    ["absurd", 1_000_000],
  ])("rejects an amount that is %s", async (_label, amount) => {
    const json = await handleRequest(post({ amount, frequency: "once" })).then((r) => r.json());

    expect(json.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes Stripe's rejection message back to the visitor", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Invalid API Key provided: sk_test_123" } }), { status: 401 }),
    );

    const json = await handleRequest(post({ amount: 25, frequency: "once" })).then((r) => r.json());

    expect(json).toEqual({ ok: false, error: "Invalid API Key provided: sk_test_123" });
  });

  it("reports a network failure instead of throwing", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const json = await handleRequest(post({ amount: 25, frequency: "once" })).then((r) => r.json());

    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/couldn't reach the payment provider/i);
  });

  it("reports a session without a checkout URL", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: "cs_test_1" }), { status: 200 }));

    const json = await handleRequest(post({ amount: 25, frequency: "once" })).then((r) => r.json());

    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/did not return a checkout page/i);
  });

  it("answers preflight and wrong-method requests cleanly", async () => {
    const preflight = await handleRequest(
      new Request("https://example.supabase.co/functions/v1/create-donation-checkout", { method: "OPTIONS" }),
    );
    expect(preflight.status).toBe(200);

    const get = await handleRequest(
      new Request("https://example.supabase.co/functions/v1/create-donation-checkout", { method: "GET" }),
    );
    expect((await get.json()).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
