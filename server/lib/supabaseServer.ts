import { createClient } from "@supabase/supabase-js";

function createThrowingClient(message: string) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    },
  ) as any;
}

// Prefer server-only env vars, then fall back to Vite-exposed vars.
// This prevents `.env` VITE_* values (often pointing at hosted Supabase) from
// accidentally overriding local/dev/prod server settings.
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";

// Public/anon key is allowed for READ endpoints (RLS still applies).
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Standard Supabase naming is SUPABASE_SERVICE_ROLE_KEY.
// IMPORTANT: only use service-role key for privileged operations (RPC/writes) on the server.
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  "";

if (!url) {
  console.warn(
    "Supabase server client not configured. Set SUPABASE_URL in .env.",
  );
}

export const supabasePublic =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : createThrowingClient(
        "Supabase public client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_* for dev).",
      );

export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : createThrowingClient(
        "Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.",
      );
