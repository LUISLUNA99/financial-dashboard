const fs = require('fs');
const path = require('path');

function transformInovitzDataImproved() {
  try {
    console.log('📊 Transformando datos de INOVITZ (versión mejorada)...');
    
    // Leer archivo de INOVITZ
    const inovitzPath = path.join(__dirname, '../docs/Data/DATOSINOVITZ.csv');
    const inovitzData = fs.readFileSync(inovitzPath, 'utf8');
    
    // Leer archivo de BUZZWORD
    const buzzwordPath = path.join(__dirname, '../docs/Data/2024vs2025Ingresos.csv');
    const buzzwordData = fs.readFileSync(buzzwordPath, 'utf8');
    
    // Función para limpiar valores monetarios y porcentajes
    function cleanValue(value) {
      if (!value || value.trim() === '' || value.trim() === '-' || value.trim() === '$-') {
        return '0';
      }
      
      // Limpiar caracteres especiales
      let cleaned = value.toString()
        .replace(/[\$,"\s]/g, '')  // Remover $, comas, comillas y espacios
        .replace(/^\-$/, '0')      // Convertir solo guión a 0
        .replace(/%/g, '');        // Remover %
      
      // Si está vacío después de limpieza, retornar 0
      if (cleaned === '' || cleaned === '-') return '0';
      
      // Convertir a número y validar
      const number = parseFloat(cleaned);
      return isNaN(number) ? '0' : number.toString();
    }
    
    // Datos específicos de INOVITZ extraídos manualmente del CSV
    const inovitzProjects = [
      // Ingresos Reales
      {
        empresa: 'INOVITZ',
        ln: 'Corporate',
        cc: 'INOVITZ-001',
        proyecto: 'Ingresos Reales',
        monthly2024: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthly2025: [1522996.01, 1833427.74, 1836864.49, 1858390.09, 0, 0, 0, 0, 0, 0, 0, 0],
        total2024: 0,
        total2025: 7051678.33,
        percentage: 118.98
      },
      // Gross Margin Obtenido
      {
        empresa: 'INOVITZ',
        ln: 'Utilidad',
        cc: 'INOVITZ-002',
        proyecto: 'Gross Margin Obtenido',
        monthly2024: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthly2025: [501850.73, 650284.90, 900948.90, 493081.63, 0, 0, 0, 0, 0, 0, 0, 0],
        total2024: 0,
        total2025: 2546166.16,
        percentage: 36.11
      },
      // EBIT Obtenido
      {
        empresa: 'INOVITZ',
        ln: 'EBIT',
        cc: 'INOVITZ-003',
        proyecto: 'EBIT Obtenido',
        monthly2024: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthly2025: [343426.51, 397962.87, 692756.62, 305653.38, 0, 0, 0, 0, 0, 0, 0, 0],
        total2024: 0,
        total2025: 1739799.38,
        percentage: 24.67
      }
    ];
    
    // Generar filas CSV para INOVITZ
    const transformedRows = [];
    
    inovitzProjects.forEach(project => {
      const row = [
        project.empresa,
        project.ln,
        project.cc,
        project.proyecto
      ];
      
      // Agregar datos mensuales (12 meses)
      for (let i = 0; i < 12; i++) {
        // Formato: 2024, 2025, Porcentaje
        row.push(`$${project.monthly2024[i].toLocaleString()}`);
        row.push(`$${project.monthly2025[i].toLocaleString()}`);
        
        // Calcular porcentaje mensual
        const monthlyPercentage = project.monthly2024[i] > 0 
          ? (((project.monthly2025[i] - project.monthly2024[i]) / project.monthly2024[i]) * 100).toFixed(2)
          : project.monthly2025[i] > 0 ? '0.00' : '0.00';
        row.push(`${monthlyPercentage}%`);
      }
      
      // Agregar totales
      row.push(`$${project.total2024.toLocaleString()}`);
      row.push(`$${project.total2025.toLocaleString()}`);
      row.push(`${project.percentage.toFixed(2)}%`);
      
      transformedRows.push(row.join(','));
    });
    
    // Leer datos existentes de BUZZWORD (mantener solo datos de BUZZWORD)
    const buzzwordLines = buzzwordData.split('\n');
    const header = buzzwordLines[0];
    const buzzwordDataLines = buzzwordLines.slice(1).filter(line => 
      line.trim() && line.startsWith('BUZZWORD')
    );
    
    // Combinar datos
    const combinedData = [
      header,
      ...buzzwordDataLines,
      ...transformedRows
    ].join('\n');
    
    // Guardar archivo actualizado
    fs.writeFileSync(buzzwordPath, combinedData);
    
    console.log('✅ Datos de INOVITZ integrados exitosamente!');
    console.log(`📊 Se agregaron ${transformedRows.length} proyectos de INOVITZ`);
    
    // Mostrar resumen
    console.log('\n📋 DATOS INOVITZ INTEGRADOS:');
    inovitzProjects.forEach(project => {
      console.log(`💼 ${project.proyecto}: $${project.total2025.toLocaleString()} (${project.percentage.toFixed(2)}%)`);
    });
    
    // También copiar a otros directorios
    const buildPath = path.join(__dirname, '../build/Data/2024vs2025Ingresos.csv');
    const publicPath = path.join(__dirname, '../public/Data/2024vs2025Ingresos.csv');
    const dataPath = path.join(__dirname, '../Data/2024vs2025Ingresos.csv');
    
    // Crear directorios si no existen
    fs.mkdirSync(path.dirname(buildPath), { recursive: true });
    fs.mkdirSync(path.dirname(publicPath), { recursive: true });
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    
    // Copiar a todos los directorios
    fs.writeFileSync(buildPath, combinedData);
    fs.writeFileSync(publicPath, combinedData);
    fs.writeFileSync(dataPath, combinedData);
    
    console.log('📁 Archivos sincronizados en todos los directorios');
    
    return {
      success: true,
      rowsAdded: transformedRows.length,
      projects: inovitzProjects.length
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Ejecutar
if (require.main === module) {
  transformInovitzDataImproved();
}

module.exports = { transformInovitzDataImproved };
