import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { getMonthlyRevenueData, getFinancialReportsByCategory } from '../services/financialDataService';
import { RevenueData, FinancialReport } from '../types';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div<{ color?: string }>`
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
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

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const MetricIcon = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${({ color }) => color || 'hsl(221.2 83.2% 53.3% / 0.1)'};
  color: ${({ color }) => color || 'hsl(221.2 83.2% 53.3%)'};
`;

const MetricTitle = styled.h3`
  color: hsl(215.4 16.3% 46.9%);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div`
  color: hsl(222.2 84% 4.9%);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  line-height: 1;
`;

const MetricSubtext = styled.div`
  color: hsl(215.4 16.3% 46.9%);
  font-size: 0.75rem;
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ positive }) => 
    positive ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'};
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 450px;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: hsl(215.4 16.3% 46.9%);
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: hsl(0 84.2% 60.2%);
  font-size: 1rem;
  text-align: center;
`;

interface FinancialMetrics {
  month: string;
  realIncome: number;
  grossMargin: number;
  ebit: number;
  grossMarginPercent: number;
  ebitPercent: number;
}

const FinancialKPIsDashboard: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [grossMarginData, setGrossMarginData] = useState<FinancialReport[]>([]);
  const [ebitData, setEbitData] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear porcentaje
  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  useEffect(() => {
    const loadAllFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [revenueResult, grossMarginResult, ebitResult] = await Promise.all([
          getMonthlyRevenueData(),
          getFinancialReportsByCategory('Utilidad'),
          getFinancialReportsByCategory('EBIT')
        ]);
        
        setRevenueData(revenueResult);
        setGrossMarginData(grossMarginResult);
        setEbitData(ebitResult);
      } catch (err) {
        console.error('Error loading financial data:', err);
        setError('Error al cargar datos financieros');
      } finally {
        setLoading(false);
      }
    };

    loadAllFinancialData();
  }, []);

  // Preparar datos para la tabla y métricas
  const prepareFinancialMetrics = (): FinancialMetrics[] => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    
    // Usar datos corregidos consistentes con FinancialHeader
    const grossMarginReport = grossMarginData.find(report => report.subcategory === 'Gross Margin Obtenido');
    const ebitReport = ebitData.find(report => report.subcategory === 'EBIT Obtenido');
    
    // Datos de ingresos reales inline para consistencia
    const ingresosRealesData = {
      jan: 5874642.40, 
      feb: 6353185.40, 
      mar: 5906350.80, 
      apr: 6663094.52,
      may: 0, 
      jun: 0
    };
    
    return months.map((month, index) => {
      const realIncome = (ingresosRealesData as any)[month] || 0;
      const grossMarginValue = grossMarginReport ? (grossMarginReport as any)[month] || 0 : 0;
      const ebitValue = ebitReport ? (ebitReport as any)[month] || 0 : 0;
      
      // Calcular porcentajes
      const grossMarginPercent = realIncome > 0 ? (grossMarginValue / realIncome) * 100 : 0;
      const ebitPercent = realIncome > 0 ? (ebitValue / realIncome) * 100 : 0;
      
      return {
        month: monthNames[index],
        realIncome,
        grossMargin: grossMarginValue,
        ebit: ebitValue,
        grossMarginPercent,
        ebitPercent
      };
    });
  };

  const financialMetrics = prepareFinancialMetrics();
  
  // Calcular totales y objetivos para métricas de comparación
  const totalRealIncome = financialMetrics.reduce((sum, data) => sum + data.realIncome, 0);
  const totalGrossMargin = financialMetrics.reduce((sum, data) => sum + data.grossMargin, 0);
  const totalEbit = financialMetrics.reduce((sum, data) => sum + data.ebit, 0);
  
  // Objetivos YTD (datos corregidos del CSV)
  const ingresosObjetivoYTD = 25991392.16;
  const grossMarginObjetivoYTD = 20333763.96;
  const ebitObjetivoYTD = 14878363.87;
  
  // Calcular porcentajes promedio
  const avgGrossMarginPercent = totalRealIncome > 0 ? (totalGrossMargin / totalRealIncome) * 100 : 0;
  const avgEbitPercent = totalRealIncome > 0 ? (totalEbit / totalRealIncome) * 100 : 0;
  
  // Calcular porcentajes de cumplimiento vs objetivos
  const ingresosCumplimiento = ingresosObjetivoYTD > 0 ? (totalRealIncome / ingresosObjetivoYTD) * 100 : 0;
  const grossMarginCumplimiento = grossMarginObjetivoYTD > 0 ? (totalGrossMargin / grossMarginObjetivoYTD) * 100 : 0;
  const ebitCumplimiento = ebitObjetivoYTD > 0 ? (totalEbit / ebitObjetivoYTD) * 100 : 0;

  useEffect(() => {
    if (!chartRef.current || loading || error || financialMetrics.length === 0) {
      return;
    }

    const chart = echarts.init(chartRef.current);

    // Preparar datos para la gráfica
    const months = financialMetrics.map(item => item.month);
    const realIncomeValues = financialMetrics.map(item => item.realIncome);
    const grossMarginValues = financialMetrics.map(item => item.grossMargin);
    const ebitValues = financialMetrics.map(item => item.ebit);

    const option = {
      title: {
        text: 'KPIs Financieros - Ingresos, Gross Margin y EBIT',
        left: 'center',
        textStyle: {
          color: '#222222',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params: any) {
          let tooltipText = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            const value = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(param.value);
            tooltipText += `${param.marker}${param.seriesName}: ${value}<br/>`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Ingresos Reales', 'Gross Margin', 'EBIT'],
        top: 30,
        textStyle: {
          color: '#666666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLabel: {
          color: '#666666',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666666',
          fontSize: 12,
          formatter: function(value: number) {
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: 'Ingresos Reales',
          type: 'line',
          data: realIncomeValues,
          lineStyle: {
            color: '#22c55e',
            width: 3
          },
          itemStyle: {
            color: '#22c55e',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(34, 197, 94, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(34, 197, 94, 0.05)'
                }
              ]
            }
          },
          smooth: true
        },
        {
          name: 'Gross Margin',
          type: 'line',
          data: grossMarginValues,
          lineStyle: {
            color: '#3b82f6',
            width: 3
          },
          itemStyle: {
            color: '#3b82f6',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.05)'
                }
              ]
            }
          },
          smooth: true
        },
        {
          name: 'EBIT',
          type: 'line',
          data: ebitValues,
          lineStyle: {
            color: '#f59e0b',
            width: 3
          },
          itemStyle: {
            color: '#f59e0b',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(245, 158, 11, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(245, 158, 11, 0.05)'
                }
              ]
            }
          },
          smooth: true,
          emphasis: {
            focus: 'series'
          }
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut' as const
    };

    chart.setOption(option);

    // Cleanup function
    return () => {
      chart.dispose();
    };
  }, [financialMetrics, loading, error]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPIs Financieros</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingContainer>
            Cargando datos financieros...
          </LoadingContainer>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPIs Financieros</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorContainer>
            {error}
            <br />
            <small>Asegúrate de que los datos estén disponibles en Supabase</small>
          </ErrorContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Container>
      {/* Métricas principales */}
      <MetricsGrid>
        <MetricCard color="hsl(142.1 76.2% 36.3%)">
          <MetricHeader>
            <MetricIcon color="hsl(142.1 76.2% 36.3%)">
              <DollarSign className="h-6 w-6" />
            </MetricIcon>
            <MetricChange positive={ingresosCumplimiento >= 90}>
              <TrendingUp className="h-4 w-4" />
              {formatPercentage(ingresosCumplimiento - 100)}
            </MetricChange>
          </MetricHeader>
          <MetricTitle>Ingresos Reales YTD</MetricTitle>
          <MetricValue>{formatCurrency(totalRealIncome)}</MetricValue>
          <MetricSubtext>
            Objetivo: {formatCurrency(ingresosObjetivoYTD)} 
            ({formatPercentage(ingresosCumplimiento - 100)} vs objetivo)
          </MetricSubtext>
        </MetricCard>

        <MetricCard color="hsl(221.2 83.2% 53.3%)">
          <MetricHeader>
            <MetricIcon color="hsl(221.2 83.2% 53.3%)">
              <BarChart3 className="h-6 w-6" />
            </MetricIcon>
            <MetricChange positive={grossMarginCumplimiento >= 90}>
              {formatPercentage(grossMarginCumplimiento - 100)}
            </MetricChange>
          </MetricHeader>
          <MetricTitle>Gross Margin YTD</MetricTitle>
          <MetricValue>{formatCurrency(totalGrossMargin)}</MetricValue>
          <MetricSubtext>
            Objetivo: {formatCurrency(grossMarginObjetivoYTD)}
            ({formatPercentage(grossMarginCumplimiento - 100)} vs objetivo)
          </MetricSubtext>
        </MetricCard>

        <MetricCard color="hsl(38 92% 50%)">
          <MetricHeader>
            <MetricIcon color="hsl(38 92% 50%)">
              <TrendingUp className="h-6 w-6" />
            </MetricIcon>
            <MetricChange positive={ebitCumplimiento >= 90}>
              {formatPercentage(ebitCumplimiento - 100)}
            </MetricChange>
          </MetricHeader>
          <MetricTitle>EBIT YTD</MetricTitle>
          <MetricValue>{formatCurrency(totalEbit)}</MetricValue>
          <MetricSubtext>
            Objetivo: {formatCurrency(ebitObjetivoYTD)}
            ({formatPercentage(ebitCumplimiento - 100)} vs objetivo)
          </MetricSubtext>
        </MetricCard>
      </MetricsGrid>

      {/* Gráfica principal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Mensual de KPIs Financieros</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer ref={chartRef} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default FinancialKPIsDashboard;
