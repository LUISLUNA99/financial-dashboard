import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PieChart, BarChart3, Calendar, Filter, FileBarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Chart from '../components/Chart';
import UserProfile from '../components/UserProfile';
import MonthlyRevenueReport from '../components/MonthlyRevenueReport';
import { DashboardStats, Transaction, Account, Budget } from '../types';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ variant: 'income' | 'expense' | 'balance' | 'budget' }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.variant) {
      case 'income': return 'hsl(142, 76%, 36%)';
      case 'expense': return 'hsl(0, 84%, 60%)';
      case 'balance': return 'hsl(221, 83%, 53%)';
      case 'budget': return 'hsl(262, 83%, 58%)';
      default: return 'hsl(var(--primary))';
    }
  }};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
`;

const StatChange = styled.div<{ positive: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.positive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'};
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TransactionsSection = styled.div`
  margin-bottom: 2rem;
`;

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 1rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  gap: 1rem;
`;

const TransactionIcon = styled.div<{ type: 'income' | 'expense' }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.type === 'income' 
    ? 'hsl(142, 76%, 36%)' 
    : 'hsl(0, 84%, 60%)'};
  color: white;
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const TransactionCategory = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const TransactionAmount = styled.div<{ type: 'income' | 'expense' }>`
  font-weight: 600;
  color: ${props => props.type === 'income' 
    ? 'hsl(142, 76%, 36%)' 
    : 'hsl(0, 84%, 60%)'};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingSpinner = styled(motion.div)`
  width: 2rem;
  height: 2rem;
  border: 2px solid hsl(var(--muted));
  border-top: 2px solid hsl(var(--primary));
  border-radius: 50%;
  margin: 2rem auto;
`;

// Mock data
const mockStats: DashboardStats = {
  totalIncome: 15420.50,
  totalExpenses: 8934.25,
  currentBalance: 6486.25,
  balance: 6486.25,
  budgetUsed: 67.8,
  monthlyChange: 12.5,
  monthlyGrowth: 12.5
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    user_id: 'user1',
    amount: 2500.00,
    description: 'Salary Deposit',
    category: 'Income',
    type: 'income',
    date: new Date().toISOString(),
    account_id: 'acc1',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    amount: -850.00,
    description: 'Rent Payment',
    category: 'Housing',
    type: 'expense',
    date: new Date().toISOString(),
    account_id: 'acc1',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user1',
    amount: -125.50,
    description: 'Grocery Shopping',
    category: 'Food',
    type: 'expense',
    date: new Date().toISOString(),
    account_id: 'acc1',
    created_at: new Date().toISOString()
  }
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue'>('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Financial Dashboard</Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button 
            variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'revenue' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('revenue')}
          >
            <FileBarChart size={16} />
            Reportes Mensuales
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar size={16} />
            {timeFilter === 'month' ? 'This Month' : 'This Year'}
          </Button>
        </div>
      </Header>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
          {stats && (
            <StatsGrid>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard>
                  <StatIcon variant="income">
                    <TrendingUp size={20} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{formatCurrency(stats.totalIncome)}</StatValue>
                    <StatLabel>Total Income</StatLabel>
                    <StatChange positive={stats.monthlyChange > 0}>
                      <TrendingUp size={12} />
                      +{stats.monthlyChange}% from last month
                    </StatChange>
                  </StatContent>
                </StatCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatCard>
                  <StatIcon variant="expense">
                    <TrendingDown size={20} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{formatCurrency(stats.totalExpenses)}</StatValue>
                    <StatLabel>Total Expenses</StatLabel>
                    <StatChange positive={false}>
                      <TrendingDown size={12} />
                      Monthly spending
                    </StatChange>
                  </StatContent>
                </StatCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatCard>
                  <StatIcon variant="balance">
                    <DollarSign size={20} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{formatCurrency(stats.currentBalance)}</StatValue>
                    <StatLabel>Current Balance</StatLabel>
                    <StatChange positive={stats.currentBalance > 0}>
                      <TrendingUp size={12} />
                      Available funds
                    </StatChange>
                  </StatContent>
                </StatCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatCard>
                  <StatIcon variant="budget">
                    <PieChart size={20} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{stats.budgetUsed}%</StatValue>
                    <StatLabel>Budget Used</StatLabel>
                    <StatChange positive={stats.budgetUsed < 80}>
                      <Badge variant={stats.budgetUsed < 80 ? 'success' : 'destructive'}>
                        {stats.budgetUsed < 80 ? 'On Track' : 'Over Budget'}
                      </Badge>
                    </StatChange>
                  </StatContent>
                </StatCard>
              </motion.div>
            </StatsGrid>
          )}

          <MainContent>
            <div>
              <ChartsSection>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Chart
                    type="line"
                    title="Income vs Expenses"
                    data={[
                      { date: 'Jan', value: 3200, category: 'Income' },
                      { date: 'Feb', value: 3400, category: 'Income' },
                      { date: 'Mar', value: 3100, category: 'Income' },
                      { date: 'Apr', value: 3600, category: 'Income' },
                      { date: 'May', value: 3800, category: 'Income' },
                      { date: 'Jun', value: 4000, category: 'Income' }
                    ]}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Chart
                    type="pie"
                    title="Expense Categories"
                    data={[
                      { date: 'Housing', value: 1200, category: 'Housing' },
                      { date: 'Food', value: 400, category: 'Food' },
                      { date: 'Transportation', value: 300, category: 'Transportation' },
                      { date: 'Entertainment', value: 200, category: 'Entertainment' }
                    ]}
                  />
                </motion.div>
              </ChartsSection>

              <TransactionsSection>
                <TransactionsHeader>
                  <SectionTitle>Recent Transactions</SectionTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </TransactionsHeader>

                <TransactionsList>
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <TransactionIcon type={transaction.type}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </TransactionIcon>
                      <TransactionDetails>
                        <TransactionDescription>
                          {transaction.description}
                        </TransactionDescription>
                        <TransactionCategory>
                          {transaction.category} • {formatDate(transaction.date)}
                        </TransactionCategory>
                      </TransactionDetails>
                      <TransactionAmount type={transaction.type}>
                        {transaction.type === 'income' ? '+' : ''}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TransactionAmount>
                    </TransactionItem>
                  ))}
                </TransactionsList>
              </TransactionsSection>
            </div>

            <Sidebar>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <UserProfile userId="user1" />
              </motion.div>
            </Sidebar>
          </MainContent>
        </>
      )}

      {/* Revenue Reports View */}
      {activeTab === 'revenue' && (
        <MonthlyRevenueReport />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
