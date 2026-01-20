import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_id, order_id, signature } = body;

    if (!payment_id || !order_id || !signature) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac("sha256", secret!)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generatedSignature !== signature) {
      return new Response(JSON.stringify({ success: false, error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
