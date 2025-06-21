import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { TrendingUp, Calendar, Target, Zap, AlertTriangle } from 'lucide-react';

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

interface ForecastData {
  month: string;
  actual2024: number;
  actual2025: number;
  forecast2025: number;
  scenario_optimista: number;
  scenario_conservador: number;
  scenario_pesimista: number;
}

const RevenueForecast: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [forecastType, setForecastType] = useState<'linear' | 'seasonal' | 'trend'>('trend');
  const [loading, setLoading] = useState(true);

  const allMonths = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const actualMonths = allMonths.slice(0, 6); // Enero a Junio
  const forecastMonths = allMonths.slice(6); // Julio a Diciembre

  // Parse CSV data
  const parseCSVData = async () => {
    try {
      const response = await fetch('/Data/2024vs2025Ingresos.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      const parsedData: RevenueData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = line.split(',');
        if (values.length < 4) continue;
        
        const empresa = values[0]?.trim();
        const ln = values[1]?.trim();
        const cc = values[2]?.trim();
        const proyecto = values[3]?.trim();
        
        if (!empresa || !proyecto || empresa === 'Total') continue;
        
        const monthlyData: { [month: string]: { revenue2024: number; revenue2025: number; percentage: number } } = {};
        
        allMonths.forEach((month, index) => {
          const baseIndex = 4 + (index * 3);
          
          const revenue2024Str = values[baseIndex]?.trim().replace(/[",\$\s]/g, '') || '0';
          const revenue2025Str = values[baseIndex + 1]?.trim().replace(/[",\$\s]/g, '') || '0';
          const percentageStr = values[baseIndex + 2]?.trim().replace(/[%,]/g, '') || '0';
          
          const revenue2024 = parseFloat(revenue2024Str) || 0;
          const revenue2025 = parseFloat(revenue2025Str) || 0;
          const percentage = parseFloat(percentageStr) || 0;
          
          monthlyData[month] = { revenue2024, revenue2025, percentage };
        });
        
        const total2024Str = values[values.length - 3]?.trim().replace(/[",\$\s]/g, '') || '0';
        const total2025Str = values[values.length - 2]?.trim().replace(/[",\$\s]/g, '') || '0';
        const annualPercentageStr = values[values.length - 1]?.trim().replace(/[%,]/g, '') || '0';
        
        const total2024 = parseFloat(total2024Str) || 0;
        const total2025 = parseFloat(total2025Str) || 0;
        const annualPercentage = parseFloat(annualPercentageStr) || 0;
        
        parsedData.push({
          empresa,
          ln,
          cc,
          proyecto,
          monthlyData,
          total2024,
          total2025,
          annualPercentage
        });
      }
      
      setRevenueData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    parseCSVData();
  }, []);

  // Generate forecast data
  const generateForecast = (): ForecastData[] => {
    const forecastData: ForecastData[] = [];
    
    allMonths.forEach((month, index) => {
      const monthTotal2024 = revenueData.reduce((sum, item) => 
        sum + (item.monthlyData[month]?.revenue2024 || 0), 0);
      const monthTotal2025 = revenueData.reduce((sum, item) => 
        sum + (item.monthlyData[month]?.revenue2025 || 0), 0);
      
      let forecast2025 = monthTotal2025;
      
      // If this is a forecast month (no actual data), calculate forecast
      if (index >= 6 && monthTotal2025 === 0) {
        // Calculate average growth rate from actual months
        const actualGrowthRates = actualMonths.map((m, i) => {
          const actual2024 = revenueData.reduce((sum, item) => 
            sum + (item.monthlyData[m]?.revenue2024 || 0), 0);
          const actual2025 = revenueData.reduce((sum, item) => 
            sum + (item.monthlyData[m]?.revenue2025 || 0), 0);
          return actual2024 > 0 ? (actual2025 / actual2024) - 1 : 0;
        }).filter(rate => rate !== 0);
        
        const avgGrowthRate = actualGrowthRates.length > 0 
          ? actualGrowthRates.reduce((sum, rate) => sum + rate, 0) / actualGrowthRates.length 
          : 0.05; // Default 5% growth
        
        // Different forecast methods
        if (forecastType === 'linear') {
          forecast2025 = monthTotal2024 * (1 + avgGrowthRate);
        } else if (forecastType === 'seasonal') {
          // Apply seasonal factor (months like December typically higher)
          const seasonalFactor = index === 11 ? 1.2 : index >= 9 ? 1.1 : 1.0;
          forecast2025 = monthTotal2024 * (1 + avgGrowthRate) * seasonalFactor;
        } else if (forecastType === 'trend') {
          // Trend-based forecast considering momentum
          const recentTrend = actualGrowthRates.slice(-2).reduce((sum, rate) => sum + rate, 0) / 2;
          forecast2025 = monthTotal2024 * (1 + recentTrend);
        }
      }
      
      // Calculate scenarios
      const baselineForecast = forecast2025 || monthTotal2024;
      const scenario_optimista = baselineForecast * 1.25; // +25%
      const scenario_conservador = baselineForecast * 1.05; // +5%
      const scenario_pesimista = baselineForecast * 0.85; // -15%
      
      forecastData.push({
        month,
        actual2024: monthTotal2024,
        actual2025: monthTotal2025,
        forecast2025: index >= 6 ? forecast2025 : monthTotal2025,
        scenario_optimista: index >= 6 ? scenario_optimista : monthTotal2025,
        scenario_conservador: index >= 6 ? scenario_conservador : monthTotal2025,
        scenario_pesimista: index >= 6 ? scenario_pesimista : monthTotal2025
      });
    });
    
    return forecastData;
  };

  const forecastData = generateForecast();

  // Calculate annual projections
  const getAnnualProjections = () => {
    const actualYTD2025 = forecastData.slice(0, 6).reduce((sum, month) => sum + month.actual2025, 0);
    const forecastRestOfYear = forecastData.slice(6).reduce((sum, month) => sum + month.forecast2025, 0);
    const projectedTotal2025 = actualYTD2025 + forecastRestOfYear;
    
    const total2024 = forecastData.reduce((sum, month) => sum + month.actual2024, 0);
    const projectedGrowth = total2024 > 0 ? ((projectedTotal2025 - total2024) / total2024) * 100 : 0;
    
    // Scenarios
    const optimisticTotal = actualYTD2025 + forecastData.slice(6).reduce((sum, month) => sum + month.scenario_optimista, 0);
    const conservativeTotal = actualYTD2025 + forecastData.slice(6).reduce((sum, month) => sum + month.scenario_conservador, 0);
    const pessimisticTotal = actualYTD2025 + forecastData.slice(6).reduce((sum, month) => sum + month.scenario_pesimista, 0);
    
    return {
      actualYTD2025,
      forecastRestOfYear,
      projectedTotal2025,
      projectedGrowth,
      total2024,
      scenarios: {
        optimistic: optimisticTotal,
        conservative: conservativeTotal,
        pessimistic: pessimisticTotal
      }
    };
  };

  const annualProjections = getAnnualProjections();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Generando proyecciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant={forecastType === 'trend' ? 'default' : 'outline'}
          onClick={() => setForecastType('trend')}
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Tendencia
        </Button>
        <Button
          variant={forecastType === 'linear' ? 'default' : 'outline'}
          onClick={() => setForecastType('linear')}
          size="sm"
        >
          <Target className="h-4 w-4 mr-2" />
          Lineal
        </Button>
        <Button
          variant={forecastType === 'seasonal' ? 'default' : 'outline'}
          onClick={() => setForecastType('seasonal')}
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Estacional
        </Button>
      </div>

      {/* Annual Projections Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Real YTD 2025</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(annualProjections.actualYTD2025)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Proyección Restante</div>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(annualProjections.forecastRestOfYear)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Proyectado 2025</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(annualProjections.projectedTotal2025)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Crecimiento vs 2024</div>
            <div className={`text-2xl font-bold ${annualProjections.projectedGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(annualProjections.projectedGrowth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Proyección Anual 2025 - Método: {forecastType === 'trend' ? 'Tendencia' : forecastType === 'linear' ? 'Lineal' : 'Estacional'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px' }}>
            <Line 
              data={{
                labels: allMonths,
                datasets: [
                  {
                    label: '2024 (Real)',
                    data: forecastData.map(d => d.actual2024),
                    borderColor: 'rgb(156, 163, 175)',
                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                    borderDash: [5, 5]
                  },
                  {
                    label: '2025 (Real)',
                    data: forecastData.map(d => d.actual2025),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false
                  },
                  {
                    label: '2025 (Proyección)',
                    data: forecastData.map(d => d.forecast2025),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: true,
                    tension: 0.4
                  },
                  {
                    label: 'Escenario Optimista',
                    data: forecastData.map((d, index) => index >= 6 ? d.scenario_optimista : null),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderDash: [3, 3],
                    fill: false
                  },
                  {
                    label: 'Escenario Pesimista',
                    data: forecastData.map((d, index) => index >= 6 ? d.scenario_pesimista : null),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderDash: [3, 3],
                    fill: false
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: function(context: any) {
                        return context.index === 5 ? 'rgb(239, 68, 68)' : 'rgba(0, 0, 0, 0.1)';
                      },
                      lineWidth: function(context: any) {
                        return context.index === 5 ? 2 : 1;
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  },
                  legend: {
                    position: 'top' as const,
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Escenarios 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Escenario Optimista</span>
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatCurrency(annualProjections.scenarios.optimistic)}
              </div>
              <div className="text-sm text-green-600">
                +25% sobre proyección base
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Escenario Conservador</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {formatCurrency(annualProjections.scenarios.conservative)}
              </div>
              <div className="text-sm text-blue-600">
                +5% sobre proyección base
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Escenario Pesimista</span>
              </div>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {formatCurrency(annualProjections.scenarios.pessimistic)}
              </div>
              <div className="text-sm text-red-600">
                -15% sobre proyección base
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose Mensual de Proyecciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mes</th>
                  <th className="text-right p-2">2024 Real</th>
                  <th className="text-right p-2">2025 Real</th>
                  <th className="text-right p-2">2025 Proyección</th>
                  <th className="text-right p-2">Diferencia vs 2024</th>
                  <th className="text-right p-2">% Crecimiento</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((data, index) => {
                  const isProjected = index >= 6;
                  const growth = data.actual2024 > 0 ? ((data.forecast2025 - data.actual2024) / data.actual2024) * 100 : 0;
                  
                  return (
                    <tr key={index} className={`border-b ${isProjected ? 'bg-amber-50' : ''}`}>
                      <td className="p-2 font-medium">
                        {data.month}
                        {isProjected && <span className="ml-2 text-xs text-amber-600">(Proyectado)</span>}
                      </td>
                      <td className="text-right p-2">{formatCurrency(data.actual2024)}</td>
                      <td className="text-right p-2">
                        {data.actual2025 > 0 ? formatCurrency(data.actual2025) : '-'}
                      </td>
                      <td className="text-right p-2 font-medium">
                        {formatCurrency(data.forecast2025)}
                      </td>
                      <td className={`text-right p-2 ${(data.forecast2025 - data.actual2024) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(data.forecast2025 - data.actual2024)}
                      </td>
                      <td className={`text-right p-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(growth)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueForecast;
