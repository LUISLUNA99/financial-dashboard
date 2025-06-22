import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { financialDataService } from '../services/financialDataService';
import Button from './ui/Button';

const RadarChartContainer = styled.div`
  width: 100%;
  height: 600px;
  margin: 1rem 0;
`;

const RadarCard = styled(Card)`
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

const RadarHeader = styled(CardHeader)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RadarTitle = styled(CardTitle)`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const CompanySelector = styled.select`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  
  option {
    background: #333;
    color: white;
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
  }
`;

const InfoContainer = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 0.5rem;
  margin-bottom: 1rem;
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

const RadarChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: RevenueData[] = await financialDataService.getFinancialData();
        
        const uniqueCompanies = Array.from(new Set(data.map((item: RevenueData) => item.empresa)));
        setCompanies(['ALL', ...uniqueCompanies]);
        
        // Transform data for radar chart
        const filteredData = selectedCompany === 'ALL' ? data : data.filter((item: RevenueData) => item.empresa === selectedCompany);
        
        const radarData = filteredData.map((item: RevenueData) => {
          const monthlyValues = Object.values(item.monthlyData);
          const revenue2025 = monthlyValues.reduce((sum: number, month: any) => sum + (month.revenue2025 || 0), 0);
          const revenue2024 = monthlyValues.reduce((sum: number, month: any) => sum + (month.revenue2024 || 0), 0);
          const growth = revenue2024 > 0 ? ((revenue2025 - revenue2024) / revenue2024) * 100 : 0;
          
          // Calculate performance metrics (normalized to 0-100 scale)
          const maxRevenue = Math.max(...filteredData.map((d: RevenueData) => 
            Object.values(d.monthlyData).reduce((sum: number, month: any) => sum + (month.revenue2025 || 0), 0)
          ));
          
          return {
            name: `${item.empresa} - ${item.proyecto}`,
            empresa: item.empresa,
            value: [
              Math.min(100, (revenue2025 / maxRevenue) * 100), // Ingresos 2025
              Math.min(100, Math.max(0, growth + 50)), // Crecimiento (shifted to positive scale)
              Math.min(100, (revenue2024 / maxRevenue) * 100), // Ingresos 2024
              Math.min(100, item.annualPercentage || 0), // Porcentaje anual
              Math.min(100, Math.random() * 100), // Eficiencia (simulated)
              Math.min(100, Math.random() * 100)  // Rentabilidad (simulated)
            ]
          };
        });

        setChartData(radarData);
      } catch (error) {
        console.error('Error fetching radar data:', error);
      }
    };

    fetchData();
  }, [selectedCompany]);

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params: any) {
            const indicators = ['Ingresos 2025', 'Crecimiento', 'Ingresos 2024', 'Porcentaje Anual', 'Eficiencia', 'Rentabilidad'];
            let content = `<div style="padding: 10px; background: rgba(0, 0, 0, 0.8); border-radius: 8px; color: white;">
              <strong>${params.name}</strong><br/>`;
            
            params.value.forEach((value: number, index: number) => {
              content += `${indicators[index]}: ${value.toFixed(1)}%<br/>`;
            });
            
            content += '</div>';
            return content;
          }
        },
        legend: {
          data: chartData.map(item => item.name),
          bottom: 0,
          textStyle: {
            color: '#333',
            fontSize: 12
          }
        },
        radar: {
          radius: '70%',
          center: ['50%', '45%'],
          indicator: [
            { name: 'Ingresos 2025', max: 100, color: '#ff6b6b' },
            { name: 'Crecimiento', max: 100, color: '#4ecdc4' },
            { name: 'Ingresos 2024', max: 100, color: '#45b7d1' },
            { name: 'Porcentaje Anual', max: 100, color: '#96ceb4' },
            { name: 'Eficiencia', max: 100, color: '#feca57' },
            { name: 'Rentabilidad', max: 100, color: '#ff9ff3' }
          ],
          name: {
            textStyle: {
              color: '#333',
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          splitArea: {
            areaStyle: {
              color: [
                'rgba(255, 107, 107, 0.1)',
                'rgba(78, 205, 196, 0.1)',
                'rgba(69, 183, 209, 0.1)',
                'rgba(150, 206, 180, 0.1)',
                'rgba(254, 202, 87, 0.1)'
              ]
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.2)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        series: [
          {
            name: 'Análisis Comparativo',
            type: 'radar',
            data: chartData.map((item, index) => ({
              ...item,
              areaStyle: {
                color: `rgba(${index % 2 === 0 ? '255, 107, 107' : '78, 205, 196'}, 0.2)`
              },
              lineStyle: {
                color: colors[index % colors.length],
                width: 3
              },
              itemStyle: {
                color: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                borderWidth: 2
              },
              symbol: 'circle',
              symbolSize: 8,
              emphasis: {
                areaStyle: {
                  color: `rgba(${index % 2 === 0 ? '255, 107, 107' : '78, 205, 196'}, 0.4)`
                },
                lineStyle: {
                  width: 4
                },
                itemStyle: {
                  symbolSize: 10
                }
              }
            }))
          }
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'elasticOut' as const
      };

      chartInstance.current.setOption(option);

      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [chartData]);

  return (
    <RadarCard>
      <RadarHeader>
        <RadarTitle>
          🎯 Análisis Radar de Performance Financiera
        </RadarTitle>
        <ControlsContainer>
          <CompanySelector
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            {companies.map(company => (
              <option key={company} value={company}>
                {company === 'ALL' ? 'Todas las Empresas' : company}
              </option>
            ))}
          </CompanySelector>
        </ControlsContainer>
      </RadarHeader>        <CardContent>
          <InfoContainer>
            <strong>Análisis Multidimensional:</strong> Este gráfico radar compara múltiples métricas financieras 
            de forma simultánea. Cada eje representa una dimensión diferente del performance, permitiendo 
            identificar fortalezas y áreas de mejora de manera visual e intuitiva.
          </InfoContainer>
          <RadarChartContainer ref={chartRef} />
          <div style={{
          fontSize: '0.875rem', 
          color: '#64748b', 
          marginTop: '1rem',
          lineHeight: '1.5'
        }}>
          <strong>Interpretación:</strong> Valores más cercanos al exterior indican mejor performance. 
          Las áreas sombreadas muestran el perfil general de cada empresa/proyecto.
        </div>
      </CardContent>
    </RadarCard>
  );
};

export default RadarChart;
