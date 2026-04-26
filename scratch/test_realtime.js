const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://scqsqofwyaglaqtedomj.supabase.co';
const supabaseAnonKey = 'sb_publishable_37IQIhRzzw2Y1UDvREJQ0g_mYoA5Oa4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const channel = supabase
  .channel('live_db')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets_soporte' }, (payload) => {
    console.log("⚡ [Realtime] Cambio en tickets", payload);
  })
  .subscribe((status) => {
    console.log("📡 Estado:", status);
    if (status === 'SUBSCRIBED') {
      console.log("Conectado! Crea un ticket ahora para ver si llega acá...");
    }
  });

// Keep alive
setInterval(() => {}, 1000);
