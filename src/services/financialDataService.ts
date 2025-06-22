import supabase from './supabaseClient';
import { FinancialReport, MonthlyRevenue, RevenueData } from '../types';

// Función para limpiar y convertir strings de dinero a números
const parseMoneyString = (value: string): number => {
  if (!value || value === '$-' || value.trim() === '') return 0;
  return parseFloat(value.replace(/[\$,\s]/g, '').replace(/[()]/g, '-'));
};

// Detectar si estamos usando datos mock
const isUsingMockData = true; // Forzar uso de datos mock para GitHub Pages

// Datos mock de reportes financieros
const mockFinancialReports: FinancialReport[] = [
  {
    id: '1',
    category: 'Ingresos',
    subcategory: 'Objetivo Ingresos',
    annual_target: 109809343.84,
    ytd_actual: 25991392.16,
    jan: 4716739.10, feb: 5316861.70, mar: 7164786.28, apr: 8793005.08,
    may: 9000903.68, jun: 9439450.08, jul: 11717057.48, aug: 12122937.48,
    sep: 10848834.28, oct: 11680856.48, nov: 11264030.30, dec: 7189481.90,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    category: 'Ingresos',
    subcategory: 'Ingresos Reales',
    annual_target: 109809343.84,
    ytd_actual: 24797273.12,
    jan: 5874642.40, feb: 6353185.40, mar: 5906350.80, apr: 6663094.52,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    category: 'Utilidad',
    subcategory: 'Gross Margin Obtenido',
    annual_target: 90043661.95,
    ytd_actual: 20188516.85,
    jan: 4928236.40, feb: 5231949.63, mar: 4789971.66, apr: 5238359.16,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    category: 'Utilidad',
    subcategory: 'Gross Margin Planeado Real',
    annual_target: 90043661.95,
    ytd_actual: 20333763.96,
    jan: 4817206.77, feb: 5209612.03, mar: 4843207.66, apr: 5463737.51,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    category: 'EBIT',
    subcategory: 'EBIT Obtenido',
    annual_target: 65885606.30,
    ytd_actual: 13524124.72,
    jan: 3781594.90, feb: 3732484.64, mar: 3000840.17, apr: 3009205.01,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    category: 'EBIT',
    subcategory: 'EBIT Planeado Real',
    annual_target: 65885606.30,
    ytd_actual: 14878363.87,
    jan: 3524785.44, feb: 3811911.24, mar: 3543810.48, apr: 3997856.71,
    may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    year: 2025,
    created_at: '2025-01-01T00:00:00Z'
  }
];

