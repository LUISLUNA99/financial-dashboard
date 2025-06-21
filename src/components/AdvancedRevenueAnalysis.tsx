import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Award, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface TrendAnalysis {
  month: string;
  revenue2024: number;
  revenue2025: number;
  growthRate: number;
  forecast2025: number;
}

interface SegmentAnalysis {
  segment: string;
  total2024: number;
  total2025: number;
  projects: number;
  avgGrowth: number;
  contribution: number;
}

const AdvancedRevenueAnalysis: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [activeView, setActiveView] = useState<'trends' | 'segments' | 'alerts' | 'ranking'>('trends');
  const [loading, setLoading] = useState(true);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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
        
        months.forEach((month, index) => {
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

  // 1. ANÁLISIS DE TENDENCIAS MENSUALES
  const getTrendAnalysis = (): TrendAnalysis[] => {
    return months.slice(0, 6).map((month, index) => {
      const monthTotal2024 = revenueData.reduce((sum, item) => 
        sum + (item.monthlyData[month]?.revenue2024 || 0), 0);
      const monthTotal2025 = revenueData.reduce((sum, item) => 
        sum + (item.monthlyData[month]?.revenue2025 || 0), 0);
      
      const growthRate = monthTotal2024 > 0 ? ((monthTotal2025 - monthTotal2024) / monthTotal2024) * 100 : 0;
      
      // Simple forecast based on trend
      const forecast2025 = monthTotal2024 > 0 ? monthTotal2024 * 1.15 : 0; // Assuming 15% growth target
      
      return {
        month,
        revenue2024: monthTotal2024,
        revenue2025: monthTotal2025,
        growthRate,
        forecast2025
      };
    });
  };

  // 2. ANÁLISIS POR SEGMENTOS
  const getSegmentAnalysis = (): SegmentAnalysis[] => {
    const segments = new Map<string, SegmentAnalysis>();
    
    revenueData.forEach(item => {
      const segment = item.ln || 'Otros';
      
      if (!segments.has(segment)) {
        segments.set(segment, {
          segment,
          total2024: 0,
          total2025: 0,
          projects: 0,
          avgGrowth: 0,
          contribution: 0
        });
      }
      
      const segmentData = segments.get(segment)!;
      segmentData.total2024 += item.total2024;
      segmentData.total2025 += item.total2025;
      segmentData.projects += 1;
    });
    
    const totalRevenue2025 = Array.from(segments.values()).reduce((sum, s) => sum + s.total2025, 0);
    
    return Array.from(segments.values()).map(segment => ({
      ...segment,
      avgGrowth: segment.total2024 > 0 ? ((segment.total2025 - segment.total2024) / segment.total2024) * 100 : 0,
      contribution: totalRevenue2025 > 0 ? (segment.total2025 / totalRevenue2025) * 100 : 0
    })).sort((a, b) => b.total2025 - a.total2025);
  };

  // 3. ANÁLISIS DE ALERTAS Y RIESGOS
  const getAlertsAnalysis = () => {
    const highRisk = revenueData.filter(item => item.annualPercentage < -50 && item.total2024 > 0);
    const highGrowth = revenueData.filter(item => item.annualPercentage > 100);
    const stagnant = revenueData.filter(item => Math.abs(item.annualPercentage) < 5 && item.total2024 > 0);
    
    return { highRisk, highGrowth, stagnant };
  };

  // 4. RANKING DE PERFORMANCE
  const getRankingAnalysis = () => {
    const validProjects = revenueData.filter(item => item.total2024 > 0 || item.total2025 > 0);
    
    const topGainers = validProjects
      .filter(item => item.annualPercentage > 0)
      .sort((a, b) => b.annualPercentage - a.annualPercentage)
      .slice(0, 5);
    
    const topLosers = validProjects
      .filter(item => item.annualPercentage < 0)
      .sort((a, b) => a.annualPercentage - b.annualPercentage)
      .slice(0, 5);
    
    const topByVolume = validProjects
      .sort((a, b) => (b.total2024 + b.total2025) - (a.total2024 + a.total2025))
      .slice(0, 5);
    
    return { topGainers, topLosers, topByVolume };
  };

  // CHART CONFIGURATIONS
  const trendAnalysis = getTrendAnalysis();
  const segmentAnalysis = getSegmentAnalysis();
  const alertsAnalysis = getAlertsAnalysis();
  const rankingAnalysis = getRankingAnalysis();

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
        <div className="text-lg">Cargando análisis avanzado...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeView === 'trends' ? 'default' : 'outline'}
          onClick={() => setActiveView('trends')}
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Tendencias
        </Button>
        <Button
          variant={activeView === 'segments' ? 'default' : 'outline'}
          onClick={() => setActiveView('segments')}
          size="sm"
        >
          <Target className="h-4 w-4 mr-2" />
          Segmentos
        </Button>
        <Button
          variant={activeView === 'alerts' ? 'default' : 'outline'}
          onClick={() => setActiveView('alerts')}
          size="sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Alertas
        </Button>
        <Button
          variant={activeView === 'ranking' ? 'default' : 'outline'}
          onClick={() => setActiveView('ranking')}
          size="sm"
        >
          <Award className="h-4 w-4 mr-2" />
          Rankings
        </Button>
      </div>

      {/* VISTA 1: TENDENCIAS MENSUALES */}
      {activeView === 'trends' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual y Proyecciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <Line 
                  data={{
                    labels: trendAnalysis.map(t => t.month),
                    datasets: [
                      {
                        label: '2024 (Real)',
                        data: trendAnalysis.map(t => t.revenue2024),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: '2025 (Real)',
                        data: trendAnalysis.map(t => t.revenue2025),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: '2025 (Objetivo)',
                        data: trendAnalysis.map(t => t.forecast2025),
                        borderColor: 'rgb(251, 191, 36)',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderDash: [5, 5],
                        fill: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return formatCurrency(value);
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
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Métricas de tendencia */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trendAnalysis.map((trend, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">{trend.month}</div>
                  <div className="text-lg font-bold mb-2">{formatCurrency(trend.revenue2025)}</div>
                  <div className={`text-sm flex items-center ${trend.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.growthRate >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {formatPercentage(trend.growthRate)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: ANÁLISIS POR SEGMENTOS */}
      {activeView === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contribución por segmento */}
            <Card>
              <CardHeader>
                <CardTitle>Contribución por Línea de Negocio</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <Doughnut 
                    data={{
                      labels: segmentAnalysis.map(s => s.segment),
                      datasets: [{
                        data: segmentAnalysis.map(s => s.contribution),
                        backgroundColor: [
                          'rgb(59, 130, 246)',
                          'rgb(34, 197, 94)',
                          'rgb(251, 191, 36)',
                          'rgb(239, 68, 68)',
                          'rgb(168, 85, 247)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              return `${context.label}: ${context.parsed.toFixed(1)}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Crecimiento por segmento */}
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <Bar 
                    data={{
                      labels: segmentAnalysis.map(s => s.segment),
                      datasets: [{
                        label: 'Crecimiento %',
                        data: segmentAnalysis.map(s => s.avgGrowth),
                        backgroundColor: segmentAnalysis.map(s => 
                          s.avgGrowth >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                        )
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              return `Crecimiento: ${formatPercentage(context.parsed.y)}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de segmentos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle por Línea de Negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Segmento</th>
                      <th className="text-right p-2">2024</th>
                      <th className="text-right p-2">2025</th>
                      <th className="text-right p-2">Proyectos</th>
                      <th className="text-right p-2">Crecimiento</th>
                      <th className="text-right p-2">Contribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentAnalysis.map((segment, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{segment.segment}</td>
                        <td className="text-right p-2">{formatCurrency(segment.total2024)}</td>
                        <td className="text-right p-2">{formatCurrency(segment.total2025)}</td>
                        <td className="text-right p-2">{segment.projects}</td>
                        <td className={`text-right p-2 ${segment.avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(segment.avgGrowth)}
                        </td>
                        <td className="text-right p-2">{segment.contribution.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VISTA 3: ALERTAS Y RIESGOS */}
      {activeView === 'alerts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Proyectos de alto riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alto Riesgo ({alertsAnalysis.highRisk.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alertsAnalysis.highRisk.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                      <div className="text-sm font-medium">{item.proyecto}</div>
                      <div className="text-xs text-gray-600">{item.empresa}</div>
                      <div className="text-sm text-red-600 font-bold">
                        {formatPercentage(item.annualPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Oportunidades de crecimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Alto Crecimiento ({alertsAnalysis.highGrowth.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alertsAnalysis.highGrowth.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                      <div className="text-sm font-medium">{item.proyecto}</div>
                      <div className="text-xs text-gray-600">{item.empresa}</div>
                      <div className="text-sm text-green-600 font-bold">
                        {formatPercentage(item.annualPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proyectos estancados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Estancados ({alertsAnalysis.stagnant.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alertsAnalysis.stagnant.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                      <div className="text-sm font-medium">{item.proyecto}</div>
                      <div className="text-xs text-gray-600">{item.empresa}</div>
                      <div className="text-sm text-amber-600 font-bold">
                        {formatPercentage(item.annualPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VISTA 4: RANKINGS */}
      {activeView === 'ranking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top gainers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingAnalysis.topGainers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{item.proyecto.substring(0, 20)}...</div>
                        <div className="text-xs text-gray-600">{item.empresa}</div>
                      </div>
                      <div className="text-green-600 font-bold">
                        {formatPercentage(item.annualPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top losers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingAnalysis.topLosers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{item.proyecto.substring(0, 20)}...</div>
                        <div className="text-xs text-gray-600">{item.empresa}</div>
                      </div>
                      <div className="text-red-600 font-bold">
                        {formatPercentage(item.annualPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top by volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Top por Volumen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingAnalysis.topByVolume.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{item.proyecto.substring(0, 20)}...</div>
                        <div className="text-xs text-gray-600">{item.empresa}</div>
                      </div>
                      <div className="text-blue-600 font-bold">
                        {formatCurrency(item.total2024 + item.total2025)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRevenueAnalysis;
