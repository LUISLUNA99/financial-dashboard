import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { getMonthlyRevenueData } from '../services/financialDataService';
import { RevenueData } from '../types';
import { CSIColors } from '../styles/CSITheme';

const MainChartContainer = styled.div`
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
  background: linear-gradient(135deg, ${CSIColors.primary.main} 0%, ${CSIColors.secondary.main} 100%);
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

const EnhancedTableContainer = styled(motion.div)`
  margin-top: 2rem;
  overflow-x: auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9));
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const EnhancedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 1rem;
  overflow: hidden;
`;

const TableHeader = styled.th`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  &:first-child {
    padding-left: 1.5rem;
  }
  
  &:last-child {
    padding-right: 1.5rem;
  }
`;

const AnimatedTableRow = styled(motion.tr)`
  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    transform: scale(1.01);
    transition: all 0.2s ease;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(214, 219, 220, 0.3);
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

const TotalRow = styled(AnimatedTableRow)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  border-top: 2px solid hsl(214.3 31.8% 91.4%);
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
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

const EnhancedMonthlyIncomeChart: React.FC = () => {
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
        text: '💰 Ingresos Reales vs Planificados',
        left: 'center',
        textStyle: {
          color: '#222222',
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#667eea'
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
          color: '#fff'
        },
        formatter: function(params: any) {
          let tooltipText = `<div style="padding: 10px;"><strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            const value = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(param.value);
            tooltipText += `${param.marker}${param.seriesName}: <strong>${value}</strong><br/>`;
          });
          tooltipText += '</div>';
          return tooltipText;
        }
      },
      legend: {
        data: ['Ingresos Planificados', 'Ingresos Reales'],
        top: 40,
        textStyle: {
          color: '#666666',
          fontSize: 14
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLabel: {
          color: '#666666',
          fontSize: 12,
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
            width: 2
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666666',
          fontSize: 12,
          fontWeight: 'bold',
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
            color: '#e0e0e0',
            width: 2
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Ingresos Planificados',
          type: 'line',
          data: plannedIncome,
          lineStyle: {
            color: '#C8102E',
            width: 3,
            shadowBlur: 5,
            shadowColor: 'rgba(200, 16, 46, 0.3)'
          },
          itemStyle: {
            color: '#C8102E',
            borderWidth: 3,
            borderColor: '#ffffff',
            shadowBlur: 5,
            shadowColor: 'rgba(200, 16, 46, 0.5)'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(200, 16, 46, 0.4)' },
                { offset: 1, color: 'rgba(200, 16, 46, 0.05)' }
              ]
            }
          },
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            scale: true,
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 10
            }
          }
        },
        {
          name: 'Ingresos Reales',
          type: 'line',
          data: actualIncome,
          lineStyle: {
            color: '#1B365C',
            width: 4,
            shadowBlur: 8,
            shadowColor: 'rgba(27, 54, 92, 0.4)'
          },
          itemStyle: {
            color: '#1B365C',
            borderWidth: 3,
            borderColor: '#ffffff',
            shadowBlur: 8,
            shadowColor: 'rgba(27, 54, 92, 0.6)'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(27, 54, 92, 0.4)' },
                { offset: 1, color: 'rgba(27, 54, 92, 0.05)' }
              ]
            }
          },
          smooth: true,
          symbol: 'diamond',
          symbolSize: 10,
          emphasis: {
            focus: 'series',
            scale: true,
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 15
            }
          }
        }
      ],
      animation: true,
      animationDuration: 1500,
      animationEasing: 'elasticOut' as const
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [revenueData, loading, error]);

  if (loading) {
    return (
      <EnhancedCard>
        <GradientHeader>
          <AnimatedTitle>💰 Gráfica de Ingresos Mensuales Mejorada</AnimatedTitle>
        </GradientHeader>
        <CardContent>
          <LoadingContainer>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⚡
            </motion.div>
            <span style={{ marginLeft: '10px' }}>Cargando datos de ingresos...</span>
          </LoadingContainer>
        </CardContent>
      </EnhancedCard>
    );
  }

  if (error) {
    return (
      <EnhancedCard>
        <GradientHeader>
          <AnimatedTitle>💰 Gráfica de Ingresos Mensuales Mejorada</AnimatedTitle>
        </GradientHeader>
        <CardContent>
          <ErrorContainer>
            🚨 {error}
            <br />
            <small>Asegúrate de que los datos estén disponibles en Supabase</small>
          </ErrorContainer>
        </CardContent>
      </EnhancedCard>
    );
  }

  if (revenueData.length === 0) {
    return (
      <EnhancedCard>
        <GradientHeader>
          <AnimatedTitle>💰 Gráfica de Ingresos Mensuales Mejorada</AnimatedTitle>
        </GradientHeader>
        <CardContent>
          <ErrorContainer>
            📊 No hay datos disponibles para mostrar
          </ErrorContainer>
        </CardContent>
      </EnhancedCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EnhancedCard>
        <GradientHeader>
          <AnimatedTitle>💰 Gráfica de Ingresos Mensuales Mejorada</AnimatedTitle>
        </GradientHeader>
        <CardContent>
          <MainChartContainer ref={chartRef} />
          
          <EnhancedTableContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnhancedTable>
              <thead>
                <tr>
                  <TableHeader>🗓️ Mes</TableHeader>
                  <TableHeader>📊 Planificados</TableHeader>
                  <TableHeader>💰 Reales</TableHeader>
                  <TableHeader>📈 Diferencia</TableHeader>
                  <TableHeader>📊 % Variación</TableHeader>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((data, index) => (
                  <AnimatedTableRow 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
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
                  </AnimatedTableRow>
                ))}
                
                <TotalRow
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: revenueData.length * 0.1 }}
                >
                  <TotalCell><strong>🎯 TOTAL</strong></TotalCell>
                  <TotalCell><strong>{formatCurrency(totalPlanned)}</strong></TotalCell>
                  <TotalCell><strong>{formatCurrency(totalActual)}</strong></TotalCell>
                  <ValueCell type={totalVariance >= 0 ? 'positive' : 'negative'}>
                    <strong>{formatCurrency(Math.abs(totalVariance))}</strong>
                  </ValueCell>
                  <PercentageCell type={totalPercentage >= 0 ? 'positive' : 'negative'}>
                    <strong>{formatPercentage(totalPercentage)}</strong>
                  </PercentageCell>
                </TotalRow>
              </tbody>
            </EnhancedTable>
          </EnhancedTableContainer>
        </CardContent>
      </EnhancedCard>
    </motion.div>
  );
};

export default EnhancedMonthlyIncomeChart;