// Función para subir datos financieros desde CSV
export const uploadFinancialData = async (): Promise<void> => {
  try {
    // Datos extraídos del CSV de Buzzword
    const buzzwordData = [
      {
        category: 'Ingresos',
        subcategory: 'Objetivo Ingresos',
        annual_target: 109809343.84,
        ytd_actual: 25991392.16,
        jan: 4716739.10, feb: 5316861.70, mar: 7164786.28, apr: 8793005.08,
        may: 9000903.68, jun: 9439450.08, jul: 11717057.48, aug: 12122937.48,
        sep: 10848834.28, oct: 11680856.48, nov: 11264030.30, dec: 7189481.90
      },
      {
        category: 'Ingresos',
        subcategory: 'Ingresos Reales',
        annual_target: 109809343.84,
        ytd_actual: 24797273.12,
        jan: 5874642.40, feb: 6353185.40, mar: 5906350.80, apr: 6663094.52,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Costos',
        subcategory: 'Costos directos de proyectos',
        annual_target: 4608756.27,
        ytd_actual: 4608756.27,
        jan: 946406.00, feb: 1121235.77, mar: 1116379.14, apr: 1424735.36,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Utilidad',
        subcategory: 'Gross Margin Obtenido',
        annual_target: 90043661.95,
        ytd_actual: 20188516.85,
        jan: 4928236.40, feb: 5231949.63, mar: 4789971.66, apr: 5238359.16,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Gastos',
        subcategory: 'Investigación y Desarrollo',
        annual_target: 10980934.38,
        ytd_actual: 2189212.64,
        jan: 345192.00, feb: 422577.35, mar: 515287.48, apr: 906155.81,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Gastos',
        subcategory: 'Ventas (Comercial)',
        annual_target: 8784747.51,
        ytd_actual: 1037692.02,
        jan: 194323.21, feb: 335789.13, mar: 258391.62, apr: 249188.06,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Gastos',
        subcategory: 'Generales y Administrativos',
        annual_target: 4392373.75,
        ytd_actual: 1252173.81,
        jan: 136894.56, feb: 191302.90, mar: 302303.80, apr: 621672.55,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Utilidad',
        subcategory: 'Gross Margin Obtenido',
        annual_target: 90043661.95,
        ytd_actual: 20188516.85,
        jan: 4928236.40, feb: 5231949.63, mar: 4789971.66, apr: 5238359.16,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'Utilidad',
        subcategory: 'Gross Margin Planeado',
        annual_target: 90043661.95,
        ytd_actual: 21312941.57,
        jan: 3867726.06, feb: 4359826.59, mar: 5875124.75, apr: 7210264.17,
        may: 7380741.02, jun: 7740349.07, jul: 9607987.13, aug: 9940808.73,
        sep: 8896044.11, oct: 9578302.31, nov: 9236504.85, dec: 5895375.16
      },
      {
        category: 'Utilidad',
        subcategory: 'Gross Margin Planeado Real',
        annual_target: 90043661.95,
        ytd_actual: 20333763.96,
        jan: 4817206.77, feb: 5209612.03, mar: 4843207.66, apr: 5463737.51,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'EBIT',
        subcategory: 'EBIT Obtenido',
        annual_target: 65885606.30,
        ytd_actual: 13524124.72,
        jan: 3781594.90, feb: 3732484.64, mar: 3000840.17, apr: 3009205.01,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      },
      {
        category: 'EBIT',
        subcategory: 'EBIT Planeado',
        annual_target: 65885606.30,
        ytd_actual: 15594835.30,
        jan: 2830043.46, feb: 3190117.02, mar: 4298871.77, apr: 5275803.05,
        may: 5400542.21, jun: 5663670.05, jul: 5663670.05, aug: 7273762.49,
        sep: 6509300.57, oct: 7008513.89, nov: 6758418.18, dec: 4313689.14
      },
      {
        category: 'EBIT',
        subcategory: 'EBIT Planeado Real',
        annual_target: 65885606.30,
        ytd_actual: 14878363.87,
        jan: 3524785.44, feb: 3811911.24, mar: 3543810.48, apr: 3997856.71,
        may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      }
    ];

    // Eliminar datos existentes del año 2025
    await supabase
      .from('financial_reports')
      .delete()
      .eq('year', 2025);

    // Insertar nuevos datos
    for (const data of buzzwordData) {
      const { error } = await supabase
        .from('financial_reports')
        .insert({
          year: 2025,
          category: data.category,
          subcategory: data.subcategory,
          annual_target: data.annual_target,
          ytd_actual: data.ytd_actual,
          jan: data.jan,
          feb: data.feb,
          mar: data.mar,
          apr: data.apr,
          may: data.may,
          jun: data.jun,
          jul: data.jul,
          aug: data.aug,
          sep: data.sep,
          oct: data.oct,
          nov: data.nov,
          dec: data.dec
        });

      if (error) {
        console.error('Error inserting financial data:', error);
        throw error;
      }
    }

    // Crear datos de ingresos mensuales resumidos
    await createMonthlyRevenueSummary();

    console.log('Datos financieros subidos exitosamente');
  } catch (error) {
    console.error('Error uploading financial data:', error);
    throw error;
  }
};

