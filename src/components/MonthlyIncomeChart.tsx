import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { getMonthlyRevenueData } from '../services/financialDataService';
import { RevenueData } from '../types';

const ChartContainer = styled.div`
  width: 100%;
  height: 450px;
  margin-top: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
`;

const EnhancedCard = styled(Card)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
`;

const GradientHeader = styled(CardHeader)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
`;

const AnimatedTitle = styled(CardTitle)`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
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
  
  &:first-child {
    padding-left: 1.5rem;
  }
  
  &:last-child {
    padding-right: 1.5rem;
  }
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
    padding-left: 1.5rem;
    font-weight: 500;
  }
  
  &:last-child {
    padding-right: 1.5rem;
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

const TotalRow = styled(TableRow)`
  background: hsl(210 40% 98%);
  border-top: 2px solid hsl(214.3 31.8% 91.4%);
  font-weight: 600;
  
  &:hover {
    background: hsl(210 40% 95%);
  }
`;

const TotalCell = styled(TableCell)`
  font-weight: 700;
  color: hsl(222.2 84% 4.9%);
  border-top: 2px solid hsl(214.3 31.8% 91.4%);
`;

const PercentageCell = styled(TableCell)<{ type?: 'positive' | 'negative' }>`
  font-weight: 600;
  color: ${({ type }) => 
    type === 'positive' ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'};
`;

const MonthlyIncomeChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
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

  // Calcular totales
  const totalPlanned = revenueData.reduce((sum, data) => sum + data.planned, 0);
  const totalActual = revenueData.reduce((sum, data) => sum + data.actual, 0);
  const totalVariance = totalActual - totalPlanned;
  const totalPercentage = totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0;

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlyRevenueData();
        setRevenueData(data);
      } catch (err) {
        console.error('Error loading revenue data:', err);
        setError('Error al cargar datos de ingresos');
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || loading || error || revenueData.length === 0) {
      return;
    }

    const chart = echarts.init(chartRef.current);

    // Preparar datos para la gráfica
    const months = revenueData.map(item => item.month);
    const plannedIncome = revenueData.map(item => item.planned);
    const actualIncome = revenueData.map(item => item.actual);

    const option = {
      title: {
        text: 'Ingresos Reales vs Planificados',
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
        data: ['Ingresos Planificados', 'Ingresos Reales'],
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
          name: 'Ingresos Planificados',
          type: 'line',
          data: plannedIncome,
          lineStyle: {
            color: '#94a3b8',
            width: 2
          },
          itemStyle: {
            color: '#94a3b8'
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
                  color: 'rgba(148, 163, 184, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(148, 163, 184, 0.05)'
                }
              ]
            }
          },
          smooth: true
        },
        {
          name: 'Ingresos Reales',
          type: 'line',
          data: actualIncome,
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
  }, [revenueData, loading, error]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingContainer>
            Cargando datos de ingresos...
          </LoadingContainer>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Ingresos Mensuales</CardTitle>
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

  if (revenueData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorContainer>
            No hay datos disponibles para mostrar
          </ErrorContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfica de Ingresos Mensuales</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer ref={chartRef} />
        
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>Mes</TableHeader>
                <TableHeader>Ingresos Planificados</TableHeader>
                <TableHeader>Ingresos Reales</TableHeader>
                <TableHeader>Diferencia</TableHeader>
                <TableHeader>% Variación</TableHeader>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.month}</TableCell>
                  <ValueCell type="neutral">
                    {formatCurrency(data.planned)}
                  </ValueCell>
                  <ValueCell type={data.actual > data.planned ? 'positive' : data.actual < data.planned ? 'negative' : 'neutral'}>
                    {formatCurrency(data.actual)}
                  </ValueCell>
                  <ValueCell type={data.variance >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(Math.abs(data.variance))}
                  </ValueCell>
                  <PercentageCell type={data.percentage >= 0 ? 'positive' : 'negative'}>
                    {formatPercentage(data.percentage)}
                  </PercentageCell>
                </TableRow>
              ))}
              
              {/* Fila de totales */}
              <TotalRow>
                <TotalCell>TOTAL</TotalCell>
                <TotalCell>{formatCurrency(totalPlanned)}</TotalCell>
                <TotalCell>{formatCurrency(totalActual)}</TotalCell>
                <ValueCell type={totalVariance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(Math.abs(totalVariance))}
                </ValueCell>
                <PercentageCell type={totalPercentage >= 0 ? 'positive' : 'negative'}>
                  {formatPercentage(totalPercentage)}
                </PercentageCell>
              </TotalRow>
            </tbody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyIncomeChart;
