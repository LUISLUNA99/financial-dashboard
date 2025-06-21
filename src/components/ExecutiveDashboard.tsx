import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { TrendingUp, TrendingDown, Target, AlertCircle, DollarSign, BarChart3, Users, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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

interface ExecutiveKPI {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

const ExecutiveDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'ytd'>('ytd');

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
        
        if (!empresa || !proyecto) continue;
        
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
      
      setRevenueData(parsedData.filter(item => item.empresa !== 'Total'));
      setLoading(false);
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    parseCSVData();
  }, []);

  // Calculate executive KPIs
  const calculateKPIs = (): ExecutiveKPI[] => {
    const totalRevenue2024 = revenueData.reduce((sum, item) => sum + item.total2024, 0);
    const totalRevenue2025 = revenueData.reduce((sum, item) => sum + item.total2025, 0);
    const revenueGrowth = totalRevenue2024 > 0 ? ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024) * 100 : 0;
    
    const activeProjects = revenueData.filter(item => item.total2025 > 0).length;
    const totalProjects = revenueData.length;
    const projectEfficiency = totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0;
    
    const companies = new Set(revenueData.map(item => item.empresa)).size;
    
    // Calculate average monthly growth
    let monthlyGrowthSum = 0;
    let monthlyGrowthCount = 0;
    
    months.forEach(month => {
      const total2024 = revenueData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2024 || 0), 0);
      const total2025 = revenueData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2025 || 0), 0);
      
      if (total2024 > 0) {
        const growth = ((total2025 - total2024) / total2024) * 100;
        monthlyGrowthSum += growth;
        monthlyGrowthCount++;
      }
    });
    
    const avgMonthlyGrowth = monthlyGrowthCount > 0 ? monthlyGrowthSum / monthlyGrowthCount : 0;

    return [
      {
        title: 'Ingresos Totales 2025',
        value: `$${(totalRevenue2025 / 1000000).toFixed(1)}M`,
        change: revenueGrowth,
        icon: <DollarSign className="w-6 h-6" />,
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'neutral',
        color: 'bg-green-500'
      },
      {
        title: 'Crecimiento Anual',
        value: `${revenueGrowth.toFixed(1)}%`,
        change: revenueGrowth,
        icon: revenueGrowth > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />,
        trend: revenueGrowth > 0 ? 'up' : 'down',
        color: revenueGrowth > 0 ? 'bg-green-500' : 'bg-red-500'
      },
      {
        title: 'Proyectos Activos',
        value: `${activeProjects}/${totalProjects}`,
        change: projectEfficiency,
        icon: <BarChart3 className="w-6 h-6" />,
        trend: projectEfficiency > 75 ? 'up' : projectEfficiency > 50 ? 'neutral' : 'down',
        color: 'bg-blue-500'
      },
      {
        title: 'Empresas Participantes',
        value: `${companies}`,
        change: avgMonthlyGrowth,
        icon: <Users className="w-6 h-6" />,
        trend: avgMonthlyGrowth > 0 ? 'up' : 'down',
        color: 'bg-purple-500'
      }
    ];
  };

  // Get top performing projects
  const getTopPerformers = () => {
    return revenueData
      .filter(item => item.total2024 > 0 && item.total2025 > 0)
      .map(item => ({
        ...item,
        growth: ((item.total2025 - item.total2024) / item.total2024) * 100
      }))
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 5);
  };

  // Get revenue distribution by company
  const getCompanyDistribution = () => {
    const companyData = new Map<string, number>();
    
    revenueData.forEach(item => {
      const current = companyData.get(item.empresa) || 0;
      companyData.set(item.empresa, current + item.total2025);
    });
    
    const companies = Array.from(companyData.entries()).sort((a, b) => b[1] - a[1]);
    
    return {
      labels: companies.map(([company]) => company),
      datasets: [{
        data: companies.map(([, revenue]) => revenue),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Get monthly trend data
  const getMonthlyTrend = () => {
    const monthlyTrend = months.map(month => {
      const total2024 = revenueData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2024 || 0), 0);
      const total2025 = revenueData.reduce((sum, item) => sum + (item.monthlyData[month]?.revenue2025 || 0), 0);
      
      return {
        month,
        revenue2024: total2024,
        revenue2025: total2025,
        growth: total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0
      };
    });

    return {
      labels: months.slice(0, 6), // Show first 6 months
      datasets: [
        {
          label: 'Crecimiento (%)',
          data: monthlyTrend.slice(0, 6).map(item => item.growth),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard ejecutivo...</div>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const topPerformers = getTopPerformers();
  const companyDistribution = getCompanyDistribution();
  const monthlyTrend = getMonthlyTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h2>
          <p className="text-gray-600">Análisis integral de rendimiento 2024 vs 2025</p>
        </div>
        
        <div className="flex gap-2">
          {(['6m', '12m', 'ytd'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '6m' ? '6 Meses' : range === '12m' ? '12 Meses' : 'YTD'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className={`flex items-center mt-2 text-sm ${
                    kpi.trend === 'up' ? 'text-green-600' : 
                    kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                     kpi.trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </div>
                </div>
                <div className={`p-3 rounded-full text-white ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tendencia de Crecimiento Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line 
                data={monthlyTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value: any) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribución por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Doughnut 
                data={companyDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context: any) {
                          const value = context.parsed;
                          return `${context.label}: $${value.toLocaleString('es-MX')}`;
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

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top 5 Proyectos de Mayor Crecimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{project.proyecto}</h4>
                    <p className="text-sm text-gray-600">{project.empresa}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    +{project.growth.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    ${project.total2025.toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;
