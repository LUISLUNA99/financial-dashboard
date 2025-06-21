-- Financial Dashboard Database Setup for Supabase (Safe Version)
-- This script can be run multiple times without errors
-- Run this script in your Supabase SQL editor to create the necessary tables

-- Create Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('checking', 'savings', 'credit', 'investment')) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transactions table
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

-- Create Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0.00,
    period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Financial Reports table for Buzzword data
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    annual_target DECIMAL(15,2),
    ytd_actual DECIMAL(15,2),
    jan DECIMAL(15,2),
    feb DECIMAL(15,2),
    mar DECIMAL(15,2),
    apr DECIMAL(15,2),
    may DECIMAL(15,2),
    jun DECIMAL(15,2),
    jul DECIMAL(15,2),
    aug DECIMAL(15,2),
    sep DECIMAL(15,2),
    oct DECIMAL(15,2),
    nov DECIMAL(15,2),
    dec DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Monthly Revenue Summary table
CREATE TABLE IF NOT EXISTS public.monthly_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER CHECK (month >= 1 AND month <= 12) NOT NULL,
    month_name TEXT NOT NULL,
    planned_income DECIMAL(15,2),
    actual_income DECIMAL(15,2),
    variance DECIMAL(15,2),
    variance_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month)
);

-- Create indexes for better performance (IF NOT EXISTS is implicit for indexes)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_reports_year ON public.financial_reports(year);
CREATE INDEX IF NOT EXISTS idx_financial_reports_category ON public.financial_reports(category);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_year_month ON public.monthly_revenue(year, month);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Function to safely create policies
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    policy_definition TEXT
) RETURNS VOID AS $$
BEGIN
    -- Check if policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name
    ) THEN
        -- Create the policy
        EXECUTE policy_definition;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies safely
SELECT create_policy_if_not_exists(
    'Users can view own profile',
    'profiles',
    'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own profile',
    'profiles',
    'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
    'Users can insert own profile',
    'profiles',
    'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)'
);

-- Accounts policies
SELECT create_policy_if_not_exists(
    'Users can view own accounts',
    'accounts',
    'CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can insert own accounts',
    'accounts',
    'CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own accounts',
    'accounts',
    'CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can delete own accounts',
    'accounts',
    'CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id)'
);

-- Transactions policies
SELECT create_policy_if_not_exists(
    'Users can view own transactions',
    'transactions',
    'CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can insert own transactions',
    'transactions',
    'CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own transactions',
    'transactions',
    'CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can delete own transactions',
    'transactions',
    'CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id)'
);

-- Budgets policies
SELECT create_policy_if_not_exists(
    'Users can view own budgets',
    'budgets',
    'CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can insert own budgets',
    'budgets',
    'CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own budgets',
    'budgets',
    'CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can delete own budgets',
    'budgets',
    'CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id)'
);

-- Create or replace functions (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_income DECIMAL(12,2);
    total_expenses DECIMAL(12,2);
    current_balance DECIMAL(12,2);
    monthly_growth DECIMAL(5,2);
BEGIN
    -- Calculate total income for current month
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM public.transactions
    WHERE user_id = user_uuid 
    AND type = 'income'
    AND date >= date_trunc('month', CURRENT_DATE);

    -- Calculate total expenses for current month
    SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_expenses
    FROM public.transactions
    WHERE user_id = user_uuid 
    AND type = 'expense'
    AND date >= date_trunc('month', CURRENT_DATE);

    -- Calculate current balance (sum of all account balances)
    SELECT COALESCE(SUM(balance), 0) INTO current_balance
    FROM public.accounts
    WHERE user_id = user_uuid;

    -- Calculate monthly growth (simplified calculation)
    monthly_growth := CASE 
        WHEN total_expenses > 0 THEN 
            ((total_income - total_expenses) / total_expenses) * 100
        ELSE 0 
    END;

    -- Build result JSON
    result := json_build_object(
        'totalIncome', total_income,
        'totalExpenses', total_expenses,
        'balance', current_balance,
        'currentBalance', current_balance,
        'monthlyGrowth', monthly_growth,
        'monthlyChange', monthly_growth,
        'budgetUsed', 0
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up helper function
DROP FUNCTION IF EXISTS create_policy_if_not_exists(TEXT, TEXT, TEXT);

-- Script completado exitosamente
-- Todas las tablas, índices, políticas RLS y funciones han sido creadas o actualizadas

-- Verificar que las tablas importantes para los reportes financieros existan
DO $$
BEGIN
    -- Verificar financial_reports
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_reports') THEN
        RAISE NOTICE 'Tabla financial_reports creada correctamente';
    END IF;
    
    -- Verificar monthly_revenue
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'monthly_revenue') THEN
        RAISE NOTICE 'Tabla monthly_revenue creada correctamente';
    END IF;
    
    RAISE NOTICE 'Setup completado exitosamente - Base de datos lista para usar!';
END $$;
