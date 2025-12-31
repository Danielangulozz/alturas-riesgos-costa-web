import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scqsqofwyaglaqtedomj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_37IQIhRzzw2Y1UDvREJQ0g_mYoA5Oa4';

// Creamos el cliente de forma segura
export const supabase = createClient(supabaseUrl, supabaseAnonKey);