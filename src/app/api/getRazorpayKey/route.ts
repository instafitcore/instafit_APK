import { NextResponse } from "next/server";

export async function GET() {
  // Your Razorpay Key ID from Razorpay Dashboard
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

  if (!RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Razorpay key not configured" }, { status: 500 });
  }

  return NextResponse.json({ key: RAZORPAY_KEY_ID });
}
