import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartData, Transaction } from '../types';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

interface ChartProps {
  data: ChartData[];
  title: string;
  type?: 'line' | 'bar' | 'pie';
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ 
  data, 
  title, 
  type = 'line', 
  height = 400 
}) => {
  const getOption = () => {
    const baseOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (Array.isArray(params) && params.length > 0) {
            const param = params[0];
            return `${param.name}<br/>${param.seriesName}: $${param.value.toLocaleString()}`;
          }
          return '';
        }
      },
      legend: {
        top: 'bottom'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      }
    };

    if (type === 'pie') {
      return {
        ...baseOption,
        series: [{
          name: 'Amount',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: data.map(item => ({
            value: item.value,
            name: item.category || item.date
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: ${c}'
          }
        }]
      };
    }

    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: data.map(item => item.date),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [{
        name: 'Amount',
        type: type,
        data: data.map(item => item.value),
        itemStyle: {
          color: type === 'line' ? '#1890ff' : '#52c41a'
        },
        lineStyle: type === 'line' ? {
          width: 3,
          color: '#1890ff'
        } : undefined,
        areaStyle: type === 'line' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(24, 144, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(24, 144, 255, 0.05)'
            }]
          }
        } : undefined
      }]
    };
  };

  return (
    <ChartContainer>
      <ReactECharts
        option={getOption()}
        style={{ height: `${height}px`, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </ChartContainer>
  );
};

// Componente específico para gráfico de ingresos vs gastos
export const IncomeExpenseChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const processTransactionData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });
    
    return Object.keys(monthlyData).sort().map(month => ({
      month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense
    }));
  };

  const data = processTransactionData();

  const option = {
    title: {
      text: 'Ingresos vs Gastos Mensuales',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['Ingresos', 'Gastos'],
      top: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month),
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '${value}'
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        data: data.map(item => item.income),
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: 'Gastos',
        type: 'bar',
        data: data.map(item => item.expense),
        itemStyle: {
          color: '#ff4d4f'
        }
      }
    ]
  };

  return (
    <ChartContainer>
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </ChartContainer>
  );
};

// Componente para gráfico de categorías de gastos
export const ExpenseCategoryChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

  const data = Object.entries(expensesByCategory).map(([category, amount]) => ({
    date: category,
    value: amount,
    category
  }));

  return (
    <Chart
      data={data}
      title="Gastos por Categoría"
      type="pie"
      height={400}
    />
  );
};

export default Chart;