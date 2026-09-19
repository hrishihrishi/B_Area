import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Company API is available.",
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      ok: true,
      payload,
      message: "Company payload received by Next API route.",
    },
    { status: 201 },
  );
}
