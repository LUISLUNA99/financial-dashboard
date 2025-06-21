export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    updated_at?: string;
}

export interface ChartData {
    date: string;
    value: number;
    category?: string;
}

export interface FinancialData {
    userId: string;
    data: ChartData[];
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
    account_id: string;
    created_at: string;
}

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    balance: number;
    currency: string;
    created_at: string;
}

export interface Budget {
    id: string;
    user_id: string;
    category: string;
    limit: number;
    spent: number;
    period: 'weekly' | 'monthly' | 'yearly';
    created_at: string;
}

export interface FinancialReport {
    id: string;
    year: number;
    category: string;
    subcategory: string;
    annual_target?: number;
    ytd_actual?: number;
    jan?: number;
    feb?: number;
    mar?: number;
    apr?: number;
    may?: number;
    jun?: number;
    jul?: number;
    aug?: number;
    sep?: number;
    oct?: number;
    nov?: number;
    dec?: number;
    created_at: string;
    updated_at?: string;
}

export interface MonthlyRevenue {
    id: string;
    year: number;
    month: number;
    month_name: string;
    planned_income?: number;
    actual_income?: number;
    variance?: number;
    variance_percentage?: number;
    created_at: string;
}

export interface RevenueData {
    month: string;
    planned: number;
    actual: number;
    variance: number;
    percentage: number;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyGrowth: number;
    currentBalance: number;
    budgetUsed: number;
    monthlyChange: number;
}