// /pages/api/razorpay/create-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number') return res.status(400).json({ error: 'Invalid amount' });

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
