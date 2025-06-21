-- SQL para crear todas las tablas necesarias para el dashboard financiero
-- Ejecutar en Supabase SQL Editor

-- Tabla para reportes financieros principales (EBIT, Gross Margin, etc.)
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL, -- 'Ingresos', 'Utilidad', 'EBIT'
    subcategory TEXT NOT NULL, -- 'Objetivo Ingresos', 'Ingresos Reales', etc.
    annual_target DECIMAL(15,2),
    ytd_actual DECIMAL(15,2),
    jan DECIMAL(15,2) DEFAULT 0,
    feb DECIMAL(15,2) DEFAULT 0,
    mar DECIMAL(15,2) DEFAULT 0,
    apr DECIMAL(15,2) DEFAULT 0,
    may DECIMAL(15,2) DEFAULT 0,
    jun DECIMAL(15,2) DEFAULT 0,
    jul DECIMAL(15,2) DEFAULT 0,
    aug DECIMAL(15,2) DEFAULT 0,
    sep DECIMAL(15,2) DEFAULT 0,
    oct DECIMAL(15,2) DEFAULT 0,
    nov DECIMAL(15,2) DEFAULT 0,
    dec DECIMAL(15,2) DEFAULT 0,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para ingresos mensuales
CREATE TABLE IF NOT EXISTS public.monthly_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month INTEGER NOT NULL,
    name TEXT NOT NULL,
    planned DECIMAL(15,2) NOT NULL,
    actual DECIMAL(15,2) NOT NULL,
    variance DECIMAL(15,2),
    variance_percentage DECIMAL(5,2),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para comparación de ingresos 2024 vs 2025
CREATE TABLE IF NOT EXISTS public.revenue_comparison (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa TEXT NOT NULL,
    linea_negocio TEXT,
    centro_coste TEXT,
    proyecto TEXT NOT NULL,
    
    -- Datos mensuales 2024
    enero_2024 DECIMAL(15,2) DEFAULT 0,
    febrero_2024 DECIMAL(15,2) DEFAULT 0,
    marzo_2024 DECIMAL(15,2) DEFAULT 0,
    abril_2024 DECIMAL(15,2) DEFAULT 0,
    mayo_2024 DECIMAL(15,2) DEFAULT 0,
    junio_2024 DECIMAL(15,2) DEFAULT 0,
    julio_2024 DECIMAL(15,2) DEFAULT 0,
    agosto_2024 DECIMAL(15,2) DEFAULT 0,
    septiembre_2024 DECIMAL(15,2) DEFAULT 0,
    octubre_2024 DECIMAL(15,2) DEFAULT 0,
    noviembre_2024 DECIMAL(15,2) DEFAULT 0,
    diciembre_2024 DECIMAL(15,2) DEFAULT 0,
    
    -- Datos mensuales 2025
    enero_2025 DECIMAL(15,2) DEFAULT 0,
    febrero_2025 DECIMAL(15,2) DEFAULT 0,
    marzo_2025 DECIMAL(15,2) DEFAULT 0,
    abril_2025 DECIMAL(15,2) DEFAULT 0,
    mayo_2025 DECIMAL(15,2) DEFAULT 0,
    junio_2025 DECIMAL(15,2) DEFAULT 0,
    julio_2025 DECIMAL(15,2) DEFAULT 0,
    agosto_2025 DECIMAL(15,2) DEFAULT 0,
    septiembre_2025 DECIMAL(15,2) DEFAULT 0,
    octubre_2025 DECIMAL(15,2) DEFAULT 0,
    noviembre_2025 DECIMAL(15,2) DEFAULT 0,
    diciembre_2025 DECIMAL(15,2) DEFAULT 0,
    
    -- Porcentajes mensuales
    enero_percentage DECIMAL(5,2) DEFAULT 0,
    febrero_percentage DECIMAL(5,2) DEFAULT 0,
    marzo_percentage DECIMAL(5,2) DEFAULT 0,
    abril_percentage DECIMAL(5,2) DEFAULT 0,
    mayo_percentage DECIMAL(5,2) DEFAULT 0,
    junio_percentage DECIMAL(5,2) DEFAULT 0,
    julio_percentage DECIMAL(5,2) DEFAULT 0,
    agosto_percentage DECIMAL(5,2) DEFAULT 0,
    septiembre_percentage DECIMAL(5,2) DEFAULT 0,
    octubre_percentage DECIMAL(5,2) DEFAULT 0,
    noviembre_percentage DECIMAL(5,2) DEFAULT 0,
    diciembre_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Totales anuales
    total_2024 DECIMAL(15,2) DEFAULT 0,
    total_2025 DECIMAL(15,2) DEFAULT 0,
    total_percentage DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_financial_reports_category ON public.financial_reports(category);
CREATE INDEX IF NOT EXISTS idx_financial_reports_year ON public.financial_reports(year);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_year ON public.monthly_revenue(year);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_month ON public.monthly_revenue(month);
CREATE INDEX IF NOT EXISTS idx_revenue_comparison_empresa ON public.revenue_comparison(empresa);
CREATE INDEX IF NOT EXISTS idx_revenue_comparison_proyecto ON public.revenue_comparison(proyecto);

-- Políticas RLS (Row Level Security) - opcional, para acceso público en dashboard
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_comparison ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública para el dashboard (ajustar según necesidades de seguridad)
CREATE POLICY "Allow public read access" ON public.financial_reports
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.monthly_revenue
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.revenue_comparison
    FOR SELECT USING (true);

-- Permitir inserción/actualización (ajustar según necesidades)
CREATE POLICY "Allow public insert" ON public.financial_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert" ON public.monthly_revenue
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert" ON public.revenue_comparison
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.financial_reports
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update" ON public.monthly_revenue
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update" ON public.revenue_comparison
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.financial_reports
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete" ON public.monthly_revenue
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete" ON public.revenue_comparison
    FOR DELETE USING (true);
