import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Wish {
  id: string;
  name: string;
  wish_text: string;
  word: string;
  poem: string;
  pos_x: number;
  pos_y: number;
  likes: number;
  created_at: string;
}

export interface Prize {
  id: string;
  wish_id: string | null;
  amount: number;
  winner_name: string;
  bank_account: string;
  bank_name: string;
  transferred: boolean;
  created_at: string;
}

export interface PrizeConfig {
  id: string;
  amount: number;
  label: string;
  chance: number;
  max_count: number;
  enabled: boolean;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Kiểm tra URL hợp lệ để tránh crash khi chưa config
const isValidUrl = supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");

export const supabase: SupabaseClient | null = isValidUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isValidUrl;
