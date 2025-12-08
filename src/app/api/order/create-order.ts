import Razorpay from 'razorpay';
import { NextApiRequest, NextApiResponse } from 'next';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,  // Your Razorpay key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET!,  // Your Razorpay key secret
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, currency = 'INR' } = req.body;  // amount in paisa (e.g., 10000 for ₹100)

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,  // Convert to paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
}