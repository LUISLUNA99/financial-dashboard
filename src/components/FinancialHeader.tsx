import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { getFinancialReportsByCategory } from '../services/financialDataService';
import { FinancialReport } from '../types';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: hsl(0 0% 100%);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

const Avatar = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(222.2 84% 4.9%);
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: hsl(215.4 16.3% 46.9%);
  margin: 0.25rem 0 0 0;
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const MetricCard = styled.div<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)';
      case 'warning': return 'linear-gradient(135deg, #fef7e6 0%, #fffbf0 100%)';
      case 'danger': return 'linear-gradient(135deg, #fff1f0 0%, #fef7f7 100%)';
      default: return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
    }
  }};
  border: 1px solid ${({ variant }) => {
    switch (variant) {
      case 'success': return 'hsl(142.1 76.2% 85%)';
      case 'warning': return 'hsl(38 92% 85%)';
      case 'danger': return 'hsl(0 84.2% 85%)';
      default: return 'hsl(214.3 31.8% 91.4%)';
    }
  }};
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.15);
    transform: translateY(-2px);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const MetricTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(215.4 16.3% 46.9%);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricIcon = styled.div<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'hsl(142.1 76.2% 36.3%)';
      case 'warning': return 'hsl(38 92% 50%)';
      case 'danger': return 'hsl(0 84.2% 60.2%)';
      default: return 'hsl(221.2 83.2% 53.3%)';
    }
  }};
  color: white;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(222.2 84% 4.9%);
  margin-bottom: 0.25rem;
  line-height: 1;
`;

const MetricSubValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: hsl(215.4 16.3% 46.9%);
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const MetricDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricTarget = styled.div`
  font-size: 0.75rem;
  color: hsl(215.4 16.3% 46.9%);
  flex: 1;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 6px;
  background: hsl(214.3 31.8% 91.4%);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number; variant?: 'success' | 'warning' | 'danger' }>`
  height: 100%;
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'hsl(142.1 76.2% 36.3%)';
      case 'warning': return 'hsl(38 92% 50%)';
      case 'danger': return 'hsl(0 84.2% 60.2%)';
      default: return 'hsl(221.2 83.2% 53.3%)';
    }
  }};
  border-radius: 3px;
  transition: width 0.6s ease;
`;

const ProgressPercentage = styled.div<{ variant?: 'success' | 'warning' | 'danger' }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'hsl(142.1 76.2% 36.3%)';
      case 'warning': return 'hsl(38 92% 50%)';
      case 'danger': return 'hsl(0 84.2% 60.2%)';
      default: return 'hsl(221.2 83.2% 53.3%)';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  color: hsl(215.4 16.3% 46.9%);
