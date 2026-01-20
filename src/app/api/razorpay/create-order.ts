import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, error: "Amount is required" });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      payment_capture: 1,
    });

    return res.status(200).json(order);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
