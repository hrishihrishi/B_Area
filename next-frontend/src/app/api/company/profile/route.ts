import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      ok: true,
      message: "Company profile saved",
      data: payload,
    },
    { status: 201 },
  );
}

export async function PUT(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    ok: true,
    message: "Company profile updated",
    data: payload,
  });
}
