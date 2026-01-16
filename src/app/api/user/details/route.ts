import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No auth token provided" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user.user) return NextResponse.json({ error: error?.message || "User not found" }, { status: 401 });

    return NextResponse.json({ user: { email: user.user.email, full_name: user.user.user_metadata?.full_name || null } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
