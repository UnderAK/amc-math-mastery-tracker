import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or anonymous key is missing; running in guest mode.");
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (callback: any) => {
        // Call callback immediately with null session for guest mode
        callback('SIGNED_OUT', null);
        // Return a mock subscription object
        return {
          data: { subscription: { unsubscribe: () => {} } }
        };
      },
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({ select: () => ({ data: null, error: null }) }),
  };
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
