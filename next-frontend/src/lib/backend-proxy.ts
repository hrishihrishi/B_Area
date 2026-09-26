import { NextRequest, NextResponse } from "next/server";

export function getBackendRoot(): string {
  const javaBackend =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
  return javaBackend.replace(/\/api\/?$/, "");
}

export async function proxyToBackend(
  request: NextRequest,
): Promise<NextResponse> {
  const upstreamUrl = `${getBackendRoot()}${request.nextUrl.pathname}${request.nextUrl.search}`;

  console.log("[backend-proxy]", request.method, upstreamUrl);

  try {
    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined;

    // Forward relevant headers (cookies, auth, csrf, etc.) from the original request
    const forwardedHeaders: Record<string, string> = Object.fromEntries(
      request.headers.entries(),
    );
    // Remove host header if present to avoid node-fetch/undici rejections
    delete forwardedHeaders.host;
    // Ensure Content-Type is set for upstream
    forwardedHeaders["content-type"] =
      forwardedHeaders["content-type"] ?? "application/json";

    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body,
    });

    const responseText = await upstream.text();

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(responseText, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[backend-proxy] error:", err);
    return NextResponse.json(
      {
        error:
          "Backend unavailable. Is the Spring Boot server running on :8080?",
      },
      { status: 502 },
    );
  }
}
