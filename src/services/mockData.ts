import { User, Transaction, Account, Budget, DashboardStats } from '../types';

// Datos de ejemplo para desarrollo y testing
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@email.com',
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    created_at: '2024-03-10T10:00:00Z',
  }
];

export const mockTransactions: Transaction[] = [
  // Transacciones para Juan Pérez (id: '1')
  {
    id: 't1',
    user_id: '1',
    amount: 3500,
    type: 'income',
    category: 'Salario',
    description: 'Salario mensual',
    date: '2024-12-01',
    account_id: 'acc1',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 't2',
    user_id: '1',
    amount: 800,
    type: 'expense',
    category: 'Vivienda',
    description: 'Alquiler',
    date: '2024-12-01',
    account_id: 'acc1',
    created_at: '2024-12-01T10:30:00Z',
  },
  {
    id: 't3',
    user_id: '1',
    amount: 300,
    type: 'expense',
    category: 'Alimentación',
    description: 'Supermercado',
    date: '2024-12-02',
    account_id: 'acc1',
    created_at: '2024-12-02T15:00:00Z',
  },
  {
    id: 't4',
    user_id: '1',
    amount: 150,
    type: 'expense',
    category: 'Transporte',
    description: 'Gasolina',
    date: '2024-12-03',
    account_id: 'acc1',
    created_at: '2024-12-03T09:00:00Z',
  },
  {
    id: 't5',
    user_id: '1',
    amount: 200,
    type: 'income',
    category: 'Freelance',
    description: 'Proyecto web',
    date: '2024-12-05',
    account_id: 'acc1',
    created_at: '2024-12-05T14:00:00Z',
  },
  {
    id: 't6',
    user_id: '1',
    amount: 120,
    type: 'expense',
    category: 'Entretenimiento',
    description: 'Cine y cena',
    date: '2024-12-07',
    account_id: 'acc1',
    created_at: '2024-12-07T20:00:00Z',
  },
  {
    id: 't7',
    user_id: '1',
    amount: 80,
    type: 'expense',
    category: 'Servicios',
    description: 'Internet',
    date: '2024-12-10',
    account_id: 'acc1',
    created_at: '2024-12-10T11:00:00Z',
  },
  {
    id: 't8',
    user_id: '1',
    amount: 500,
    type: 'expense',
    category: 'Alimentación',
    description: 'Compra mensual',
    date: '2024-12-12',
    account_id: 'acc1',
    created_at: '2024-12-12T16:00:00Z',
  },
  {
    id: 't9',
    user_id: '1',
    amount: 3500,
    type: 'income',
    category: 'Salario',
    description: 'Salario mensual',
    date: '2025-01-01',
    account_id: 'acc1',
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 't10',
    user_id: '1',
    amount: 800,
    type: 'expense',
    category: 'Vivienda',
    description: 'Alquiler',
    date: '2025-01-01',
    account_id: 'acc1',
    created_at: '2025-01-01T10:30:00Z',
  },
  {
    id: 't11',
    user_id: '1',
    amount: 250,
    type: 'expense',
    category: 'Alimentación',
    description: 'Supermercado semanal',
    date: '2025-01-05',
    account_id: 'acc1',
    created_at: '2025-01-05T18:00:00Z',
  },
  {
    id: 't12',
    user_id: '1',
    amount: 100,
    type: 'expense',
    category: 'Transporte',
    description: 'Metro mensual',
    date: '2025-01-08',
    account_id: 'acc1',
    created_at: '2025-01-08T08:00:00Z',
  },
  // Transacciones para María García (id: '2')
  {
    id: 't13',
    user_id: '2',
    amount: 2800,
    type: 'income',
    category: 'Salario',
    description: 'Salario mensual',
    date: '2024-12-01',
    account_id: 'acc2',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 't14',
    user_id: '2',
    amount: 600,
    type: 'expense',
    category: 'Vivienda',
    description: 'Alquiler',
    date: '2024-12-01',
    account_id: 'acc2',
    created_at: '2024-12-01T10:30:00Z',
  },
  {
    id: 't15',
    user_id: '2',
    amount: 200,
    type: 'expense',
    category: 'Alimentación',
    description: 'Groceries',
    date: '2024-12-03',
    account_id: 'acc2',
    created_at: '2024-12-03T17:00:00Z',
  },
  // Transacciones para Carlos López (id: '3')
  {
    id: 't16',
    user_id: '3',
    amount: 4200,
    type: 'income',
    category: 'Salario',
    description: 'Salario senior',
    date: '2024-12-01',
    account_id: 'acc3',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 't17',
    user_id: '3',
    amount: 1200,
    type: 'expense',
    category: 'Vivienda',
    description: 'Hipoteca',
    date: '2024-12-01',
    account_id: 'acc3',
    created_at: '2024-12-01T10:30:00Z',
  },
];

export const mockAccounts: Account[] = [
  {
    id: 'a1',
    user_id: '1',
    name: 'Cuenta Corriente',
    type: 'checking',
    balance: 2500,
    currency: 'EUR',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'a2',
    user_id: '1',
    name: 'Cuenta de Ahorros',
    type: 'savings',
    balance: 15000,
    currency: 'EUR',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'a3',
    user_id: '2',
    name: 'Cuenta Principal',
    type: 'checking',
    balance: 1800,
    currency: 'EUR',
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'a4',
    user_id: '3',
    name: 'Cuenta Business',
    type: 'checking',
    balance: 5200,
    currency: 'EUR',
    created_at: '2024-03-10T10:00:00Z',
  },
];

export const mockBudgets: Budget[] = [
  {
    id: 'b1',
    user_id: '1',
    category: 'Alimentación',
    limit: 600,
    spent: 800,
    period: 'monthly',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'b2',
    user_id: '1',
    category: 'Entretenimiento',
    limit: 200,
    spent: 120,
    period: 'monthly',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'b3',
    user_id: '1',
    category: 'Transporte',
    limit: 300,
    spent: 250,
    period: 'monthly',
    created_at: '2024-12-01T10:00:00Z',
  },
];

// Función para calcular estadísticas del dashboard
export const calculateDashboardStats = (transactions: Transaction[]): DashboardStats => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Calcular crecimiento mensual (último mes vs mes anterior)
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= lastMonth && date < currentMonth;
  });
  
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= currentMonth;
  });
  
  const lastMonthBalance = lastMonthTransactions
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const currentMonthBalance = currentMonthTransactions
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const monthlyGrowth = lastMonthBalance !== 0 
    ? ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 
    : 0;
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    currentBalance: balance,
    monthlyGrowth,
    monthlyChange: monthlyGrowth,
    budgetUsed: 67.8 // Mock value
  };
};

// Función para simular delay de red
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
