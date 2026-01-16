import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    // 1. Validate env
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      return new Response(JSON.stringify({ error: "Missing Razorpay Key ID" }), { status: 500 });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Missing Razorpay Secret" }), { status: 500 });
    }

    // 2. Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 3. Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    // 4. Return order info
    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Razorpay Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
