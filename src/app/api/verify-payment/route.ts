import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      bookingData 
    } = await req.json();

    // 1. Verify the Signature (Proves the payment is real)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Transaction forgery detected" }, { status: 400 });
    }

    // 2. If valid, save to Supabase using the SERVICE ROLE KEY (Bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([{ 
        ...bookingData, 
        payment_id: razorpay_payment_id, 
        status: "Paid" 
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data[0] });

  } catch (err: any) {
    console.error("Verification Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}