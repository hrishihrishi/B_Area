/**
 * Next.js API proxy for /api/company → Spring Boot :8080/api/company
 *
 * Why this exists: Next.js App Router intercepts requests matching /api/**
 * if a route.ts file exists at that path. Rather than removing this file
 * and risking accidental 404s, we proxy it to the real backend so both
 * the direct URL (http://localhost:8080/api/company) and the proxied URL
 * (/api/company from the browser) work correctly.
 *
 * NOTE: In production, you should use next.config rewrites instead of
 * a proxy route like this. This is fine for MVP/dev.
 */

import { NextRequest, NextResponse } from "next/server";

const JAVA_BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
// Strip trailing /api if present so we can reconstruct the path cleanly
const BACKEND_ROOT = JAVA_BACKEND.replace(/\/api\/?$/, "");

async function proxy(request: NextRequest): Promise<NextResponse> {
  // Reconstruct the upstream URL by forwarding the original path + query string
  const upstreamUrl = `${BACKEND_ROOT}${request.nextUrl.pathname}${request.nextUrl.search}`;

  console.log("[company/route] Proxying:", request.method, upstreamUrl);

  try {
    const body = request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    const responseText = await upstream.text();
    console.log("[company/route] Upstream status:", upstream.status);

    return new NextResponse(responseText, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[company/route] Proxy error:", err);
    return NextResponse.json(
      { error: "Backend unavailable. Is the Spring Boot server running on :8080?" },
      { status: 502 },
    );
  }
}

export const GET    = proxy;
export const POST   = proxy;
export const PUT    = proxy;
export const DELETE = proxy;

