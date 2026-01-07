export const dynamic = "force-dynamic";

import ServiceDetailsClient from "./ServiceDetailsClient";
import { supabase } from "@/lib/supabase-client";

type Params = { id: string };

export default async function Page({ params }: { params: Params }) {
  const { id } = params;

  const { data: subData, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !subData) {
    return <div>Service not found</div>;
  }

  return <ServiceDetailsClient subData={subData} />;
}
