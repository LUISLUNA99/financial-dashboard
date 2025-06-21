import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import AdvancedRevenueAnalysis from './AdvancedRevenueAnalysis';
import RevenueHeatmap from './RevenueHeatmap';
import AdvancedFilters from './AdvancedFilters';
import RealTimeMetrics from './RealTimeMetrics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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

const RevenueComparisonCharts: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [chartType, setChartType] = useState<'monthly' | 'yearly' | 'top-projects' | 'advanced' | 'heatmap' | 'filters' | 'realtime'>('monthly');
  const [loading, setLoading] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<any>(null);

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
      const headers = lines[0].split(',');
      
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
        
        // Parse monthly data (columns 4-39 are monthly data)
        months.forEach((month, index) => {
          const baseIndex = 4 + (index * 3); // Each month has 3 columns: 2024, 2025, percentage
          
          const revenue2024Str = values[baseIndex]?.trim().replace(/[",\$\s]/g, '') || '0';
          const revenue2025Str = values[baseIndex + 1]?.trim().replace(/[",\$\s]/g, '') || '0';
          const percentageStr = values[baseIndex + 2]?.trim().replace(/[%,]/g, '') || '0';
          
          const revenue2024 = parseFloat(revenue2024Str) || 0;
          const revenue2025 = parseFloat(revenue2025Str) || 0;
          const percentage = parseFloat(percentageStr) || 0;
          
          monthlyData[month] = { revenue2024, revenue2025, percentage };
        });
        
        // Parse totals (last 3 columns)
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

  // Handle advanced filters
  const handleFiltersChange = (filters: any) => {
    setAdvancedFilters(filters);
  };

  // Apply advanced filters to data
  const applyAdvancedFilters = (data: RevenueData[]) => {
    if (!advancedFilters) return data;

    return data.filter(item => {
      // Company filter
      if (advancedFilters.companies.length > 0 && !advancedFilters.companies.includes(item.empresa)) {
        return false;
      }

      // Project filter
      if (advancedFilters.projects.length > 0 && !advancedFilters.projects.includes(item.proyecto)) {
        return false;
      }

      // Search term filter
      if (advancedFilters.searchTerm.trim()) {
        const searchTerm = advancedFilters.searchTerm.toLowerCase();
        if (!item.proyecto.toLowerCase().includes(searchTerm) && 
            !item.empresa.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Revenue range filter
      if (item.total2025 < advancedFilters.revenueRange.min || 
          item.total2025 > advancedFilters.revenueRange.max) {
        return false;
      }

      // Growth range filter
      const growth = item.total2024 > 0 ? ((item.total2025 - item.total2024) / item.total2024) * 100 : 0;
      if (growth < advancedFilters.growthRange.min || 
          growth > advancedFilters.growthRange.max) {
        return false;
      }

      return true;
    });
  };

  // Get filtered data based on selected company and advanced filters
  let baseFilteredData = selectedCompany === 'ALL' 
    ? revenueData 
    : revenueData.filter(item => item.empresa === selectedCompany);
  
  const filteredData = applyAdvancedFilters(baseFilteredData);

  // Get unique companies
  const companies = ['ALL', ...Array.from(new Set(revenueData.map(item => item.empresa)))];

  // Monthly comparison chart data
  const getMonthlyChartData = () => {
    const aggregatedData = months.map(month => {
      const total2024 = filteredData.reduce((sum, item) => sum + item.monthlyData[month]?.revenue2024 || 0, 0);
      const total2025 = filteredData.reduce((sum, item) => sum + item.monthlyData[month]?.revenue2025 || 0, 0);
      return { month, total2024, total2025 };
    });

    return {
      labels: months,
      datasets: [
        {
          label: '2024',
          data: aggregatedData.map(item => item.total2024),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: '2025',
          data: aggregatedData.map(item => item.total2025),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Yearly comparison chart data
  const getYearlyChartData = () => {
    const projectData = filteredData
      .filter(item => item.total2024 > 0 || item.total2025 > 0)
      .sort((a, b) => (b.total2024 + b.total2025) - (a.total2024 + a.total2025))
      .slice(0, 10);

    return {
      labels: projectData.map(item => item.proyecto.length > 20 ? item.proyecto.substring(0, 20) + '...' : item.proyecto),
      datasets: [
        {
          label: 'Total 2024',
          data: projectData.map(item => item.total2024),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Total 2025',
          data: projectData.map(item => item.total2025),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Top projects by revenue change
  const getTopProjectsData = () => {
    const projectsWithChange = filteredData
      .filter(item => item.total2024 > 0 && item.total2025 > 0)
      .map(item => ({
        ...item,
        change: item.total2025 - item.total2024,
        changePercentage: ((item.total2025 - item.total2024) / item.total2024) * 100
      }))
      .sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))
      .slice(0, 10);

    return {
      labels: projectsWithChange.map(item => item.proyecto.length > 15 ? item.proyecto.substring(0, 15) + '...' : item.proyecto),
      datasets: [
        {
          label: 'Cambio Porcentual (%)',
          data: projectsWithChange.map(item => item.changePercentage),
          backgroundColor: projectsWithChange.map(item => 
            item.changePercentage > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: projectsWithChange.map(item => 
            item.changePercentage > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartType === 'monthly' ? 'Comparación Mensual de Ingresos' : 
              chartType === 'yearly' ? 'Top 10 Proyectos por Ingresos Totales' :
              'Top 10 Proyectos por Cambio Porcentual',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (chartType === 'top-projects') {
              return `${context.dataset.label}: ${value.toFixed(2)}%`;
            }
            return `${context.dataset.label}: $${value.toLocaleString('es-MX')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (chartType === 'top-projects') {
              return value + '%';
            }
            return '$' + value.toLocaleString('es-MX');
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
  };

  // Calculate summary statistics
  const totalRevenue2024 = filteredData.reduce((sum, item) => sum + item.total2024, 0);
  const totalRevenue2025 = filteredData.reduce((sum, item) => sum + item.total2025, 0);
  const overallChange = totalRevenue2024 > 0 ? ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando datos de comparación...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalRevenue2024.toLocaleString('es-MX')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue2025.toLocaleString('es-MX')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cambio Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select 
          value={selectedCompany} 
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {companies.map(company => (
            <option key={company} value={company}>
              {company === 'ALL' ? 'Todas las empresas' : company}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button
            variant={chartType === 'monthly' ? 'default' : 'outline'}
            onClick={() => setChartType('monthly')}
            size="sm"
          >
            Mensual
          </Button>
          <Button
            variant={chartType === 'yearly' ? 'default' : 'outline'}
            onClick={() => setChartType('yearly')}
            size="sm"
          >
            Por Proyecto
          </Button>
          <Button
            variant={chartType === 'top-projects' ? 'default' : 'outline'}
            onClick={() => setChartType('top-projects')}
            size="sm"
          >
            Cambios %
          </Button>
          <Button
            variant={chartType === 'advanced' ? 'default' : 'outline'}
            onClick={() => setChartType('advanced')}
            size="sm"
          >
            📊 Análisis Avanzado
          </Button>
          <Button
            variant={chartType === 'heatmap' ? 'default' : 'outline'}
            onClick={() => setChartType('heatmap')}
            size="sm"
          >
            🔥 Heatmap
          </Button>
          <Button
            variant={chartType === 'filters' ? 'default' : 'outline'}
            onClick={() => setChartType('filters')}
            size="sm"
          >
            🔍 Filtros
          </Button>
          <Button
            variant={chartType === 'realtime' ? 'default' : 'outline'}
            onClick={() => setChartType('realtime')}
            size="sm"
          >
            ⚡ Tiempo Real
          </Button>
        </div>
      </div>

      {/* Chart */}
      {(chartType === 'monthly' || chartType === 'yearly' || chartType === 'top-projects') && (
        <Card>
          <CardContent className="pt-6">
            <div style={{ height: '400px' }}>
              {chartType === 'monthly' && (
                <Bar data={getMonthlyChartData()} options={chartOptions} />
              )}
              {chartType === 'yearly' && (
                <Bar data={getYearlyChartData()} options={chartOptions} />
              )}
              {chartType === 'top-projects' && (
                <Bar data={getTopProjectsData()} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Analysis View */}
      {chartType === 'advanced' && (
        <AdvancedRevenueAnalysis />
      )}

      {/* Heatmap View */}
      {chartType === 'heatmap' && (
        <RevenueHeatmap />
      )}

      {/* Advanced Filters View */}
      {chartType === 'filters' && (
        <div className="space-y-6">
          <AdvancedFilters
            onFiltersChange={handleFiltersChange}
            availableCompanies={Array.from(new Set(revenueData.map(item => item.empresa)))}
            availableProjects={Array.from(new Set(revenueData.map(item => item.proyecto))).slice(0, 50)}
          />
          
          {/* Show filtered results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Resultados Filtrados 
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredData.length} proyectos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${filteredData.reduce((sum, item) => sum + item.total2025, 0).toLocaleString('es-MX')}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Total 2025 Filtrado</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredData.filter(item => item.total2025 > item.total2024).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Proyectos en Crecimiento</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 shadow-sm">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(filteredData.map(item => item.empresa)).size}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Empresas Activas</div>
                </div>
              </div>
              
              {/* Filtered Data Cards */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  📊 Top 10 Proyectos Filtrados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredData.slice(0, 10).map((item, index) => {
                    const changePercentage = item.total2024 > 0 ? ((item.total2025 - item.total2024) / item.total2024) * 100 : 0;
                    const isPositive = changePercentage >= 0;
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                          isPositive 
                            ? 'bg-green-50 border-l-green-400 hover:bg-green-100' 
                            : 'bg-red-50 border-l-red-400 hover:bg-red-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                              {item.proyecto.length > 40 
                                ? item.proyecto.substring(0, 40) + '...' 
                                : item.proyecto}
                            </h5>
                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                              item.empresa === 'BUZZWORD' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {item.empresa}
                            </span>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-lg font-bold text-gray-900">
                              ${(item.total2025 / 1000).toFixed(0)}K
                            </div>
                            <div className={`text-sm font-semibold flex items-center gap-1 ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '↗️' : '↘️'}
                              {isPositive ? '+' : ''}{changePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-600 mt-3">
                          <span>2024: ${(item.total2024 / 1000).toFixed(0)}K</span>
                          <span>2025: ${(item.total2025 / 1000).toFixed(0)}K</span>
                        </div>
                        
                        {/* Mini progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                          <div 
                            className={`h-1 rounded-full ${
                              isPositive ? 'bg-green-400' : 'bg-red-400'
                            }`}
                            style={{ 
                              width: `${Math.min(Math.abs(changePercentage), 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Metrics View */}
      {chartType === 'realtime' && (
        <RealTimeMetrics />
      )}

      {/* Data Cards - Only show for basic charts */}
      {(chartType === 'monthly' || chartType === 'yearly' || chartType === 'top-projects') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Detalle por Proyecto
              <span className="text-sm font-normal text-gray-500">
                (Top 20 proyectos por ingresos totales)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData
                .filter(item => item.total2024 > 0 || item.total2025 > 0)
                .sort((a, b) => (b.total2024 + b.total2025) - (a.total2024 + a.total2025))
                .slice(0, 20)
                .map((item, index) => {
                  const change = item.total2025 - item.total2024;
                  const changePercentage = item.total2024 > 0 ? (change / item.total2024) * 100 : 0;
                  const isPositive = changePercentage >= 0;
                  const isSignificant = Math.abs(changePercentage) > 20;
                  
                  return (
                    <div 
                      key={index} 
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                        isPositive 
                          ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300' 
                          : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-300'
                      }`}
                    >
                      {/* Company Badge */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        item.empresa === 'BUZZWORD' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.empresa}
                      </div>
                      
                      {/* Ranking Badge */}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-6 pt-12">
                        {/* Project Name */}
                        <h3 className="font-semibold text-gray-900 mb-3 pr-16 leading-tight">
                          {item.proyecto.length > 50 
                            ? item.proyecto.substring(0, 50) + '...' 
                            : item.proyecto}
                        </h3>
                        
                        {/* Financial Data */}
                        <div className="space-y-3">
                          {/* 2024 */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">2024:</span>
                            <span className="font-mono text-sm font-semibold text-gray-800">
                              ${item.total2024.toLocaleString('es-MX')}
                            </span>
                          </div>
                          
                          {/* 2025 */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">2025:</span>
                            <span className="font-mono text-sm font-semibold text-gray-800">
                              ${item.total2025.toLocaleString('es-MX')}
                            </span>
                          </div>
                          
                          {/* Divider */}
                          <div className="border-t border-gray-200 my-3"></div>
                          
                          {/* Change Amount */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Cambio:</span>
                            <span className={`font-mono text-sm font-bold ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '+' : ''}${change.toLocaleString('es-MX')}
                            </span>
                          </div>
                          
                          {/* Percentage Change with Visual Indicator */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600 font-medium">% Cambio:</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-lg font-bold ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isPositive ? '+' : ''}{changePercentage.toFixed(1)}%
                              </span>
                              <div className={`text-lg ${
                                isPositive ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {isPositive ? '📈' : '📉'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progreso 2024 → 2025</span>
                              <span>{Math.abs(changePercentage).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isPositive ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(Math.abs(changePercentage), 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Performance Badge */}
                          <div className="flex justify-center mt-4">
                            {isSignificant && isPositive && (
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                🚀 Alto Crecimiento
                              </div>
                            )}
                            {isSignificant && !isPositive && (
                              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                ⚠️ Requiere Atención
                              </div>
                            )}
                            {!isSignificant && Math.abs(changePercentage) > 5 && (
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                📊 Crecimiento Moderado
                              </div>
                            )}
                            {Math.abs(changePercentage) <= 5 && (
                              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                ⚖️ Estable
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative Element */}
                      <div className={`absolute bottom-0 left-0 w-full h-1 ${
                        isPositive ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  );
                })}
            </div>
            
            {/* Summary Statistics */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📈 Resumen de Rendimiento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredData.filter(item => 
                      item.total2024 > 0 && 
                      ((item.total2025 - item.total2024) / item.total2024) * 100 > 0
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Proyectos en Crecimiento</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredData.filter(item => 
                      item.total2024 > 0 && 
                      ((item.total2025 - item.total2024) / item.total2024) * 100 < 0
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Proyectos en Declive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredData.filter(item => 
                      item.total2024 > 0 && 
                      Math.abs(((item.total2025 - item.total2024) / item.total2024) * 100) > 20
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Cambios Significativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${filteredData.reduce((sum, item) => sum + Math.abs(item.total2025 - item.total2024), 0).toLocaleString('es-MX')}
                  </div>
                  <div className="text-sm text-gray-600">Variación Total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueComparisonCharts;
