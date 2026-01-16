import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (email === "admin@instafit.com" && password === "admin123") {
    return NextResponse.json({
      success: true,
      token: "secure-admin-token",
    });
  }

  return NextResponse.json({ success: false });
}
