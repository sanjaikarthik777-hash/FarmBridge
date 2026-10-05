import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gmnhjkfqwthqeodvznqk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GlQ64F2IL3UQdgY6VCtfAA_Q2MxYYGi';

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
