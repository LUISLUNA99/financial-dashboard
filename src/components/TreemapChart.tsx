import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { financialDataService } from '../services/financialDataService';

const TreemapChartContainer = styled.div`
  width: 100%;
  height: 500px;
  margin: 1rem 0;
`;

const TreemapCard = styled(Card)`
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

const TreemapHeader = styled(CardHeader)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
`;

const TreemapTitle = styled(CardTitle)`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

const TreemapChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: RevenueData[] = await financialDataService.getFinancialData();
        
        // Transform data for treemap
        const treemapData = data.map((item: RevenueData, index: number) => {
          const total = Object.values(item.monthlyData).reduce((sum: number, month: any) => 
            sum + (month.revenue2025 || 0), 0
          );
          
          return {
            name: `${item.empresa}\n${item.proyecto}`,
            value: total,
            itemStyle: {
              color: index % 2 === 0 ? 
                `rgba(102, 126, 234, ${0.6 + (index * 0.1)})` : 
                `rgba(118, 75, 162, ${0.6 + (index * 0.1)})`
            },
            children: Object.entries(item.monthlyData).map(([month, data]: [string, any]) => ({
              name: month,
              value: data.revenue2025 || 0,
              itemStyle: {
                color: `rgba(${index % 2 === 0 ? '102, 126, 234' : '118, 75, 162'}, ${0.4 + (Math.random() * 0.3)})`
              }
            }))
          };
        });

        setChartData(treemapData);
      } catch (error) {
        console.error('Error fetching treemap data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      // Dispose of previous chart instance
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // Initialize new chart
      chartInstance.current = echarts.init(chartRef.current);

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params: any) {
            return `
              <div style="padding: 10px; background: rgba(0, 0, 0, 0.8); border-radius: 8px; color: white;">
                <strong>${params.name}</strong><br/>
                Ingresos: $${params.value?.toLocaleString() || 0}<br/>
                Porcentaje: ${params.percent}%
              </div>
            `;
          }
        },
        series: [
          {
            name: 'Distribución de Ingresos',
            type: 'treemap',
            roam: false,
            nodeClick: 'zoomToNode',
            breadcrumb: {
              show: true,
              height: 40,
              itemStyle: {
                color: '#667eea',
                borderColor: '#764ba2',
                borderWidth: 1,
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                textStyle: {
                  color: 'white'
                }
              }
            },
            label: {
              show: true,
              formatter: function(params: any) {
                return params.name + '\n$' + (params.value?.toLocaleString() || 0);
              },
              fontSize: 12,
              fontWeight: 'bold',
              color: 'white',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffsetX: 1,
              textShadowOffsetY: 1
            },
            upperLabel: {
              show: true,
              height: 30,
              fontSize: 14,
              fontWeight: 'bold',
              color: 'white'
            },
            itemStyle: {
              borderColor: 'white',
              borderWidth: 2,
              borderRadius: 8,
              shadowBlur: 5,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            levels: [
              {
                itemStyle: {
                  borderWidth: 3,
                  borderColor: 'white',
                  gapWidth: 2
                }
              },
              {
                itemStyle: {
                  borderWidth: 1,
                  gapWidth: 1
                }
              }
            ],
            data: chartData
          }
        ]
      };

      chartInstance.current.setOption(option);

      // Handle resize
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
    <TreemapCard>
      <TreemapHeader>
        <TreemapTitle>
          📊 Mapa de Distribución de Ingresos 2025
        </TreemapTitle>
      </TreemapHeader>        <CardContent>
          <TreemapChartContainer ref={chartRef} />
          <div style={{
          fontSize: '0.875rem', 
          color: '#64748b', 
          marginTop: '1rem',
          lineHeight: '1.5'
        }}>
          <strong>Visualización Jerárquica:</strong> Cada rectángulo representa la proporción de ingresos 
          por empresa y proyecto. El tamaño indica el volumen relativo de ingresos. 
          Haz clic para navegar por niveles de detalle.
        </div>
      </CardContent>
    </TreemapCard>
  );
};

export default TreemapChart;
