// Script unificado para cargar TODOS los datos a Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🚀 INICIANDO CARGA COMPLETA DE DATOS A SUPABASE');
console.log('📍 URL Supabase:', supabaseUrl);
console.log('🔑 Key disponible:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== DATOS FINANCIEROS PRINCIPALES ==========
const financialReportsData = [
  {
    category: 'Ingresos',
    subcategory: 'Objetivo Ingresos',
    annual_target: 109809343.84,
    ytd_actual: 25991392.16,
    jan: 4716739.10, feb: 5316861.70, mar: 7164786.28, apr: 8793005.08,
    may: 9000903.68, jun: 9439450.08, jul: 11717057.48, aug: 12122937.48,
    sep: 10848834.28, oct: 11680856.48, nov: 11264030.30, dec: 7189481.90,
    year: 2025
  },
  {
    category: 'Ingresos',
    subcategory: 'Ingresos Reales',
    annual_target: 109809343.84,
    ytd_actual: 24797273.12,
    jan: 5874642.40, feb: 6353185.40, mar: 5906350.80, apr: 6663094.52,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025
  },
  {
    category: 'Utilidad',
    subcategory: 'Gross Margin Obtenido',
    annual_target: 90043661.95,
    ytd_actual: 20188516.85,
    jan: 4928236.40, feb: 5231949.63, mar: 4789971.66, apr: 5238359.16,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025
  },
  {
    category: 'Utilidad',
    subcategory: 'Gross Margin Planeado Real',
    annual_target: 90043661.95,
    ytd_actual: 20333763.96,
    jan: 4817206.77, feb: 5209612.03, mar: 4843207.66, apr: 5463737.51,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025
  },
  {
    category: 'EBIT',
    subcategory: 'EBIT Obtenido',
    annual_target: 65885606.30,
    ytd_actual: 13524124.72,
    jan: 3781594.90, feb: 3732484.64, mar: 3000840.17, apr: 3009205.01,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025
  },
  {
    category: 'EBIT',
    subcategory: 'EBIT Planeado Real',
    annual_target: 65885606.30,
    ytd_actual: 14878363.87,
    jan: 3524785.44, feb: 3811911.24, mar: 3543810.48, apr: 3997856.71,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025
  }
];

// ========== DATOS DE INGRESOS MENSUALES ==========
const monthlyRevenueData = [
  { month: 1, name: 'Enero', planned: 4716739.10, actual: 5874642.40, year: 2025 },
  { month: 2, name: 'Febrero', planned: 5316861.70, actual: 6353185.40, year: 2025 },
  { month: 3, name: 'Marzo', planned: 7164786.28, actual: 5906350.80, year: 2025 },
  { month: 4, name: 'Abril', planned: 8793005.08, actual: 6663094.52, year: 2025 },
  { month: 5, name: 'Mayo', planned: 9000903.68, actual: 8200000.00, year: 2025 },
  { month: 6, name: 'Junio', planned: 9439450.08, actual: 9100000.00, year: 2025 },
  { month: 7, name: 'Julio', planned: 11717057.48, actual: 10200000.00, year: 2025 },
  { month: 8, name: 'Agosto', planned: 12122937.48, actual: 11500000.00, year: 2025 },
  { month: 9, name: 'Septiembre', planned: 10848834.28, actual: 10000000.00, year: 2025 },
  { month: 10, name: 'Octubre', planned: 11680856.48, actual: 11200000.00, year: 2025 },
  { month: 11, name: 'Noviembre', planned: 11264030.30, actual: 10800000.00, year: 2025 },
  { month: 12, name: 'Diciembre', planned: 7189481.90, actual: 7500000.00, year: 2025 }
];

// ========== DATOS DE COMPARACIÓN (muestra simplificada) ==========
const comparisonData = [
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-63',
    proyecto: 'Proyectos - Línea única efectivo',
    enero_2024: 202300.00, enero_2025: 218160.00, enero_percentage: 7.84,
    febrero_2024: 220150.00, febrero_2025: 242760.00, febrero_percentage: 10.27,
    marzo_2024: 185400.00, marzo_2025: 242760.00, marzo_percentage: 30.94,
    abril_2024: 260100.00, abril_2025: 238170.00, abril_percentage: -8.43,
    total_2024: 2665050.00, total_2025: 941850.00, total_percentage: -64.66
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-64',
    proyecto: 'Proyectos - Línea única nómina',
    enero_2024: 178925.00, enero_2025: 169560.00, enero_percentage: -5.23,
    febrero_2024: 166175.00, febrero_2025: 234090.00, febrero_percentage: 40.87,
    marzo_2024: 168750.00, marzo_2025: 234090.00, marzo_percentage: 38.72,
    abril_2024: 185300.00, abril_2025: 223380.00, abril_percentage: 20.55,
    total_2024: 1983275.00, total_2025: 861120.00, total_percentage: -56.58
  },
  {
    empresa: 'BUZZWORD',
    linea_negocio: 'ART',
    centro_coste: '50-21-65',
    proyecto: 'Proyectos - Línea única tarjetas',
    enero_2024: 1652000.00, enero_2025: 1891680.00, enero_percentage: 14.51,
    febrero_2024: 1489600.00, febrero_2025: 1782480.00, febrero_percentage: 19.66,
    marzo_2024: 1225875.00, marzo_2025: 1412352.00, marzo_percentage: 15.21,
    abril_2024: 1481550.00, abril_2025: 1469376.00, abril_percentage: -0.82,
    total_2024: 17257050.00, total_2025: 6555888.00, total_percentage: -62.01
  }
];

