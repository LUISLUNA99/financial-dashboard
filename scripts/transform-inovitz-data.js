const fs = require('fs');
const path = require('path');

// Script para transformar datos de INOVITZ al formato de BUZZWORD
function transformInovitzData() {
  try {
    // Leer el archivo de INOVITZ
    const inovitzPath = path.join(__dirname, '../docs/Data/DATOSINOVITZ.csv');
    const inovitzData = fs.readFileSync(inovitzPath, 'utf8');
    
    // Leer el archivo existente de BUZZWORD para mantener la estructura
    const buzzwordPath = path.join(__dirname, '../docs/Data/2024vs2025Ingresos.csv');
    const buzzwordData = fs.readFileSync(buzzwordPath, 'utf8');
    
    console.log('📊 Transformando datos de INOVITZ...');
    
    // Parsear datos de INOVITZ
    const inovitzLines = inovitzData.split('\n').filter(line => line.trim());
    
    // Extraer datos principales de INOVITZ
    const inovitzRows = [];
    
    // Buscar filas específicas de INOVITZ
    let objetivoIngresos = null;
    let ingresosReales = null;
    let grossMarginObtenido = null;
    let ebitObtenido = null;
    
    inovitzLines.forEach((line, index) => {
      const columns = line.split(',');
      
      // Objetivo Ingresos
      if (line.includes('Objetivo Ingresos')) {
        objetivoIngresos = columns;
      }
      
      // Ingresos Reales
      if (line.includes('Ingresos Reales')) {
        ingresosReales = columns;
      }
      
      // Gross Margin Obtenido
      if (line.includes('Gross Margin Obtenido')) {
        grossMarginObtenido = columns;
      }
      
      // EBIT Obtenido
      if (line.includes('EBIT Obtenido')) {
        ebitObtenido = columns;
      }
    });
    
    // Función para limpiar valores monetarios
    function cleanMoneyValue(value) {
      if (!value || value.trim() === '' || value.trim() === '-') return '0';
      // Remover caracteres no numéricos excepto puntos y guiones
      let cleaned = value.toString().replace(/[\$,"\s]/g, '');
      // Si es solo un guión, retornar 0
      if (cleaned === '-') return '0';
      // Asegurar que sea un número válido
      const number = parseFloat(cleaned) || 0;
      return number.toString();
    }
    
    // Meses para mapear
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Crear filas para el formato BUZZWORD
    const transformedRows = [];
    
    // Fila 1: Ingresos Reales (será 2025)
    if (ingresosReales) {
      const row2 = ['INOVITZ', 'Corporate', 'INOVITZ-001', 'Ingresos Reales'];
      
      // Agregar datos mensuales (ENE-DIC están en posiciones 4-15)
      for (let i = 0; i < 12; i++) {
        const monthValue = cleanMoneyValue(ingresosReales[i + 4]);
        row2.push('0'); // 2024
        row2.push(monthValue); // 2025
        row2.push('0'); // Porcentaje
      }
      
      // Totales
      const total2025 = cleanMoneyValue(ingresosReales[3]); // YTD 2025
      row2.push('0'); // Total 2024
      row2.push(total2025); // Total 2025
      row2.push('0'); // Porcentaje anual
      
      transformedRows.push(row2.join(','));
    }
    
    // Fila 2: Gross Margin
    if (grossMarginObtenido) {
      const row3 = ['INOVITZ', 'Utilidad', 'INOVITZ-002', 'Gross Margin Obtenido'];
      
      for (let i = 0; i < 12; i++) {
        const monthValue = cleanMoneyValue(grossMarginObtenido[i + 4]);
        row3.push('0'); // 2024
        row3.push(monthValue); // 2025
        row3.push('0'); // Porcentaje
      }
      
      const totalGrossMargin = cleanMoneyValue(grossMarginObtenido[2]);
      row3.push('0');
      row3.push(totalGrossMargin);
      row3.push('0');
      
      transformedRows.push(row3.join(','));
    }
    
    // Fila 3: EBIT
    if (ebitObtenido) {
      const row4 = ['INOVITZ', 'EBIT', 'INOVITZ-003', 'EBIT Obtenido'];
      
      for (let i = 0; i < 12; i++) {
        const monthValue = cleanMoneyValue(ebitObtenido[i + 4]);
        row4.push('0'); // 2024
        row4.push(monthValue); // 2025
        row4.push('0'); // Porcentaje
      }
      
      const totalEbit = cleanMoneyValue(ebitObtenido[2]);
      row4.push('0');
      row4.push(totalEbit);
      row4.push('0');
      
      transformedRows.push(row4.join(','));
    }
    
    // Crear archivo combinado
    const buzzwordLines = buzzwordData.split('\n');
    const header = buzzwordLines[0]; // Mantener el header original
    
    // Combinar datos de BUZZWORD + INOVITZ
    const combinedData = [
      header,
      ...buzzwordLines.slice(1).filter(line => line.trim()), // Datos de BUZZWORD sin header
      ...transformedRows // Datos transformados de INOVITZ
    ].join('\n');
    
    // Guardar archivo combinado
    const outputPath = path.join(__dirname, '../docs/Data/2024vs2025Ingresos_Combined.csv');
    fs.writeFileSync(outputPath, combinedData);
    
    console.log('✅ Datos transformados exitosamente!');
    console.log(`📄 Archivo combinado guardado en: ${outputPath}`);
    console.log(`📊 Se agregaron ${transformedRows.length} filas de INOVITZ`);
    
    // También actualizar el archivo principal
    fs.writeFileSync(buzzwordPath, combinedData);
    console.log('📝 Archivo principal actualizado con datos de INOVITZ');
    
    // Mostrar resumen
    console.log('\n📋 RESUMEN DE DATOS INOVITZ:');
    if (objetivoIngresos) {
      console.log(`💰 Objetivo Ingresos: $${cleanMoneyValue(objetivoIngresos[2])}`);
    }
    if (ingresosReales) {
      console.log(`💸 Ingresos Reales: $${cleanMoneyValue(ingresosReales[3])}`);
    }
    if (grossMarginObtenido) {
      console.log(`📈 Gross Margin: $${cleanMoneyValue(grossMarginObtenido[2])}`);
    }
    if (ebitObtenido) {
      console.log(`🎯 EBIT: $${cleanMoneyValue(ebitObtenido[2])}`);
    }
    
    return {
      success: true,
      rowsAdded: transformedRows.length,
      outputPath
    };
    
  } catch (error) {
    console.error('❌ Error transformando datos:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  transformInovitzData();
}

module.exports = { transformInovitzData };