`;

interface FinancialMetric {
  title: string;
  icon: React.ReactNode;
  actualValue: number;
  targetValue: number;
  ytdTarget: number;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

const FinancialHeader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressVariant = (percentage: number): 'success' | 'warning' | 'danger' => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  useEffect(() => {
    const loadFinancialMetrics = async () => {
      try {
        setLoading(true);
        
        const [ingresosData, grossMarginData, ebitData] = await Promise.all([
          getFinancialReportsByCategory('Ingresos'),
          getFinancialReportsByCategory('Utilidad'),
          getFinancialReportsByCategory('EBIT')
        ]);

        // Obtener datos reales y objetivos
        const ingresosReales = ingresosData.find(report => report.subcategory === 'Ingresos Reales');
        const ingresosObjetivo = ingresosData.find(report => report.subcategory === 'Objetivo Ingresos');
        
        const grossMarginReal = grossMarginData.find(report => report.subcategory === 'Gross Margin Obtenido');
        const grossMarginObjetivo = grossMarginData.find(report => report.subcategory === 'Gross Margin Planeado Real');
        
        const ebitReal = ebitData.find(report => report.subcategory === 'EBIT Obtenido');
        const ebitObjetivo = ebitData.find(report => report.subcategory === 'EBIT Planeado Real');

        // Calcular valores acumulados (YTD - Year to Date)
        const ingresosRealesYTD = ingresosReales ? ingresosReales.ytd_actual || 0 : 0;
        const ingresosObjetivoAnual = ingresosObjetivo ? ingresosObjetivo.annual_target || 0 : 0;
        const ingresosObjetivoYTD = ingresosObjetivo ? ingresosObjetivo.ytd_actual || 0 : 0; // Usar valor directo del CSV
        
        const grossMarginRealYTD = grossMarginReal ? grossMarginReal.ytd_actual || 0 : 0;
        const grossMarginObjetivoAnual = grossMarginObjetivo ? grossMarginObjetivo.annual_target || 0 : 0;
        const grossMarginObjetivoYTD = grossMarginObjetivo ? grossMarginObjetivo.ytd_actual || 0 : 0; // Usar valor directo del CSV
        
        const ebitRealYTD = ebitReal ? ebitReal.ytd_actual || 0 : 0;
        const ebitObjetivoAnual = ebitObjetivo ? ebitObjetivo.annual_target || 0 : 0;
        const ebitObjetivoYTD = ebitObjetivo ? ebitObjetivo.ytd_actual || 0 : 0; // Usar valor directo del CSV

        // Calcular porcentaje de cumplimiento basado en progreso real vs objetivo
        const crecimientoPorcentaje = ingresosObjetivoAnual > 0 ? (ingresosRealesYTD / ingresosObjetivoAnual) * 100 : 0;
        const progresoEsperadoYTD = ingresosObjetivoYTD > 0 ? (ingresosObjetivoYTD / ingresosObjetivoAnual) * 100 : 0;

        const newMetrics: FinancialMetric[] = [
          {
            title: 'Ingresos Totales',
            icon: <DollarSign className="h-5 w-5" />,
            actualValue: ingresosRealesYTD,
            targetValue: ingresosObjetivoAnual,
            ytdTarget: ingresosObjetivoYTD,
            variant: 'success'
          },
          {
            title: 'Gross Margin',
            icon: <TrendingUp className="h-5 w-5" />,
            actualValue: grossMarginRealYTD,
            targetValue: grossMarginObjetivoAnual,
            ytdTarget: grossMarginObjetivoYTD,
            variant: 'info'
          },
          {
            title: 'EBIT',
            icon: <Target className="h-5 w-5" />,
            actualValue: ebitRealYTD,
            targetValue: ebitObjetivoAnual,
            ytdTarget: ebitObjetivoYTD,
            variant: 'warning'
          },
          {
            title: 'Cumplimiento Anual',
            icon: <TrendingUp className="h-5 w-5" />,
            actualValue: crecimientoPorcentaje,
            targetValue: 100, // 100% del objetivo anual
            ytdTarget: progresoEsperadoYTD, // Progreso esperado según objetivo YTD
            variant: crecimientoPorcentaje >= 20 ? 'success' : 'warning'
          }
        ];

        setMetrics(newMetrics);
      } catch (error) {
        console.error('Error loading financial metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFinancialMetrics();
  }, []);

  if (loading) {
    return (
      <HeaderContainer>
        <LoadingContainer>
          Cargando métricas financieras...
        </LoadingContainer>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      {/* Sección de perfil */}
      <ProfileSection>
        <Avatar>JP</Avatar>
        <UserInfo>
          <UserName>Juan Pérez</UserName>
          <UserEmail>juan.pérez@demo.com</UserEmail>
        </UserInfo>
      </ProfileSection>

      {/* Métricas financieras */}
      <MetricsContainer>
        {metrics.map((metric, index) => {
          // Porcentaje sobre objetivo anual
          const annualPercentage = metric.targetValue > 0 
            ? (metric.actualValue / metric.targetValue) * 100 
            : 0;
          
          // Porcentaje sobre objetivo YTD
          const ytdPercentage = metric.ytdTarget > 0 
            ? (metric.actualValue / metric.ytdTarget) * 100 
            : 0;

          const progressVariant = getProgressVariant(ytdPercentage);

          // Para cumplimiento anual, mostramos el valor directamente
          const displayValue = metric.title === 'Cumplimiento Anual' 
            ? metric.actualValue 
            : ytdPercentage;

          return (
            <MetricCard key={index} variant={metric.variant}>
              <MetricHeader>
                <MetricTitle>{metric.title}</MetricTitle>
                <MetricIcon variant={metric.variant}>
                  {metric.icon}
                </MetricIcon>
              </MetricHeader>
              
              <MetricValue>
                {metric.title === 'Cumplimiento Anual' 
                  ? `${metric.actualValue.toFixed(1)}%`
                  : formatCurrency(metric.actualValue)
                }
              </MetricValue>

              <MetricSubValue>
                {metric.title === 'Cumplimiento Anual' 
                  ? `Esperado YTD: ${metric.ytdTarget.toFixed(1)}%`
                  : `Objetivo YTD: ${formatCurrency(metric.ytdTarget)}`
                }
              </MetricSubValue>

              <MetricDetails>
                {/* Fila 1: Objetivo YTD y progreso */}
                <MetricRow>
                  <MetricTarget>
                    YTD vs Objetivo: {ytdPercentage.toFixed(1)}%
                  </MetricTarget>
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill percentage={ytdPercentage} variant={progressVariant} />
                    </ProgressBar>
                    <ProgressPercentage variant={progressVariant}>
                      {ytdPercentage.toFixed(1)}%
                      {ytdPercentage >= 100 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </ProgressPercentage>
                  </ProgressContainer>
                </MetricRow>

                {/* Fila 2: Objetivo anual y progreso */}
                <MetricRow>
                  <MetricTarget>
                    {metric.title === 'Cumplimiento Anual' 
                      ? `Meta anual: ${metric.targetValue}%`
                      : `Anual: ${formatCurrency(metric.targetValue)} (${annualPercentage.toFixed(1)}%)`
                    }
                  </MetricTarget>
                </MetricRow>
              </MetricDetails>
            </MetricCard>
          );
        })}
      </MetricsContainer>
    </HeaderContainer>
  );
};

export default FinancialHeader;
