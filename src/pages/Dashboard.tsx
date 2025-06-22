import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  PieChart,
  BarChart3,
  Users,
  Calendar,
  Filter,
  Search,
  Bell,
  Settings,
  FileText,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { getTransactions, getUsers, getDashboardStats } from '../services/supabaseClient';
import Chart, { IncomeExpenseChart, ExpenseCategoryChart } from '../components/Chart';
import UserProfile from '../components/UserProfile';
import MonthlyRevenueReport from '../components/MonthlyRevenueReport';
import MonthlyIncomeChart from '../components/MonthlyIncomeChart';
import GrossMarginEbitChart from '../components/GrossMarginEbitChart';
// import FinancialHeader from '../components/FinancialHeader';
import RoleBasedContent from '../components/RoleBasedContent';
import RoleGuard from '../components/RoleGuard';
import RevenueComparisonCharts from '../components/RevenueComparisonCharts';
import ExecutiveDashboard from '../components/ExecutiveDashboard';
import SmartAlertsSystem from '../components/SmartAlertsSystem';
import ReportExporter from '../components/ReportExporter';
import RealTimeMetrics from '../components/RealTimeMetrics';
import CompanyFilters from '../components/CompanyFilters';
import ProgressGauges from '../components/ProgressGauges';
import TreemapChart from '../components/TreemapChart';
import RadarChart from '../components/RadarChart';
import EnhancedMonthlyIncomeChart from '../components/EnhancedMonthlyIncomeChart';
import EnhancedRevenueComparison from '../components/EnhancedRevenueComparison';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../components/ui';
import { Transaction, User, ChartData, DashboardStats } from '../types';
import dayjs from 'dayjs';

// Styled Components con diseño V0.dev
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(214 32% 91%) 100%);
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const DashboardContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  color: hsl(222.2 84% 4.9%);
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const Subtitle = styled.p`
  color: hsl(215.4 16.3% 46.9%);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)<{ color?: string }>`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color || 'hsl(221.2 83.2% 53.3%)'};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${({ color }) => color || 'hsl(221.2 83.2% 53.3% / 0.1)'};
  color: ${({ color }) => color || 'hsl(221.2 83.2% 53.3%)'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: hsl(222.2 84% 4.9%);
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(215.4 16.3% 46.9%);
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ positive }) => 
    positive ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'};
`;

const UserSelector = styled.select`
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: hsl(222.2 84% 4.9%);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: 2px solid hsl(221.2 83.2% 53.3%);
    outline-offset: 2px;
    border-color: hsl(221.2 83.2% 53.3%);
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const TransactionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TransactionsFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    border-color: hsl(221.2 83.2% 53.3% / 0.3);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const TransactionIcon = styled.div<{ type: 'income' | 'expense' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: ${({ type }) => 
    type === 'income' 
      ? 'hsl(142.1 76.2% 36.3% / 0.1)' 
      : 'hsl(0 84.2% 60.2% / 0.1)'};
  color: ${({ type }) => 
    type === 'income' 
      ? 'hsl(142.1 76.2% 36.3%)' 
      : 'hsl(0 84.2% 60.2%)'};
`;

const TransactionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const TransactionDescription = styled.div`
  font-weight: 500;
  color: hsl(222.2 84% 4.9%);
`;

const TransactionMeta = styled.div`
  font-size: 0.875rem;
  color: hsl(215.4 16.3% 46.9%);
`;

const TransactionAmount = styled.div<{ type: 'income' | 'expense' }>`
  font-weight: 600;
  color: ${({ type }) => 
    type === 'income' 
      ? 'hsl(142.1 76.2% 36.3%)' 
      : 'hsl(0 84.2% 60.2%)'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1rem;
  color: hsl(215.4 16.3% 46.9%);
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: hsl(0 84.2% 60.2%);
  padding: 2rem;
  background: hsl(0 84.2% 60.2% / 0.1);
  border-radius: 0.5rem;
  border: 1px solid hsl(0 84.2% 60.2% / 0.2);
`;

const InfoCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const InfoContent = styled(CardContent)`
  padding: 1.5rem;
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const InfoTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(222.2 84% 4.9%);
`;

const InfoDescription = styled.p`
  margin: 0;
  color: hsl(215.4 16.3% 46.9%);
  line-height: 1.5;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ active }) => active ? 'hsl(222.2 84% 4.9%)' : 'hsl(215.4 16.3% 46.9%)'};
  background: ${({ active }) => active ? 'hsl(210 40% 98%)' : 'transparent'};
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: hsl(210 40% 98%);
  }
