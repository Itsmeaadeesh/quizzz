import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your_supabase')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Guest User profile stored in localStorage
const GUEST_KEY = 'stayaheadd_guest_user';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore
  }
  return null;
}

export function setStoredUser(user: AppUser | null): void {
  if (user) {
    localStorage.setItem(GUEST_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(GUEST_KEY);
  }
}
