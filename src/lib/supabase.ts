import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase environment variables are missing! Image uploads will fail.");
}

// We use the service role key to securely bypass Storage RLS policies, 
// because our app relies entirely on custom authentication.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
