// Script para cargar datos de ingresos mensuales en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 Iniciando script...');
console.log('URL Supabase:', supabaseUrl);
console.log('Key presente:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function loadMonthlyRevenueData() {
  try {
    console.log('🔧 Conectando a Supabase...');
    
    // Datos de ingresos mensuales para 2025
    const monthlyData = [
      { month: 1, name: 'Enero', planned: 4716739.10, actual: 5874642.40 },
      { month: 2, name: 'Febrero', planned: 5316861.70, actual: 6353185.40 },
      { month: 3, name: 'Marzo', planned: 7164786.28, actual: 5906350.80 },
      { month: 4, name: 'Abril', planned: 8793005.08, actual: 6663094.52 },
      { month: 5, name: 'Mayo', planned: 9000903.68, actual: 8200000.00 },
      { month: 6, name: 'Junio', planned: 9439450.08, actual: 9100000.00 },
      { month: 7, name: 'Julio', planned: 11717057.48, actual: 10200000.00 },
      { month: 8, name: 'Agosto', planned: 12122937.48, actual: 11500000.00 },
      { month: 9, name: 'Septiembre', planned: 10848834.28, actual: 10000000.00 },
      { month: 10, name: 'Octubre', planned: 11680856.48, actual: 11200000.00 },
      { month: 11, name: 'Noviembre', planned: 11264030.30, actual: 10800000.00 },
      { month: 12, name: 'Diciembre', planned: 7189481.90, actual: 7500000.00 }
    ];

    console.log('🗑️ Eliminando datos existentes...');
    // Eliminar datos existentes del año 2025
    await supabase
      .from('monthly_revenue')
      .delete()
      .eq('year', 2025);

    console.log('📊 Insertando nuevos datos de ingresos mensuales...');
    
    for (const monthData of monthlyData) {
      const variance = monthData.actual - monthData.planned;
      const variancePercentage = monthData.planned > 0 
        ? (variance / monthData.planned) * 100 
        : 0;

      const { error } = await supabase
        .from('monthly_revenue')
        .insert({
          year: 2025,
          month: monthData.month,
          month_name: monthData.name,
          planned_income: monthData.planned,
          actual_income: monthData.actual,
          variance: variance,
          variance_percentage: variancePercentage
        });

      if (error) {
        console.error(`❌ Error insertando datos de ${monthData.name}:`, error);
        throw error;
      } else {
        console.log(`✅ ${monthData.name}: Planificado €${monthData.planned.toLocaleString()}, Real €${monthData.actual.toLocaleString()}`);
      }
    }

    console.log('🎉 ¡Datos de ingresos mensuales cargados exitosamente!');
    
    // Verificar los datos insertados
    const { data, error } = await supabase
      .from('monthly_revenue')
      .select('*')
      .eq('year', 2025)
      .order('month');
    
    if (error) {
      console.error('❌ Error verificando datos:', error);
    } else {
      console.log(`📈 Total registros insertados: ${data.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
loadMonthlyRevenueData();
