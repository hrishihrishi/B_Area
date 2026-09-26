import test from "node:test";
import assert from "node:assert/strict";

test("api client falls back to a same-origin /api URL when no API base is configured", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  delete process.env.NEXT_PUBLIC_API_BASE_URL;

  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, _init?: RequestInit) => {
    calls.push(String(input));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const mod = await import(`./api-client.ts?test=${Date.now()}`);
    await mod.api.post("/company/profile", { hello: "world" });
    assert.deepEqual(calls, ["/api/company/profile"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiBase === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
  }
});
