import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { getFinancialReportsByCategory, getMonthlyRevenueData } from '../services/financialDataService';
import { FinancialReport, RevenueData } from '../types';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
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

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
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
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const MetricSubtext = styled.div`
  color: hsl(215.4 16.3% 46.9%);
  font-size: 0.75rem;
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: hsl(0 0% 100%);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

const TableHeader = styled.th`
  background: hsl(210 40% 98%);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: hsl(222.2 84% 4.9%);
  border-bottom: 1px solid hsl(214.3 31.8% 91.4%);
  font-size: 0.875rem;
`;

const TableRow = styled.tr`
  &:hover {
    background: hsl(210 40% 98%);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid hsl(214.3 31.8% 91.4%);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: hsl(222.2 84% 4.9%);
  font-size: 0.875rem;
  
  &:first-child {
    font-weight: 500;
  }
`;

const ValueCell = styled(TableCell)<{ type?: 'positive' | 'negative' | 'neutral' }>`
  font-weight: 600;
  color: ${({ type }) => {
    switch (type) {
      case 'positive': return 'hsl(142.1 76.2% 36.3%)';
      case 'negative': return 'hsl(0 84.2% 60.2%)';
      default: return 'hsl(222.2 84% 4.9%)';
    }
  }};
`;

interface ProfitabilityData {
  month: string;
  realIncome: number;
  plannedIncome: number;
  grossMargin: number;
  grossMarginPlanned: number;
  ebit: number;
  ebitPlanned: number;
  grossMarginPercent: number;
  grossMarginPlannedPercent: number;
  ebitPercent: number;
  ebitPlannedPercent: number;
}

const GrossMarginEbitChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [grossMarginData, setGrossMarginData] = useState<FinancialReport[]>([]);
  const [grossMarginPlannedData, setGrossMarginPlannedData] = useState<FinancialReport[]>([]);
  const [ebitData, setEbitData] = useState<FinancialReport[]>([]);
  const [ebitPlannedData, setEbitPlannedData] = useState<FinancialReport[]>([]);
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
    return `${percentage.toFixed(1)}%`;
  };

  useEffect(() => {
    const loadProfitabilityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [revenueResult, grossMarginResult, ebitResult] = await Promise.all([
          getMonthlyRevenueData(),
          getFinancialReportsByCategory('Utilidad'),
          getFinancialReportsByCategory('EBIT')
        ]);
        
        setRevenueData(revenueResult);
        
        // Separar datos obtenidos vs planeados
        const grossMarginActual = grossMarginResult.filter(report => report.subcategory === 'Gross Margin Obtenido');
        const grossMarginPlanned = grossMarginResult.filter(report => report.subcategory === 'Gross Margin Planeado');
        const ebitActual = ebitResult.filter(report => report.subcategory === 'EBIT Obtenido');
        const ebitPlanned = ebitResult.filter(report => report.subcategory === 'EBIT Planeado');
        
        setGrossMarginData(grossMarginActual);
        setGrossMarginPlannedData(grossMarginPlanned);
        setEbitData(ebitActual);
        setEbitPlannedData(ebitPlanned);
      } catch (err) {
        console.error('Error loading profitability data:', err);
        setError('Error al cargar datos de rentabilidad');
      } finally {
        setLoading(false);
      }
    };

    loadProfitabilityData();
  }, []);

  // Preparar datos para la tabla
  const prepareTableData = (): ProfitabilityData[] => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    
    const grossMarginReport = grossMarginData.find(report => report.subcategory === 'Gross Margin Obtenido');
    const grossMarginPlannedReport = grossMarginPlannedData.find(report => report.subcategory === 'Gross Margin Planeado');
    const ebitReport = ebitData.find(report => report.subcategory === 'EBIT Obtenido');
    const ebitPlannedReport = ebitPlannedData.find(report => report.subcategory === 'EBIT Planeado');
    
    return months.map((month, index) => {
      const revenueItem = revenueData[index];
      const realIncome = revenueItem ? revenueItem.actual : 0;
      const plannedIncome = revenueItem ? revenueItem.planned : 0;
      const grossMarginValue = grossMarginReport ? (grossMarginReport as any)[month] || 0 : 0;
      const grossMarginPlannedValue = grossMarginPlannedReport ? (grossMarginPlannedReport as any)[month] || 0 : 0;
      const ebitValue = ebitReport ? (ebitReport as any)[month] || 0 : 0;
      const ebitPlannedValue = ebitPlannedReport ? (ebitPlannedReport as any)[month] || 0 : 0;
      
      // Calcular porcentajes basados en ingresos reales y planeados
      const grossMarginPercent = realIncome > 0 ? (grossMarginValue / realIncome) * 100 : 0;
      const grossMarginPlannedPercent = plannedIncome > 0 ? (grossMarginPlannedValue / plannedIncome) * 100 : 0;
      const ebitPercent = realIncome > 0 ? (ebitValue / realIncome) * 100 : 0;
      const ebitPlannedPercent = plannedIncome > 0 ? (ebitPlannedValue / plannedIncome) * 100 : 0;
      
      return {
        month: monthNames[index],
        realIncome,
        plannedIncome,
        grossMargin: grossMarginValue,
        grossMarginPlanned: grossMarginPlannedValue,
        ebit: ebitValue,
        ebitPlanned: ebitPlannedValue,
        grossMarginPercent,
        grossMarginPlannedPercent,
        ebitPercent,
        ebitPlannedPercent
      };
    });
  };

  const tableData = prepareTableData();
  const totalRealIncome = tableData.reduce((sum, data) => sum + data.realIncome, 0);
  const totalPlannedIncome = tableData.reduce((sum, data) => sum + data.plannedIncome, 0);
  const totalGrossMargin = tableData.reduce((sum, data) => sum + data.grossMargin, 0);
  const totalGrossMarginPlanned = tableData.reduce((sum, data) => sum + data.grossMarginPlanned, 0);
  const totalEbit = tableData.reduce((sum, data) => sum + data.ebit, 0);
  const totalEbitPlanned = tableData.reduce((sum, data) => sum + data.ebitPlanned, 0);

  useEffect(() => {
    if (!chartRef.current || loading || error || grossMarginData.length === 0 || ebitData.length === 0) {
      return;
    }

    const chart = echarts.init(chartRef.current);

    // Preparar datos para la gráfica
    const months = tableData.map(item => item.month);
    const realIncomeValues = tableData.map(item => item.realIncome);
    const plannedIncomeValues = tableData.map(item => item.plannedIncome);
    const grossMarginValues = tableData.map(item => item.grossMargin);
    const grossMarginPlannedValues = tableData.map(item => item.grossMarginPlanned);
    const ebitValues = tableData.map(item => item.ebit);
    const ebitPlannedValues = tableData.map(item => item.ebitPlanned);

    const option = {
      title: {
        text: 'KPIs Financieros - Actual vs Objetivo',
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
        data: [
          'Ingresos Reales', 'Ingresos Objetivo',
          'Gross Margin Real', 'Gross Margin Objetivo', 
          'EBIT Real', 'EBIT Objetivo'
        ],
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
          smooth: true
        },
        {
          name: 'Ingresos Objetivo',
          type: 'line',
          data: plannedIncomeValues,
          lineStyle: {
            color: '#22c55e',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#22c55e',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          smooth: true
        },
        {
          name: 'Gross Margin Real',
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
          smooth: true
        },
        {
          name: 'Gross Margin Objetivo',
          type: 'line',
          data: grossMarginPlannedValues,
          lineStyle: {
            color: '#3b82f6',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#3b82f6',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          smooth: true
        },
        {
          name: 'EBIT Real',
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
          smooth: true
        },
        {
          name: 'EBIT Objetivo',
          type: 'line',
          data: ebitPlannedValues,
          lineStyle: {
            color: '#f59e0b',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#f59e0b',
            borderWidth: 2,
            borderColor: '#ffffff'
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
  }, [grossMarginData, ebitData, loading, error, tableData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gross Margin y EBIT</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingContainer>
            Cargando datos de rentabilidad...
          </LoadingContainer>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gross Margin y EBIT</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>KPIs Financieros - Ingresos, Gross Margin y EBIT</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Métricas resumen */}
        <MetricsContainer>
          <MetricCard>
            <MetricTitle>Ingresos Reales vs Objetivo</MetricTitle>
            <MetricValue>{formatCurrency(totalRealIncome)}</MetricValue>
            <MetricSubtext>
              Objetivo: {formatCurrency(totalPlannedIncome)} | 
              Variación: {formatPercentage(((totalRealIncome - totalPlannedIncome) / totalPlannedIncome) * 100)}
            </MetricSubtext>
          </MetricCard>
          <MetricCard>
            <MetricTitle>Gross Margin Real vs Objetivo</MetricTitle>
            <MetricValue>{formatCurrency(totalGrossMargin)}</MetricValue>
            <MetricSubtext>
              Objetivo: {formatCurrency(totalGrossMarginPlanned)} | 
              Variación: {formatPercentage(((totalGrossMargin - totalGrossMarginPlanned) / totalGrossMarginPlanned) * 100)}
            </MetricSubtext>
          </MetricCard>
          <MetricCard>
            <MetricTitle>EBIT Real vs Objetivo</MetricTitle>
            <MetricValue>{formatCurrency(totalEbit)}</MetricValue>
            <MetricSubtext>
              Objetivo: {formatCurrency(totalEbitPlanned)} | 
              Variación: {formatPercentage(((totalEbit - totalEbitPlanned) / totalEbitPlanned) * 100)}
            </MetricSubtext>
          </MetricCard>
        </MetricsContainer>

        {/* Gráfica */}
        <ChartContainer ref={chartRef} />
        
        {/* Tabla de datos */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>Mes</TableHeader>
                <TableHeader>Ingresos Real</TableHeader>
                <TableHeader>Ingresos Objetivo</TableHeader>
                <TableHeader>Gross Margin Real</TableHeader>
                <TableHeader>Gross Margin Objetivo</TableHeader>
                <TableHeader>EBIT Real</TableHeader>
                <TableHeader>EBIT Objetivo</TableHeader>
                <TableHeader>Eficiencia</TableHeader>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => {
                const efficiency = data.grossMargin > 0 ? (data.ebit / data.grossMargin) * 100 : 0;
                const incomeVariance = data.plannedIncome > 0 ? ((data.realIncome - data.plannedIncome) / data.plannedIncome) * 100 : 0;
                const grossMarginVariance = data.grossMarginPlanned > 0 ? ((data.grossMargin - data.grossMarginPlanned) / data.grossMarginPlanned) * 100 : 0;
                const ebitVariance = data.ebitPlanned > 0 ? ((data.ebit - data.ebitPlanned) / data.ebitPlanned) * 100 : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{data.month}</TableCell>
                    <ValueCell type={incomeVariance >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(data.realIncome)}
                    </ValueCell>
                    <ValueCell type="neutral">
                      {formatCurrency(data.plannedIncome)}
                    </ValueCell>
                    <ValueCell type={grossMarginVariance >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(data.grossMargin)}
                    </ValueCell>
                    <ValueCell type="neutral">
                      {formatCurrency(data.grossMarginPlanned)}
                    </ValueCell>
                    <ValueCell type={ebitVariance >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(data.ebit)}
                    </ValueCell>
                    <ValueCell type="neutral">
                      {formatCurrency(data.ebitPlanned)}
                    </ValueCell>
                    <ValueCell type={efficiency >= 70 ? 'positive' : efficiency >= 50 ? 'neutral' : 'negative'}>
                      {formatPercentage(efficiency)}
                    </ValueCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default GrossMarginEbitChart;
