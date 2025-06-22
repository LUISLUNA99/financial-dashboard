import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { financialDataService } from '../services/financialDataService';

const EnhancedCard = styled(Card)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
  
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  
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

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const StyledSelect = styled.select`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  
  option {
    background: #333;
    color: white;
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.3);
  }
`;

const StyledButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const EnhancedChartContainer = styled.div`
  width: 100%;
  height: 500px;
  margin: 1rem 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const MetricsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
`;

interface RevenueData {
  empresa: string;
  ln: string;
  cc: string;
  proyecto: string;
  monthlyData: {
    [month: string]: {
      revenue2024: number;
      revenue2025: number;
      percentage: number;
    };
  };
  total2024: number;
  total2025: number;
  annualPercentage: number;
}

const EnhancedRevenueComparison: React.FC = () => {
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await financialDataService.getFinancialData();
        setRevenueData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = selectedCompany === 'ALL' 
    ? revenueData 
    : revenueData.filter(item => item.empresa === selectedCompany);

  const companies = ['ALL', ...Array.from(new Set(revenueData.map(item => item.empresa)))];

  // Calculate metrics
  const totalRevenue2024 = filteredData.reduce((sum, item) => sum + item.total2024, 0);
  const totalRevenue2025 = filteredData.reduce((sum, item) => sum + item.total2025, 0);
  const growthRate = totalRevenue2024 > 0 ? ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024) * 100 : 0;
  const avgGrowth = filteredData.length > 0 ? 
    filteredData.reduce((sum, item) => sum + item.annualPercentage, 0) / filteredData.length : 0;

  useEffect(() => {
    if (!loading && filteredData.length > 0) {
      // Chart 1: Company comparison
      if (chartRef1.current) {
        const chart1 = echarts.init(chartRef1.current);
        
        const option1 = {
          title: {
            text: '📊 Comparación por Empresa',
            left: 'center',
            textStyle: {
              color: '#333',
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#667eea',
            borderWidth: 1,
            textStyle: { color: '#fff' },
            formatter: function(params: any) {
              let result = `<strong>${params[0].axisValue}</strong><br/>`;
              params.forEach((param: any) => {
                const value = new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                }).format(param.value);
                result += `${param.marker}${param.seriesName}: <strong>${value}</strong><br/>`;
              });
              return result;
            }
          },
          legend: {
            data: ['2024', '2025'],
            bottom: 10,
            textStyle: { color: '#666' }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: filteredData.map(item => `${item.empresa}\n${item.proyecto}`),
            axisLabel: {
              color: '#666',
              fontSize: 10,
              interval: 0,
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: '#666',
              formatter: (value: number) => {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          },
          series: [
            {
              name: '2024',
              type: chartType,
              data: filteredData.map(item => item.total2024),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#94a3b8' },
                  { offset: 1, color: '#64748b' }
                ])
              },
              animationDelay: (idx: number) => idx * 100
            },
            {
              name: '2025',
              type: chartType,
              data: filteredData.map(item => item.total2025),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#22c55e' },
                  { offset: 1, color: '#16a34a' }
                ])
              },
              animationDelay: (idx: number) => idx * 100 + 50
            }
          ],
          animation: true,
          animationDuration: 1000,
          animationEasing: 'elasticOut' as const
        };

        chart1.setOption(option1);
      }

      // Chart 2: Monthly trends
      if (chartRef2.current) {
        const chart2 = echarts.init(chartRef2.current);
        
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
        const monthlyTotals2024 = months.map(month => 
          filteredData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2024 || 0), 0)
        );
        const monthlyTotals2025 = months.map(month => 
          filteredData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2025 || 0), 0)
        );

        const option2 = {
          title: {
            text: '📈 Tendencias Mensuales',
            left: 'center',
            textStyle: {
              color: '#333',
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#667eea',
            borderWidth: 1,
            textStyle: { color: '#fff' }
          },
          legend: {
            data: ['2024', '2025'],
            bottom: 10,
            textStyle: { color: '#666' }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: months,
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: '#666',
              formatter: (value: number) => {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          },
          series: [
            {
              name: '2024',
              type: 'line',
              data: monthlyTotals2024,
              lineStyle: {
                color: '#94a3b8',
                width: 3,
                shadowBlur: 5,
                shadowColor: 'rgba(148, 163, 184, 0.3)'
              },
              itemStyle: {
                color: '#94a3b8',
                borderWidth: 2,
                borderColor: '#fff'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(148, 163, 184, 0.3)' },
                  { offset: 1, color: 'rgba(148, 163, 184, 0.05)' }
                ])
              },
              smooth: true
            },
            {
              name: '2025',
              type: 'line',
              data: monthlyTotals2025,
              lineStyle: {
                color: '#1B365C',
                width: 4,
                shadowBlur: 8,
                shadowColor: 'rgba(27, 54, 92, 0.4)'
              },
              itemStyle: {
                color: '#1B365C',
                borderWidth: 2,
                borderColor: '#fff'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
                  { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
                ])
              },
              smooth: true
            }
          ],
          animation: true,
          animationDuration: 1500,
          animationEasing: 'elasticOut' as const
        };

        chart2.setOption(option2);
      }
    }
  }, [filteredData, chartType, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <EnhancedCard>
        <GradientHeader>
          <AnimatedTitle>📊 Comparación de Ingresos Mejorada</AnimatedTitle>
        </GradientHeader>
        <CardContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: '2rem', marginBottom: '1rem' }}
            >
              ⚡
            </motion.div>
            <span>Cargando datos de comparación...</span>
          </div>
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
          <AnimatedTitle>📊 Comparación de Ingresos Mejorada 2024 vs 2025</AnimatedTitle>
          <ControlsContainer>
            <StyledSelect
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {companies.map(company => (
                <option key={company} value={company}>
                  {company === 'ALL' ? 'Todas las Empresas' : company}
                </option>
              ))}
            </StyledSelect>
            <StyledButton
              onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
            >
              {chartType === 'bar' ? '📈 Líneas' : '📊 Barras'}
            </StyledButton>
          </ControlsContainer>
        </GradientHeader>
        <CardContent>
          <MetricsContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MetricCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <MetricValue>{formatCurrency(totalRevenue2024)}</MetricValue>
              <MetricLabel>💼 Total 2024</MetricLabel>
            </MetricCard>
            <MetricCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <MetricValue>{formatCurrency(totalRevenue2025)}</MetricValue>
              <MetricLabel>🚀 Total 2025</MetricLabel>
            </MetricCard>
            <MetricCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <MetricValue style={{ color: growthRate >= 0 ? '#22c55e' : '#ef4444' }}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </MetricValue>
              <MetricLabel>📈 Crecimiento</MetricLabel>
            </MetricCard>
            <MetricCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <MetricValue>{avgGrowth.toFixed(1)}%</MetricValue>
              <MetricLabel>📊 Promedio</MetricLabel>
            </MetricCard>
          </MetricsContainer>

          <ChartsGrid>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <EnhancedChartContainer ref={chartRef1} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <EnhancedChartContainer ref={chartRef2} />
            </motion.div>
          </ChartsGrid>
        </CardContent>
      </EnhancedCard>
    </motion.div>
  );
};

export default EnhancedRevenueComparison;
