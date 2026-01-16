// pages/api/bookings/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase service role key or URL not set.");
}

const supabaseAdmin = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE_KEY || "", {
  // recommend to set fetch polyfill if needed
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { bookings, payment_id } = req.body;
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ error: "Invalid bookings payload" });
    }

    // Optional: Basic validation on each booking entry
    const sanitized = bookings.map((b: any) => ({
      user_id: b.user_id,
      customer_name: b.customer_name || "Customer",
      date: b.date || new Date().toISOString(),
      booking_time: b.booking_time || "10:00:00",
      service_name: b.service_name || null,
      service_types: b.service_types || [],
      total_price: b.total_price || 0,
      address: b.address || null,
      service_id: b.service_id || null,
      payment_id: payment_id || null,
      created_at: new Date().toISOString(),
    }));

    // Bulk insert using service_role key
    const { data, error } = await supabaseAdmin.from("bookings").insert(sanitized).select();

    if (error) {
      console.error("Supabase insert error (service role):", error);
      return res.status(500).json({ error: "Failed to insert bookings", details: error.message });
    }

    return res.status(200).json({ success: true, inserted: data.length, data });
  } catch (err: any) {
    console.error("create bookings API error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