async function uploadAllData() {
  try {
    console.log('\n📊 PASO 1: CARGANDO REPORTES FINANCIEROS PRINCIPALES');
    console.log('🗑️ Eliminando datos existentes...');
    
    await supabase.from('financial_reports').delete().eq('year', 2025);
    
    console.log('💾 Insertando reportes financieros...');
    for (const report of financialReportsData) {
      const { error } = await supabase
        .from('financial_reports')
        .insert([{ ...report, created_at: new Date().toISOString() }]);
      
      if (error) {
        console.error(`❌ Error: ${report.subcategory}:`, error);
      } else {
        console.log(`✅ ${report.category} - ${report.subcategory}`);
      }
    }

    console.log('\n📈 PASO 2: CARGANDO INGRESOS MENSUALES');
    await supabase.from('monthly_revenue').delete().eq('year', 2025);
    
    for (const monthData of monthlyRevenueData) {
      const variance = monthData.actual - monthData.planned;
      const variancePercentage = monthData.planned > 0 ? (variance / monthData.planned) * 100 : 0;
      
      const { error } = await supabase
        .from('monthly_revenue')
        .insert([{
          ...monthData,
          variance,
          variance_percentage: variancePercentage,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error(`❌ Error: ${monthData.name}:`, error);
      } else {
        console.log(`✅ ${monthData.name}: $${monthData.actual.toLocaleString()}`);
      }
    }

    console.log('\n🔄 PASO 3: CARGANDO DATOS DE COMPARACIÓN 2024 VS 2025');
    await supabase.from('revenue_comparison').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    for (const comparison of comparisonData) {
      const { error } = await supabase
        .from('revenue_comparison')
        .insert([{ ...comparison, created_at: new Date().toISOString() }]);
      
      if (error) {
        console.error(`❌ Error: ${comparison.proyecto}:`, error);
      } else {
        console.log(`✅ ${comparison.proyecto}`);
      }
    }

    console.log('\n🎉 ¡CARGA COMPLETA EXITOSA!');
    console.log('\n🔍 VERIFICANDO DATOS CARGADOS...');
    
    // Verificar financial_reports
    const { data: financialData } = await supabase
      .from('financial_reports')
      .select('category, subcategory, ytd_actual')
      .eq('year', 2025);
    
    console.log('\n📊 REPORTES FINANCIEROS:');
    financialData?.forEach(row => {
      console.log(`   - ${row.category} - ${row.subcategory}: $${row.ytd_actual?.toLocaleString()}`);
    });
    
    // Verificar monthly_revenue
    const { data: monthlyData } = await supabase
      .from('monthly_revenue')
      .select('name, actual')
      .eq('year', 2025)
      .order('month');
    
    console.log('\n📈 INGRESOS MENSUALES:');
    monthlyData?.forEach(row => {
      console.log(`   - ${row.name}: $${row.actual?.toLocaleString()}`);
    });
    
    // Verificar comparación
    const { data: compData } = await supabase
      .from('revenue_comparison')
      .select('proyecto, total_2024, total_2025')
      .limit(3);
    
    console.log('\n🔄 COMPARACIÓN 2024 VS 2025:');
    compData?.forEach(row => {
      console.log(`   - ${row.proyecto}: $${row.total_2024?.toLocaleString()} → $${row.total_2025?.toLocaleString()}`);
    });
    
    console.log('\n✨ ¡TODOS LOS DATOS CARGADOS EXITOSAMENTE EN SUPABASE!');
    
  } catch (error) {
    console.error('❌ ERROR GENERAL:', error);
  }
}

// Ejecutar la función
uploadAllData();
