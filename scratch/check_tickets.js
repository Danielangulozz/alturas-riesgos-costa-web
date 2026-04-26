
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://scqsqofwyaglaqtedomj.supabase.co';
const supabaseAnonKey = 'sb_publishable_37IQIhRzzw2Y1UDvREJQ0g_mYoA5Oa4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist
  // Let's try to query tickets_soporte
  const { data: tickets, error: errT } = await supabase.from('tickets_soporte').select('*').limit(1);
  console.log("Tickets error:", errT);
  console.log("Tickets data:", tickets);
}

check();
