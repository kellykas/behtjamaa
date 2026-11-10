/**
 * Starts a real payment for the Donate page.
 *
 * The browser holds only Supabase's publishable key, and a Stripe Checkout
 * Session has to be created with the secret key, so the session is built here
 * and the browser is only handed back the hosted checkout URL. Nothing about
 * the amount is trusted from the page beyond "how much did the visitor type" —
 * the price itself is assembled here from that number, so a caller cannot ask
 * for a $0 checkout or reuse a cheap price for a larger amount.
 *
 * The visitor is never sent card details through this app: Stripe hosts the
 * form, which keeps the project out of PCI scope.
 *
 * Setup (one time, in the Supabase dashboard for this project):
 *   Edge Functions → Secrets → STRIPE_SECRET_KEY = sk_live_… (or sk_test_…)
 *   then deploy this function:
 *     supabase functions deploy create-donation-checkout --project-ref <ref>
 *
 * Called from the app with
 *   supabase.functions.invoke("create-donation-checkout", { body: { amount, frequency } })
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Always answer 200 with an envelope so the client can show the real reason
// instead of a generic "Failed to fetch" from a non-2xx response.
const reply = (payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fail = (error: string) => reply({ ok: false, error });

// Stripe's minimum charge is 50¢; the ceiling is a sanity guard against a
// typo turning into a five-figure charge.
const MIN_DONATION_USD = 1;
const MAX_DONATION_USD = 50_000;

type Frequency = "once" | "monthly";

/**
 * Deno's globals are read through globalThis so this module also typechecks
 * and unit-tests under Node, where `Deno` does not exist.
 */
const env = (key: string): string | undefined =>
  (globalThis as { Deno?: { env?: { get(name: string): string | undefined } } }).Deno?.env?.get(key);

interface Body {
  amount?: number | string;
  frequency?: string;
}

/**
 * Where Stripe sends the visitor back to. The Origin header is set by the
 * browser, so it identifies the site the checkout was started from without
 * needing another secret; SITE_URL is the fallback for non-browser callers.
 */
const resolveOrigin = (req: Request): string | null => {
  const candidates = [req.headers.get("origin") ?? "", env("SITE_URL") ?? ""];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // Not a URL — try the next candidate.
    }
  }
  return null;
};

export const handleRequest = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed.");

  const secretKey = env("STRIPE_SECRET_KEY");
  if (!secretKey) {
    return fail("Giving is not connected yet. Add the STRIPE_SECRET_KEY secret to the project, then try again.");
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("Could not read the request.");
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount)) return fail("Choose a donation amount first.");

  const amountInCents = Math.round(amount * 100);
  if (amountInCents < MIN_DONATION_USD * 100) return fail(`The smallest donation is $${MIN_DONATION_USD}.`);
  if (amountInCents > MAX_DONATION_USD * 100) return fail(`For gifts over $${MAX_DONATION_USD.toLocaleString()}, please use the bank transfer details.`);

  const frequency: Frequency = body.frequency === "monthly" ? "monthly" : "once";
  const isMonthly = frequency === "monthly";

  const origin = resolveOrigin(req);
  if (!origin) return fail("Could not work out which site to return to. Please reload and try again.");

  const params = new URLSearchParams();
  params.set("mode", isMonthly ? "subscription" : "payment");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(amountInCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    isMonthly ? "Monthly donation to BEHT JAMAA" : "Donation to BEHT JAMAA",
  );
  if (isMonthly) params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("success_url", `${origin}/donate?status=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/donate?status=cancelled`);
  params.set("metadata[source]", "donate-page");
  params.set("metadata[frequency]", frequency);
  // payment_intent_data only exists in payment mode; subscriptions reject it.
  if (!isMonthly) params.set("payment_intent_data[metadata][source]", "donate-page");

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
  } catch {
    return fail("We couldn't reach the payment provider. Please try again in a moment.");
  }

  const session = (await response.json().catch(() => null)) as
    | { url?: string; error?: { message?: string } }
    | null;

  if (!response.ok) {
    // Stripe's message is safe to show (it names the misconfigured key or
    // account), and hiding it would leave the visitor with no way forward.
    return fail(session?.error?.message ?? "The payment provider rejected the checkout. Please try again.");
  }

  if (!session?.url) return fail("The payment provider did not return a checkout page. Please try again.");

  return reply({ ok: true, url: session.url });
};

const deno = (globalThis as { Deno?: { serve?: (handler: (req: Request) => Promise<Response>) => unknown } }).Deno;
if (deno?.serve) deno.serve(handleRequest);
