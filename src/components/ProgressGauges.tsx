import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { CSIColors } from '../styles/CSITheme';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 1rem;
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(210 40% 98%) 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, hsl(221.2 83.2% 53.3%) 0%, hsl(262.1 83.3% 57.8%) 100%);
  }
`;

const MetricTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: hsl(222.2 84% 4.9%);
  margin-bottom: 1rem;
`;

const ProgressValue = styled.div<{ color?: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || 'hsl(221.2 83.2% 53.3%)'};
  margin-bottom: 0.5rem;
`;

const ProgressSubtext = styled.div`
  font-size: 0.875rem;
  color: hsl(215.4 16.3% 46.9%);
  margin-bottom: 1rem;
`;

interface GaugeData {
  title: string;
  current: number;
  target: number;
  unit: string;
  color?: string;
  format?: 'currency' | 'percentage' | 'number';
}

interface ProgressGaugesProps {
  data: GaugeData[];
  title?: string;
}

const ProgressGauges: React.FC<ProgressGaugesProps> = ({ 
  data, 
  title = "Progreso hacia Objetivos" 
}) => {
  const formatValue = (value: number, format: string = 'number', unit: string = '') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return `${value.toLocaleString('es-MX')}${unit}`;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return CSIColors.primary.main; // CSI Primary Blue
    if (percentage >= 70) return CSIColors.accent.gold; // CSI Gold
    if (percentage >= 50) return CSIColors.secondary.light; // CSI Light Red
    return CSIColors.secondary.main; // CSI Red
  };

  const GaugeChart: React.FC<{ data: GaugeData; index: number }> = ({ data, index }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!chartRef.current) return;

      const chart = echarts.init(chartRef.current);
      const percentage = data.target > 0 ? (data.current / data.target) * 100 : 0;
      const color = getProgressColor(percentage);

      const option = {
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 5,
            itemStyle: {
              color: color,
              shadowColor: 'rgba(0,0,0,0.45)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            progress: {
              show: true,
              roundCap: true,
              width: 18
            },
            pointer: {
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.1508,735.270289 2090.53714,735.126531 C2090.53714,735.126531 2090.53714,735.126531 2090.53714,735.126531 L2090.37178,735.126531 C2086.75813,735.270289 2083.85739,732.369577 2084.00196,728.755929 L2088.46034,617.312956 C2088.51101,616.194028 2089.43112,615.30999 2090.55095,615.30999 Z',
              length: '75%',
              width: 16,
              offsetCenter: [0, '5%'],
              itemStyle: {
                color: color
              }
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 18,
                color: [
                  [percentage / 100, color],
                  [1, '#E6EBF8']
                ]
              }
            },
            axisTick: {
              distance: -45,
              splitNumber: 5,
              lineStyle: {
                width: 2,
                color: '#999'
              }
            },
            splitLine: {
              distance: -52,
              length: 14,
              lineStyle: {
                width: 3,
                color: '#999'
              }
            },
            axisLabel: {
              distance: -20,
              color: '#999',
              fontSize: 12,
              formatter: '{value}%'
            },
            anchor: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              width: '60%',
              lineHeight: 40,
              borderRadius: 8,
              offsetCenter: [0, '35%'],
              fontSize: 20,
              fontWeight: 'bolder',
              formatter: '{value}%',
              color: color
            },
            data: [
              {
                value: percentage
              }
            ]
          }
        ]
      };

      chart.setOption(option);

      // Cleanup
      return () => {
        chart.dispose();
      };
    }, [data]);

    return (
      <MetricCard>
        <MetricTitle>{data.title}</MetricTitle>
        <ChartContainer ref={chartRef} />
        <ProgressValue color={getProgressColor((data.current / data.target) * 100)}>
          {formatValue(data.current, data.format, data.unit)}
        </ProgressValue>
        <ProgressSubtext>
          Objetivo: {formatValue(data.target, data.format, data.unit)}
          <br />
          {((data.current / data.target) * 100).toFixed(1)}% completado
        </ProgressSubtext>
      </MetricCard>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MetricsContainer>
          {data.map((item, index) => (
            <GaugeChart key={index} data={item} index={index} />
          ))}
        </MetricsContainer>
      </CardContent>
    </Card>
  );
};

export default ProgressGauges;
