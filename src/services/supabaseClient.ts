import { createClient } from '@supabase/supabase-js';
import { User, Transaction, Account, Budget, DashboardStats } from '../types';
import { 
  mockUsers, 
  mockTransactions, 
  mockAccounts, 
  mockBudgets, 
  calculateDashboardStats,
  simulateNetworkDelay 
} from './mockData';

// Reemplaza estas URLs con tus datos reales de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Detectar si estamos usando datos mock (automático)
const isUsingMockData = !process.env.REACT_APP_SUPABASE_URL || 
                       !process.env.REACT_APP_SUPABASE_ANON_KEY ||
                       supabaseUrl === 'https://your-supabase-url.supabase.co' || 
                       supabaseAnonKey === 'your-anon-key';

console.log('🔍 Estado de conexión:', isUsingMockData ? 'Usando datos de ejemplo (mock)' : 'Conectado a Supabase');
console.log('📊 URL Supabase:', supabaseUrl);

// Funciones para manejar usuarios
export const getUsers = async (): Promise<User[]> => {
  console.log('📥 getUsers llamado, usando mock:', isUsingMockData);
  
  if (isUsingMockData) {
    await simulateNetworkDelay();
    console.log('✅ Retornando usuarios mock:', mockUsers.length, 'usuarios');
    return mockUsers;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, created_at'); // Campos específicos sin email
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }
    console.log('✅ Datos de Supabase:', data?.length || 0, 'usuarios');
    // Mapear a formato esperado
    const users = data?.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: `${profile.name.toLowerCase().replace(' ', '.')}@demo.com`, // Email generado
      created_at: profile.created_at
    })) || [];
    return users;
  } catch (error) {
    console.error('❌ Error en getUsers:', error);
    throw error;
  }
};

export const getUser = async (id: string): Promise<User | null> => {
  console.log('📥 getUser llamado para ID:', id, 'usando mock:', isUsingMockData);
  
  if (isUsingMockData) {
    await simulateNetworkDelay();
    const user = mockUsers.find(user => user.id === id) || null;
    console.log('✅ Usuario mock encontrado:', user?.name || 'No encontrado');
    return user;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ Error de Supabase en getUser:', error);
      throw error;
    }
    const user = data ? {
      id: data.id,
      name: data.name,
      email: `${data.name.toLowerCase().replace(' ', '.')}@demo.com`,
      created_at: data.created_at
    } : null;
    console.log('✅ Usuario de Supabase:', user?.name || 'No encontrado');
    return user;
  } catch (error) {
    console.error('❌ Error en getUser:', error);
    throw error;
  }
};

// Funciones para manejar transacciones
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  if (isUsingMockData) {
    await simulateNetworkDelay();
    return mockTransactions
      .filter(transaction => transaction.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
  if (isUsingMockData) {
    await simulateNetworkDelay();
    const newTransaction: Transaction = {
      ...transaction,
      id: `mock_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Funciones para manejar cuentas
export const getAccounts = async (userId: string): Promise<Account[]> => {
  if (isUsingMockData) {
    await simulateNetworkDelay();
    return mockAccounts.filter(account => account.user_id === userId);
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
};

// Funciones para manejar presupuestos
export const getBudgets = async (userId: string): Promise<Budget[]> => {
  if (isUsingMockData) {
    await simulateNetworkDelay();
    return mockBudgets.filter(budget => budget.user_id === userId);
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
};

// Función para obtener estadísticas del dashboard
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const transactions = await getTransactions(userId);
  
  if (isUsingMockData) {
    return calculateDashboardStats(transactions);
  }
  
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

export default supabase;