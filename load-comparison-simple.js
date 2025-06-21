// Script simplificado para cargar datos de comparación 2024 vs 2025
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🚀 Iniciando carga de datos de comparación 2024 vs 2025...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Datos de muestra de comparación (algunos proyectos principales)
const comparisonData = [
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-10-43',
    proyecto: 'Proyectos - Fundación Gonzalo Río Arronte',
    enero_2024: 12000, enero_2025: 12000, enero_percentage: 0.00,
    febrero_2024: 12000, febrero_2025: 0, febrero_percentage: -100.00,
    marzo_2024: 12000, marzo_2025: 12000, marzo_percentage: 0.00,
    abril_2024: 12000, abril_2025: 12000, abril_percentage: 0.00,
    mayo_2024: 12000, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 144000, total_2025: 36000, total_percentage: -75.00
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-17-57',
    proyecto: 'Proyectos - Livercash',
    enero_2024: 299195, enero_2025: 845, enero_percentage: -99.72,
    febrero_2024: 51285, febrero_2025: 520, febrero_percentage: -98.99,
    marzo_2024: 248950, marzo_2025: 2080, marzo_percentage: -99.16,
    abril_2024: 265590, abril_2025: 2275, abril_percentage: -99.14,
    mayo_2024: 25220, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 939056, total_2025: 5720, total_percentage: -99.39
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-63',
    proyecto: 'Proyectos - Línea única efectivo',
    enero_2024: 202300, enero_2025: 218160, enero_percentage: 7.84,
    febrero_2024: 220150, febrero_2025: 242760, febrero_percentage: 10.27,
    marzo_2024: 185400, marzo_2025: 242760, marzo_percentage: 30.94,
    abril_2024: 260100, abril_2025: 238170, abril_percentage: -8.43,
    mayo_2024: 254150, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 2665050, total_2025: 941850, total_percentage: -64.66
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-64',
    proyecto: 'Proyectos - Línea única nómina',
    enero_2024: 178925, enero_2025: 169560, enero_percentage: -5.23,
    febrero_2024: 166175, febrero_2025: 234090, febrero_percentage: 40.87,
    marzo_2024: 168750, marzo_2025: 234090, marzo_percentage: 38.72,
    abril_2024: 185300, abril_2025: 223380, abril_percentage: 20.55,
    mayo_2024: 166175, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 1983275, total_2025: 861120, total_percentage: -56.58
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-65',
    proyecto: 'Proyectos - Línea única tarjetas',
    enero_2024: 1652000, enero_2025: 1891680, enero_percentage: 14.51,
    febrero_2024: 1489600, febrero_2025: 1782480, febrero_percentage: 19.66,
    marzo_2024: 1225875, marzo_2025: 1412352, marzo_percentage: 15.21,
    abril_2024: 1481550, abril_2025: 1469376, abril_percentage: -0.82,
    mayo_2024: 1638350, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 17257050, total_2025: 6555888, total_percentage: -62.01
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-66',
    proyecto: 'Proyectos - Santander Internet',
    enero_2024: 126700, enero_2025: 318360, enero_percentage: 151.27,
    febrero_2024: 148400, febrero_2025: 304080, febrero_percentage: 104.91,
    marzo_2024: 129375, marzo_2025: 203328, marzo_percentage: 57.16,
    abril_2024: 194950, abril_2025: 205632, abril_percentage: 5.48,
    mayo_2024: 249200, mayo_2025: 0, mayo_percentage: -100.00,
    total_2024: 2271505, total_2025: 1031400, total_percentage: -54.59
  }
];

async function loadComparisonData() {
  try {
    console.log('🗑️ Eliminando datos existentes de comparación...');
    await supabase.from('revenue_comparison').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('📊 Insertando datos de comparación...');
    
    for (const comparison of comparisonData) {
      const { error } = await supabase
        .from('revenue_comparison')
        .insert([{ ...comparison, created_at: new Date().toISOString() }]);
      
      if (error) {
        console.error(`❌ Error insertando ${comparison.proyecto}:`, error);
      } else {
        console.log(`✅ ${comparison.empresa} - ${comparison.proyecto}`);
      }
    }
    
    console.log('🎉 ¡Datos de comparación cargados exitosamente!');
    
    // Verificar datos insertados
    console.log('🔍 Verificando datos insertados...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('revenue_comparison')
      .select('empresa, proyecto, total_2024, total_2025, total_percentage')
      .limit(6);
    
    if (verifyError) {
      console.error('❌ Error verificando datos:', verifyError);
    } else {
      console.log('📊 Datos de comparación verificados:');
      verifyData.forEach(row => {
        console.log(`   - ${row.proyecto}: 2024: $${row.total_2024?.toLocaleString()}, 2025: $${row.total_2025?.toLocaleString()}, Cambio: ${row.total_percentage}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

loadComparisonData();
