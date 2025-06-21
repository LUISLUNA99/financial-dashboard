// Script para verificar datos en Supabase
console.log('🚀 Iniciando verificación...');

try {
  require('dotenv').config();
  console.log('✅ dotenv cargado');
  
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ supabase-js cargado');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  console.log('🔍 URL:', supabaseUrl);
  console.log('🔍 Key disponible:', !!supabaseAnonKey);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Cliente creado');

  // Test simple
  supabase
    .from('financial_reports')
    .select('count')
    .eq('year', 2025)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error en consulta:', error.message);
      } else {
        console.log('✅ Consulta exitosa, datos:', data);
      }
    })
    .catch(err => {
      console.error('❌ Error general:', err.message);
    });

} catch (error) {
  console.error('❌ Error al cargar módulos:', error.message);
}
