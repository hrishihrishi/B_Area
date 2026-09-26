import { NextRequest, NextResponse } from "next/server";
import { getBackendRoot } from "@/lib/backend-proxy";

type RouteContext = { params: Promise<{ companyId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { companyId } = await context.params;
  const upstreamUrl = `${getBackendRoot()}/api/company/${companyId}/stores${request.nextUrl.search}`;

  try {
    const upstream = await fetch(upstreamUrl, { method: "GET" });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable." }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { companyId } = await context.params;
  const upstreamUrl = `${getBackendRoot()}/api/company/${companyId}/stores`;
  const body = await request.text();

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable." }, { status: 502 });
  }
}
