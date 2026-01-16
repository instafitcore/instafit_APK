import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { email } = req.body;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) return res.status(500).json({ exists: false });

  const found = data.users.find((u) => u.email === email);

  return res.status(200).json({ exists: !!found });
}
