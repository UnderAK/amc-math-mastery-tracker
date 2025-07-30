import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or anonymous key is missing; running in guest mode.");
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
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
    from: (table: string) => {
      const mockResult = { data: null, error: { message: 'Database operations not available in guest mode' } };
      const chainableMethods = {
        eq: () => chainableMethods,
        single: () => mockResult,
        select: () => chainableMethods,
        insert: () => chainableMethods,
        update: () => chainableMethods
      };
      return {
        select: (columns?: string) => chainableMethods,
        insert: (data: any) => chainableMethods,
        update: (data: any) => chainableMethods,
        eq: (column: string, value: any) => chainableMethods,
        single: () => mockResult,
        ...chainableMethods
      };
    },
    rpc: (fn: string, params?: any) => Promise.resolve({
      data: null,
      error: { message: 'RPC functions not available in guest mode' }
    }),
    channel: (name: string) => ({
      on: (event: string, config: any, callback: any) => ({
        on: (event: string, config: any, callback: any) => ({ subscribe: () => {} }),
        subscribe: () => {}
      }),
      subscribe: () => {}
    }),
    removeChannel: (channel: any) => {}
  };
} else {
  client = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