`;

// Inline Financial Header Component
const FinancialHeaderInline = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProfileSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const Avatar = styled.div<{ role: string }>`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.role) {
      case 'admin': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'user': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'viewer': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: 0.25rem 0.75rem;
  background: ${props => {
    switch (props.role) {
      case 'admin': return '#f59e0b';
      case 'user': return '#3b82f6';
      case 'viewer': return '#8b5cf6';
      default: return '#10b981';
    }
  }};
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MetricsSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MetricCard = styled(motion.div)`
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MetricInfo = styled.div`
  flex: 1;
`;

const MetricLabel = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
`;

const MetricValue = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reporte' | 'ingresos' | 'rentabilidad' | 'comparacion' | 'ejecutivo' | 'alertas' | 'exportar' | 'metricas' | 'filtros' | 'objetivos' | 'avanzado'>('dashboard');
  
  // Add state for company filters
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error al cargar los usuarios');
        toast.error('Error al cargar los usuarios');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setError(null);

          const [transactionsData, statsData] = await Promise.all([
            getTransactions(selectedUserId),
            getDashboardStats(selectedUserId)
          ]);

          setTransactions(transactionsData);
          setStats(statsData);
          toast.success('Datos actualizados correctamente');
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Error al cargar los datos del usuario');
          toast.error('Error al cargar los datos');
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [selectedUserId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleTabChange = (tab: 'dashboard' | 'reporte' | 'ingresos' | 'rentabilidad' | 'comparacion' | 'ejecutivo' | 'alertas' | 'exportar' | 'metricas' | 'filtros' | 'objetivos' | 'avanzado') => {
    setActiveTab(tab);
  };

  if (error && users.length === 0) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <ErrorMessage>{error}</ErrorMessage>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        <Header>
          <HeaderLeft>
            <Title>Dashboard Financiero</Title>
            <Subtitle>
              Gestiona tus finanzas personales con análisis detallados y visualizaciones interactivas
            </Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </HeaderRight>
        </Header>

        {/* Nuevo Header Financiero */}
        <FinancialHeaderInline>
          <ProfileSection>
            <UserSection>
              <Avatar role={user?.role || 'user'}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <UserInfo>
                <UserName>{user?.name || 'Usuario'}</UserName>
                <UserEmail>
                  {user?.email || 'usuario@demo.com'}
                  {user?.role && (
                    <RoleBadge role={user.role}>
                      {user.role}
                    </RoleBadge>
                  )}
                </UserEmail>
              </UserInfo>
            </UserSection>
            <LogoutButton
              onClick={() => {
                logout();
                toast.success('Sesión cerrada correctamente');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={16} />
              Logout
            </LogoutButton>
          </ProfileSection>

          <MetricsSection>
            {['admin', 'user', 'viewer'].includes(user?.role || '') && (
              <MetricCard whileHover={{ y: -2 }}>
                <MetricIcon color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                  <DollarSign size={20} />
                </MetricIcon>
                <MetricInfo>
                  <MetricLabel>Ingresos del Mes</MetricLabel>
                  <MetricValue>$2,847,320</MetricValue>
                </MetricInfo>
              </MetricCard>
            )}
            
            {['admin', 'user'].includes(user?.role || '') && (
              <MetricCard whileHover={{ y: -2 }}>
                <MetricIcon color="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)">
                  <TrendingUp size={20} />
                </MetricIcon>
                <MetricInfo>
                  <MetricLabel>Crecimiento</MetricLabel>
                  <MetricValue>+12.5%</MetricValue>
                </MetricInfo>
              </MetricCard>
            )}
            
            {user?.role === 'admin' && (
              <MetricCard whileHover={{ y: -2 }}>
                <MetricIcon color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                  <Target size={20} />
                </MetricIcon>
                <MetricInfo>
                  <MetricLabel>Meta Anual</MetricLabel>
                  <MetricValue>78% Completado</MetricValue>
                </MetricInfo>
              </MetricCard>
            )}
          </MetricsSection>
        </FinancialHeaderInline>

        {/* Contenido basado en roles */}
        <RoleBasedContent />

        {users.length > 0 && (
          <div style={{ display: 'none' }}>
            <UserSelector value={selectedUserId} onChange={handleUserChange}>
              <option value="">Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </UserSelector>
          </div>
        )}

        {true && (
          <>

            <Tabs>
              <Tab 
                active={activeTab === 'dashboard'} 
                onClick={() => handleTabChange('dashboard')}
              >
                Dashboard
              </Tab>
              <Tab 
                active={activeTab === 'reporte'} 
                onClick={() => handleTabChange('reporte')}
              >
                Reporte Mensual
              </Tab>
              <Tab 
                active={activeTab === 'ingresos'} 
                onClick={() => handleTabChange('ingresos')}
              >
                Ingresos Mensuales
              </Tab>
              <Tab 
                active={activeTab === 'rentabilidad'} 
                onClick={() => handleTabChange('rentabilidad')}
              >
                KPIs Financieros
              </Tab>
              <Tab 
                active={activeTab === 'comparacion'} 
                onClick={() => handleTabChange('comparacion')}
              >
                2024 vs 2025
              </Tab>
              {user?.role === 'admin' && (
                <Tab 
                  active={activeTab === 'ejecutivo'} 
                  onClick={() => handleTabChange('ejecutivo')}
                >
                  📊 Ejecutivo
                </Tab>
              )}
              {user?.role !== 'viewer' && (
                <Tab 
                  active={activeTab === 'alertas'} 
                  onClick={() => handleTabChange('alertas')}
                >
                  🚨 Alertas
                </Tab>
              )}
              {user?.role !== 'viewer' && (
                <Tab 
                  active={activeTab === 'exportar'} 
                  onClick={() => handleTabChange('exportar')}
                >
                  📄 Exportar
                </Tab>
              )}
              <Tab 
                active={activeTab === 'metricas'} 
                onClick={() => handleTabChange('metricas')}
              >
                ⚡ Métricas
              </Tab>
              <Tab 
                active={activeTab === 'filtros'} 
                onClick={() => handleTabChange('filtros')}
              >
                🔍 Filtros Avanzados
              </Tab>
              <Tab 
                active={activeTab === 'objetivos'} 
                onClick={() => handleTabChange('objetivos')}
              >
                🎯 Objetivos
              </Tab>
              <Tab 
                active={activeTab === 'avanzado'} 
                onClick={() => handleTabChange('avanzado')}
              >
                📈 Gráficos Avanzados
              </Tab>
            </Tabs>

            {activeTab === 'dashboard' && (
              <ChartsGrid>
                <div>
                  <IncomeExpenseChart transactions={transactions} />
                </div>
                <div>
                  <ExpenseCategoryChart transactions={transactions} />
                </div>
              </ChartsGrid>
            )}

            {activeTab === 'reporte' && (
              <MonthlyRevenueReport />
            )}

            {activeTab === 'ingresos' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <BarChart3 className="h-5 w-5" style={{ color: 'hsl(221.2 83.2% 53.3%)' }} />
                      <InfoTitle>
                        Análisis de Ingresos Mensuales 2025
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Comparación entre los ingresos planificados y reales por mes. 
                      Los datos muestran el rendimiento financiero actual versus las proyecciones iniciales.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <EnhancedMonthlyIncomeChart />
              </div>
            )}

            {activeTab === 'rentabilidad' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <TrendingUp className="h-5 w-5" style={{ color: 'hsl(142.1 76.2% 36.3%)' }} />
                      <InfoTitle>
                        KPIs Financieros - Ingresos, Gross Margin y EBIT
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Análisis integral de los principales indicadores financieros: Ingresos Reales, Gross Margin y EBIT. 
                      Vista consolidada para evaluar la rentabilidad y eficiencia operativa del negocio.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <GrossMarginEbitChart />
              </div>
            )}

            {activeTab === 'comparacion' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <BarChart3 className="h-5 w-5" style={{ color: 'hsl(262.1 83.3% 57.8%)' }} />
                      <InfoTitle>
                        Comparación de Ingresos 2024 vs 2025
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Análisis comparativo detallado de los ingresos entre 2024 y 2025 por empresa y proyecto. 
                      Visualización mensual y anual para identificar tendencias y oportunidades de crecimiento.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <EnhancedRevenueComparison />
              </div>
            )}

            {activeTab === 'ejecutivo' && (
              <RoleGuard allowedRoles={['admin']}>
                <ExecutiveDashboard />
              </RoleGuard>
            )}

            {activeTab === 'alertas' && (
              <RoleGuard allowedRoles={['admin', 'user']}>
                <SmartAlertsSystem />
              </RoleGuard>
            )}

            {activeTab === 'exportar' && (
              <RoleGuard allowedRoles={['admin', 'user']}>
                <ReportExporter />
              </RoleGuard>
            )}

            {activeTab === 'metricas' && (
              <RealTimeMetrics />
            )}

            {activeTab === 'filtros' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <Filter className="h-5 w-5" style={{ color: 'hsl(262.1 83.3% 57.8%)' }} />
                      <InfoTitle>
                        Filtros Avanzados por Empresa
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Sistema de filtrado avanzado para analizar datos por empresa (BUZZWORD vs INOVITZ), 
                      categorías financieras y períodos de tiempo específicos. Permite comparaciones detalladas 
                      y análisis segmentado de la información financiera.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <CompanyFilters 
                  selectedCompany={selectedCompany}
                  selectedCategory={selectedCategory}
                  selectedTimeRange={selectedTimeRange}
                  onCompanyChange={setSelectedCompany}
                  onCategoryChange={setSelectedCategory}
                  onTimeRangeChange={setSelectedTimeRange}
                />
              </div>
            )}

            {activeTab === 'objetivos' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <TrendingUp className="h-5 w-5" style={{ color: 'hsl(142.1 76.2% 36.3%)' }} />
                      <InfoTitle>
                        Seguimiento de Objetivos Financieros
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Medidores de progreso visual para monitorear el cumplimiento de objetivos financieros clave. 
                      Incluye seguimiento de ingresos, márgenes y EBIT con indicadores de rendimiento en tiempo real.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <ProgressGauges 
                  data={[
                    { title: 'Ingresos 2025', current: 7051678, target: 8000000, unit: 'MXN', format: 'currency' },
                    { title: 'Gross Margin', current: 2546166, target: 3000000, unit: 'MXN', format: 'currency' },
                    { title: 'EBIT', current: 1739799, target: 2000000, unit: 'MXN', format: 'currency' }
                  ]}
                />
              </div>
            )}

            {activeTab === 'avanzado' && (
              <div>
                <InfoCard>
                  <InfoContent>
                    <InfoHeader>
                      <PieChart className="h-5 w-5" style={{ color: 'hsl(262.1 83.3% 57.8%)' }} />
                      <InfoTitle>
                        Visualizaciones Avanzadas
                      </InfoTitle>
                    </InfoHeader>
                    <InfoDescription>
                      Gráficos especializados para análisis profundo de datos financieros. 
                      Incluye mapas de calor jerárquicos y análisis radar multidimensional para 
                      identificar patrones complejos y oportunidades de optimización.
                    </InfoDescription>
                  </InfoContent>
                </InfoCard>
                <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
                  <TreemapChart />
                  <RadarChart />
                </div>
              </div>
            )}

            <TransactionsSection>
              <Card>
                <CardHeader>
                  <TransactionsHeader>
                    <div>
                      <CardTitle>Transacciones Recientes</CardTitle>
                      <CardDescription>
                        Últimas {transactions.slice(0, 10).length} transacciones
                      </CardDescription>
                    </div>
                    <TransactionsFilters>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Fecha
                      </Button>
                    </TransactionsFilters>
                  </TransactionsHeader>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner>Cargando transacciones...</LoadingSpinner>
                  ) : (
                    <TransactionsList>
                      {transactions.slice(0, 10).map((transaction, index) => (
                        <TransactionItem
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <TransactionInfo>
                            <TransactionIcon type={transaction.type}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </TransactionIcon>
                            <TransactionDetails>
                              <TransactionDescription>
                                {transaction.description}
                              </TransactionDescription>
                              <TransactionMeta>
                                {transaction.category} • {dayjs(transaction.date).format('DD/MM/YYYY')}
                              </TransactionMeta>
                            </TransactionDetails>
                          </TransactionInfo>
                          <TransactionAmount type={transaction.type}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </TransactionAmount>
                        </TransactionItem>
                      ))}
                    </TransactionsList>
                  )}

                  {!loading && transactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(215.4 16.3% 46.9%)' }}>
                      No hay transacciones para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>
            </TransactionsSection>
          </>
        )}
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
