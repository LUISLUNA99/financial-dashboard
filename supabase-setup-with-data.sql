-- Script para agregar datos de prueba al dashboard financiero
-- Ejecutar en el Editor SQL de Supabase

-- Primero, asegurémonos de que las tablas existen
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('checking', 'savings', 'credit', 'investment')) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0.00,
    period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear usuarios de prueba SIN autenticación (solo para el dashboard)
-- Nota: Estos son usuarios independientes, no requieren auth.users
INSERT INTO public.profiles (id, name, created_at) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Juan Pérez', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'María García', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Carlos López', NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear cuentas para cada usuario
INSERT INTO public.accounts (user_id, name, type, balance) VALUES 
    -- Cuentas para Juan Pérez
    ('550e8400-e29b-41d4-a716-446655440001', 'Cuenta Corriente', 'checking', 5000.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'Cuenta de Ahorros', 'savings', 15000.00),
    
    -- Cuentas para María García
    ('550e8400-e29b-41d4-a716-446655440002', 'Cuenta Principal', 'checking', 3500.00),
    ('550e8400-e29b-41d4-a716-446655440002', 'Inversiones', 'investment', 25000.00),
    
    -- Cuentas para Carlos López
    ('550e8400-e29b-41d4-a716-446655440003', 'Cuenta Nómina', 'checking', 4200.00),
    ('550e8400-e29b-41d4-a716-446655440003', 'Tarjeta de Crédito', 'credit', -1500.00)
ON CONFLICT DO NOTHING;

-- Obtener IDs de cuentas para las transacciones
DO $$
DECLARE
    juan_checking_id UUID;
    maria_checking_id UUID;
    carlos_checking_id UUID;
BEGIN
    -- Obtener IDs de cuentas
    SELECT id INTO juan_checking_id FROM public.accounts 
    WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' AND type = 'checking' LIMIT 1;
    
    SELECT id INTO maria_checking_id FROM public.accounts 
    WHERE user_id = '550e8400-e29b-41d4-a716-446655440002' AND type = 'checking' LIMIT 1;
    
    SELECT id INTO carlos_checking_id FROM public.accounts 
    WHERE user_id = '550e8400-e29b-41d4-a716-446655440003' AND type = 'checking' LIMIT 1;

    -- Transacciones para Juan Pérez
    INSERT INTO public.transactions (user_id, account_id, amount, type, category, description, date) VALUES 
        ('550e8400-e29b-41d4-a716-446655440001', juan_checking_id, 3500.00, 'income', 'Salary', 'Salario mensual', NOW() - INTERVAL '5 days'),
        ('550e8400-e29b-41d4-a716-446655440001', juan_checking_id, -1200.00, 'expense', 'Housing', 'Alquiler', NOW() - INTERVAL '3 days'),
        ('550e8400-e29b-41d4-a716-446655440001', juan_checking_id, -300.00, 'expense', 'Food', 'Supermercado', NOW() - INTERVAL '2 days'),
        ('550e8400-e29b-41d4-a716-446655440001', juan_checking_id, -150.00, 'expense', 'Transportation', 'Combustible', NOW() - INTERVAL '1 day'),
        ('550e8400-e29b-41d4-a716-446655440001', juan_checking_id, 500.00, 'income', 'Freelance', 'Proyecto extra', NOW()),

    -- Transacciones para María García
        ('550e8400-e29b-41d4-a716-446655440002', maria_checking_id, 4200.00, 'income', 'Salary', 'Salario mensual', NOW() - INTERVAL '6 days'),
        ('550e8400-e29b-41d4-a716-446655440002', maria_checking_id, -800.00, 'expense', 'Housing', 'Hipoteca', NOW() - INTERVAL '4 days'),
        ('550e8400-e29b-41d4-a716-446655440002', maria_checking_id, -250.00, 'expense', 'Food', 'Restaurantes', NOW() - INTERVAL '3 days'),
        ('550e8400-e29b-41d4-a716-446655440002', maria_checking_id, -100.00, 'expense', 'Entertainment', 'Cinema', NOW() - INTERVAL '1 day'),

    -- Transacciones para Carlos López
        ('550e8400-e29b-41d4-a716-446655440003', carlos_checking_id, 3800.00, 'income', 'Salary', 'Salario mensual', NOW() - INTERVAL '7 days'),
        ('550e8400-e29b-41d4-a716-446655440003', carlos_checking_id, -1000.00, 'expense', 'Housing', 'Alquiler', NOW() - INTERVAL '5 days'),
        ('550e8400-e29b-41d4-a716-446655440003', carlos_checking_id, -200.00, 'expense', 'Transportation', 'Transporte público', NOW() - INTERVAL '3 days'),
        ('550e8400-e29b-41d4-a716-446655440003', carlos_checking_id, -80.00, 'expense', 'Food', 'Almuerzo', NOW() - INTERVAL '1 day');

END $$;

-- Crear presupuestos para cada usuario
INSERT INTO public.budgets (user_id, category, limit_amount, spent, period) VALUES 
    -- Presupuestos para Juan
    ('550e8400-e29b-41d4-a716-446655440001', 'Food', 500.00, 300.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Transportation', 200.00, 150.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Entertainment', 300.00, 0.00, 'monthly'),
    
    -- Presupuestos para María
    ('550e8400-e29b-41d4-a716-446655440002', 'Food', 400.00, 250.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Entertainment', 250.00, 100.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Shopping', 500.00, 0.00, 'monthly'),
    
    -- Presupuestos para Carlos
    ('550e8400-e29b-41d4-a716-446655440003', 'Food', 300.00, 80.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Transportation', 250.00, 200.00, 'monthly'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Entertainment', 200.00, 0.00, 'monthly')
ON CONFLICT DO NOTHING;

-- Verificar que todo se creó correctamente
SELECT 'Usuarios creados:' as tipo, COUNT(*) as cantidad FROM public.profiles
UNION ALL
SELECT 'Cuentas creadas:', COUNT(*) FROM public.accounts
UNION ALL
SELECT 'Transacciones creadas:', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'Presupuestos creados:', COUNT(*) FROM public.budgets;

-- Mostrar resumen por usuario
SELECT 
    p.name as usuario,
    COUNT(DISTINCT a.id) as cuentas,
    COUNT(DISTINCT t.id) as transacciones,
    COUNT(DISTINCT b.id) as presupuestos
FROM public.profiles p
LEFT JOIN public.accounts a ON p.id = a.user_id
LEFT JOIN public.transactions t ON p.id = t.user_id
LEFT JOIN public.budgets b ON p.id = b.user_id
GROUP BY p.id, p.name
ORDER BY p.name;
