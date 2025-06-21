// Script para verificar y crear tablas si es necesario
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Verificando estado de las tablas en Supabase...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    // Verificar financial_reports
    console.log('📊 Verificando tabla financial_reports...');
    const { data: financialData, error: financialError } = await supabase
      .from('financial_reports')
      .select('*')
      .limit(1);
    
    if (financialError) {
      console.log('❌ Tabla financial_reports no existe:', financialError.message);
    } else {
      console.log('✅ Tabla financial_reports existe y funciona');
    }
    
    // Verificar monthly_revenue
    console.log('📈 Verificando tabla monthly_revenue...');
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_revenue')
      .select('*')
      .limit(1);
    
    if (monthlyError) {
      console.log('❌ Tabla monthly_revenue no existe:', monthlyError.message);
    } else {
      console.log('✅ Tabla monthly_revenue existe y funciona');
    }
    
    // Verificar revenue_comparison
    console.log('🔄 Verificando tabla revenue_comparison...');
    const { data: comparisonData, error: comparisonError } = await supabase
      .from('revenue_comparison')
      .select('*')
      .limit(1);
    
    if (comparisonError) {
      console.log('❌ Tabla revenue_comparison no existe:', comparisonError.message);
    } else {
      console.log('✅ Tabla revenue_comparison existe y funciona');
    }
    
    // Mostrar resumen de datos existentes
    console.log('\n📋 RESUMEN DE DATOS ACTUALES:');
    
    const { data: financialCount } = await supabase
      .from('financial_reports')
      .select('*', { count: 'exact' });
    console.log(`   - Reportes financieros: ${financialCount?.length || 0} registros`);
    
    const { data: monthlyCount } = await supabase
      .from('monthly_revenue')
      .select('*', { count: 'exact' });
    console.log(`   - Ingresos mensuales: ${monthlyCount?.length || 0} registros`);
    
    const { data: comparisonCount } = await supabase
      .from('revenue_comparison')
      .select('*', { count: 'exact' });
    console.log(`   - Comparación 2024 vs 2025: ${comparisonCount?.length || 0} registros`);
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
  }
}

checkTables();
