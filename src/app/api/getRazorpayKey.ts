import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const key = process.env.RAZORPAY_KEY_ID; // Store securely in env vars
    if (!key) {
      return res.status(500).json({ error: 'Razorpay key not configured' });
    }
    res.status(200).json({ key });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}