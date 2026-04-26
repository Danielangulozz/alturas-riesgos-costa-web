
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://scqsqofwyaglaqtedomj.supabase.co';
const supabaseAnonKey = 'sb_publishable_37IQIhRzzw2Y1UDvREJQ0g_mYoA5Oa4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('preinscripciones').select('cedula, nombre').limit(5);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

check();
