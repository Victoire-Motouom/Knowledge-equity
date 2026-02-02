import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  console.warn(
    "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase auth will be unavailable.",
  );
}

// Only create the real client when both env vars are present. Otherwise export
// a safe stub with the `auth` shape used by the app so imports won't throw.
export const supabase: any =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : {
        auth: {
          getUser: async () => ({ data: { user: null } }),
          getSession: async () => ({ data: { session: null } }),
          // Match the real Supabase return shape: { data: { subscription } }
          onAuthStateChange: (_cb: any) => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
          signInWithOAuth: async () => ({}),
          signInWithOtp: async () => ({}),
          signOut: async () => ({}),
        },
      };
