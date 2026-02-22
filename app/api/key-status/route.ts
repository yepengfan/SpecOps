import { NextResponse } from "next/server";

export function GET() {
  const configured = !!process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({ configured });
}
