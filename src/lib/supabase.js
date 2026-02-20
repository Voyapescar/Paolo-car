import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuración de Supabase incompleta. Revisa tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
