// Script para cargar datos de comparación 2024 vs 2025 desde CSV
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🚀 Iniciando carga de datos de comparación 2024 vs 2025...');
console.log('URL Supabase:', supabaseUrl);
console.log('Key presente:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para limpiar valores monetarios
function cleanMoneyValue(value) {
  if (!value || value === '$-' || value.trim() === '-' || value.trim() === '') {
    return 0;
  }
  // Remover $, espacios, comas y convertir a número
  return parseFloat(value.replace(/[\$,\s]/g, '')) || 0;
}

// Función para limpiar porcentajes
function cleanPercentage(value) {
  if (!value || value.trim() === '' || value === '0.00%') {
    return 0;
  }
  return parseFloat(value.replace('%', '')) || 0;
}

async function loadComparisonData() {
  try {
    console.log('📂 Leyendo archivo CSV...');
    const csvPath = path.join(__dirname, 'public', 'Data', '2024vs2025Ingresos.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log('🗑️ Eliminando datos existentes de comparación...');
    await supabase.from('revenue_comparison').delete().neq('id', 0);
    
    console.log('📊 Procesando datos del CSV...');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length < 4) continue;
      
      const empresa = values[0]?.trim();
      const lineaNegocio = values[1]?.trim();
      const centroCoste = values[2]?.trim();
      const proyecto = values[3]?.trim();
      
      if (!empresa || !proyecto) continue;
      
      // Extraer datos mensuales (cada mes tiene 3 columnas: 2024, 2025, porcentaje)
      const monthlyData = {};
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      let dataIndex = 4; // Empezar después de empresa, LN, CC, proyecto
      
      for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
        const month = months[monthIdx];
        const value2024 = cleanMoneyValue(values[dataIndex]);
        const value2025 = cleanMoneyValue(values[dataIndex + 1]);
        const percentage = cleanPercentage(values[dataIndex + 2]);
        
        monthlyData[`${month}_2024`] = value2024;
        monthlyData[`${month}_2025`] = value2025;
        monthlyData[`${month}_percentage`] = percentage;
        
        dataIndex += 3;
      }
      
      // Totales anuales
      const total2024 = cleanMoneyValue(values[dataIndex]);
      const total2025 = cleanMoneyValue(values[dataIndex + 1]);
      const totalPercentage = cleanPercentage(values[dataIndex + 2]);
      
      const comparisonRecord = {
        empresa,
        linea_negocio: lineaNegocio,
        centro_coste: centroCoste,
        proyecto,
        ...monthlyData,
        total_2024: total2024,
        total_2025: total2025,
        total_percentage: totalPercentage,
        created_at: new Date().toISOString()
      };
      
      // Insertar en Supabase
      const { error } = await supabase
        .from('revenue_comparison')
        .insert([comparisonRecord]);
      
      if (error) {
        console.error(`❌ Error insertando ${proyecto}:`, error);
      } else {
        console.log(`✅ Insertado: ${empresa} - ${proyecto}`);
      }
    }
    
    console.log('🎉 ¡Datos de comparación cargados exitosamente!');
    
    // Verificar datos insertados
    console.log('🔍 Verificando datos insertados...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('revenue_comparison')
      .select('empresa, proyecto, total_2024, total_2025, total_percentage')
      .limit(10);
    
    if (verifyError) {
      console.error('❌ Error verificando datos:', verifyError);
    } else {
      console.log('📊 Primeros 10 registros verificados:');
      verifyData.forEach(row => {
        console.log(`   - ${row.empresa} - ${row.proyecto}: 2024: $${row.total_2024?.toLocaleString()}, 2025: $${row.total_2025?.toLocaleString()}, ${row.total_percentage}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

loadComparisonData();