// Función para crear resumen de ingresos mensuales
const createMonthlyRevenueSummary = async (): Promise<void> => {
  const months = [
    { month: 1, name: 'Enero', planned: 4716739.10, actual: 5874642.40 },
    { month: 2, name: 'Febrero', planned: 5316861.70, actual: 6353185.40 },
    { month: 3, name: 'Marzo', planned: 7164786.28, actual: 5906350.80 },
    { month: 4, name: 'Abril', planned: 8793005.08, actual: 6663094.52 },
    { month: 5, name: 'Mayo', planned: 9000903.68, actual: 0 },
    { month: 6, name: 'Junio', planned: 9439450.08, actual: 0 }
  ];

  // Eliminar datos existentes del año 2025
  await supabase
    .from('monthly_revenue')
    .delete()
    .eq('year', 2025);

  for (const monthData of months) {
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
      console.error('Error inserting monthly revenue:', error);
      throw error;
    }
  }
};

// Función para obtener datos de ingresos mensuales
export const getMonthlyRevenueData = async (): Promise<RevenueData[]> => {
  try {
    const { data, error } = await supabase
      .from('monthly_revenue')
      .select('*')
      .eq('year', 2025)
      .order('month');

    if (error) throw error;

    return data?.map((item: any) => ({
      month: item.month_name,
      planned: item.planned_income || 0,
      actual: item.actual_income || 0,
      variance: item.variance || 0,
      percentage: item.variance_percentage || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching monthly revenue data:', error);
    return [];
  }
};

// Función para obtener datos financieros por categoría
export const getFinancialReportsByCategory = async (category: string): Promise<FinancialReport[]> => {
  if (isUsingMockData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockFinancialReports.filter(report => report.category === category);
  }

  try {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('year', 2025)
      .eq('category', category)
      .order('subcategory');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return [];
  }
};

// Función para obtener todas las categorías disponibles
export const getFinancialCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('category')
      .eq('year', 2025);

    if (error) throw error;

    const categories = [...new Set(data?.map((item: any) => item.category) || [])] as string[];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Función para obtener datos financieros comparativos
export const getFinancialData = async () => {
  if (isUsingMockData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Datos mock para comparaciones 2024 vs 2025
    return [
      {
        empresa: 'BUZZWORD',
        ln: 'LN1',
        cc: 'CC1',
        proyecto: 'Proyecto Principal',
        monthlyData: {
          'Enero': { revenue2024: 4500000, revenue2025: 5874642, percentage: 30.5 },
          'Febrero': { revenue2024: 4800000, revenue2025: 6353185, percentage: 32.4 },
          'Marzo': { revenue2024: 5200000, revenue2025: 5906350, percentage: 13.6 },
          'Abril': { revenue2024: 5500000, revenue2025: 6663094, percentage: 21.1 },
          'Mayo': { revenue2024: 5800000, revenue2025: 0, percentage: -100 },
          'Junio': { revenue2024: 6000000, revenue2025: 0, percentage: -100 }
        },
        total2024: 31800000,
        total2025: 24797271,
        annualPercentage: -22.0
      },
      {
        empresa: 'INOVITZ',
        ln: 'LN2',
        cc: 'CC2',
        proyecto: 'Innovación Digital',
        monthlyData: {
          'Enero': { revenue2024: 2000000, revenue2025: 2500000, percentage: 25.0 },
          'Febrero': { revenue2024: 2200000, revenue2025: 2750000, percentage: 25.0 },
          'Marzo': { revenue2024: 2400000, revenue2025: 3000000, percentage: 25.0 },
          'Abril': { revenue2024: 2600000, revenue2025: 3250000, percentage: 25.0 },
          'Mayo': { revenue2024: 2800000, revenue2025: 0, percentage: -100 },
          'Junio': { revenue2024: 3000000, revenue2025: 0, percentage: -100 }
        },
        total2024: 15000000,
        total2025: 11500000,
        annualPercentage: -23.3
      }
    ];
  }

  try {
    // En caso de que se implemente con datos reales de Supabase
    const { data, error } = await supabase
      .from('revenue_comparison')
      .select('*')
      .order('empresa, proyecto');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return [];
  }
};

// Objeto de servicio financiero para exportar
export const financialDataService = {
  getFinancialData,
  getMonthlyRevenueData,
  getFinancialReportsByCategory,
  getFinancialCategories,
  uploadFinancialData
};
