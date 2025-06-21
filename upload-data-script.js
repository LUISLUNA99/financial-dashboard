// Script temporal para subir datos a Supabase
console.log('🚀 Iniciando script de carga...');

require('dotenv').config();
console.log('📦 dotenv cargado');

const { createClient } = require('@supabase/supabase-js');
console.log('📦 supabase-js cargado');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 URL Supabase:', supabaseUrl);
console.log('🔍 Key disponible:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno. Verificar .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Cliente Supabase creado');

// Datos corregidos del CSV de Buzzword
const buzzwordData = [
  {
    category: 'Ingresos',
    subcategory: 'Objetivo Ingresos',
    annual_target: 109809343.84,
    ytd_actual: 25991392.16,
    jan: 4716739.10, feb: 5316861.70, mar: 7164786.28, apr: 8793005.08,
    may: 9000903.68, jun: 9439450.08, jul: 11717057.48, aug: 12122937.48,
    sep: 10848834.28, oct: 11680856.48, nov: 11264030.30, dec: 7189481.90,
    year: 2025,
    created_at: new Date().toISOString()
  },
  {
    category: 'Ingresos',
    subcategory: 'Ingresos Reales',
    annual_target: 109809343.84,
    ytd_actual: 24797273.12,
    jan: 5874642.40, feb: 6353185.40, mar: 5906350.80, apr: 6663094.52,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: new Date().toISOString()
  },
  {
    category: 'Utilidad',
    subcategory: 'Gross Margin Obtenido',
    annual_target: 90043661.95,
    ytd_actual: 20188516.85,
    jan: 4928236.40, feb: 5231949.63, mar: 4789971.66, apr: 5238359.16,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: new Date().toISOString()
  },
  {
    category: 'Utilidad',
    subcategory: 'Gross Margin Planeado Real',
    annual_target: 90043661.95,
    ytd_actual: 20333763.96,
    jan: 4817206.77, feb: 5209612.03, mar: 4843207.66, apr: 5463737.51,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: new Date().toISOString()
  },
  {
    category: 'EBIT',
    subcategory: 'EBIT Obtenido',
    annual_target: 65885606.30,
    ytd_actual: 13524124.72,
    jan: 3781594.90, feb: 3732484.64, mar: 3000840.17, apr: 3009205.01,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: new Date().toISOString()
  },
  {
    category: 'EBIT',
    subcategory: 'EBIT Planeado Real',
    annual_target: 65885606.30,
    ytd_actual: 14878363.87,
    jan: 3524785.44, feb: 3811911.24, mar: 3543810.48, apr: 3997856.71,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: new Date().toISOString()
  }
];

async function uploadData() {
  try {
    console.log('🚀 Iniciando carga de datos...');
    
    // Eliminar datos existentes del año 2025
    console.log('🗑️ Eliminando datos existentes del 2025...');
    const { error: deleteError } = await supabase
      .from('financial_reports')
      .delete()
      .eq('year', 2025);

    if (deleteError) {
      console.error('Error eliminando datos:', deleteError);
    } else {
      console.log('✅ Datos anteriores eliminados');
    }

    // Insertar nuevos datos
    console.log('💾 Insertando nuevos datos...');
    for (const report of buzzwordData) {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert([report]);

      if (error) {
        console.error(`❌ Error insertando ${report.subcategory}:`, error);
      } else {
        console.log(`✅ Insertado: ${report.category} - ${report.subcategory}`);
      }
    }

    console.log('🎉 ¡Carga de datos completada exitosamente!');
    
    // Verificar datos insertados
    console.log('🔍 Verificando datos insertados...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('financial_reports')
      .select('category, subcategory, ytd_actual')
      .eq('year', 2025);

    if (verifyError) {
      console.error('❌ Error verificando datos:', verifyError);
    } else {
      console.log('📊 Datos verificados:');
      verifyData.forEach(row => {
        console.log(`   - ${row.category} - ${row.subcategory}: $${row.ytd_actual?.toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

uploadData();
