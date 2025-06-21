import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Calendar, Filter, TrendingUp, TrendingDown, Zap } from 'lucide-react';

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

interface HeatmapCell {
  month: string;
  proyecto: string;
  empresa: string;
  value2024: number;
  value2025: number;
  growth: number;
  intensity: number; // 0-100 for color intensity
}

const RevenueHeatmap: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'growth' | 'volume' | 'variance'>('growth');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

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

  // Filter data based on selected company
  const filteredData = selectedCompany === 'ALL' 
    ? revenueData 
    : revenueData.filter(item => item.empresa === selectedCompany);

  // Get unique companies
  const companies = ['ALL', ...Array.from(new Set(revenueData.map(item => item.empresa)))];

  // Prepare heatmap data
  const getHeatmapData = (): HeatmapCell[] => {
    const heatmapData: HeatmapCell[] = [];
    
    // Get top projects by total revenue to limit display
    const topProjects = filteredData
      .filter(item => item.total2024 > 0 || item.total2025 > 0)
      .sort((a, b) => (b.total2024 + b.total2025) - (a.total2024 + a.total2025))
      .slice(0, 15); // Limit to top 15 projects for readability
    
    topProjects.forEach(project => {
      months.forEach(month => {
        const monthData = project.monthlyData[month];
        if (monthData) {
          const growth = monthData.revenue2024 > 0 
            ? ((monthData.revenue2025 - monthData.revenue2024) / monthData.revenue2024) * 100 
            : 0;
          
          heatmapData.push({
            month,
            proyecto: project.proyecto,
            empresa: project.empresa,
            value2024: monthData.revenue2024,
            value2025: monthData.revenue2025,
            growth,
            intensity: 0 // Will be calculated based on selected metric
          });
        }
      });
    });
    
    // Calculate intensity based on selected metric
    if (selectedMetric === 'growth') {
      const growthValues = heatmapData.map(cell => Math.abs(cell.growth));
      const maxGrowth = Math.max(...growthValues);
      
      heatmapData.forEach(cell => {
        cell.intensity = maxGrowth > 0 ? (Math.abs(cell.growth) / maxGrowth) * 100 : 0;
      });
    } else if (selectedMetric === 'volume') {
      const volumeValues = heatmapData.map(cell => cell.value2025);
      const maxVolume = Math.max(...volumeValues);
      
      heatmapData.forEach(cell => {
        cell.intensity = maxVolume > 0 ? (cell.value2025 / maxVolume) * 100 : 0;
      });
    } else if (selectedMetric === 'variance') {
      const varianceValues = heatmapData.map(cell => Math.abs(cell.value2025 - cell.value2024));
      const maxVariance = Math.max(...varianceValues);
      
      heatmapData.forEach(cell => {
        cell.intensity = maxVariance > 0 ? (Math.abs(cell.value2025 - cell.value2024) / maxVariance) * 100 : 0;
      });
    }
    
    return heatmapData;
  };

  const heatmapData = getHeatmapData();
  
  // Get unique projects for rows
  const projects = Array.from(new Set(heatmapData.map(cell => cell.proyecto)));

  // Get cell color based on metric and value
  const getCellColor = (cell: HeatmapCell) => {
    if (selectedMetric === 'growth') {
      if (cell.growth > 0) {
        const opacity = Math.min(cell.intensity / 100, 1);
        return `rgba(34, 197, 94, ${opacity})`; // Green for positive growth
      } else if (cell.growth < 0) {
        const opacity = Math.min(cell.intensity / 100, 1);
        return `rgba(239, 68, 68, ${opacity})`; // Red for negative growth
      } else {
        return 'rgba(156, 163, 175, 0.3)'; // Gray for no change
      }
    } else {
      const opacity = Math.min(cell.intensity / 100, 1);
      return `rgba(59, 130, 246, ${opacity})`; // Blue for volume/variance
    }
  };

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
        <div className="text-lg">Cargando heatmap...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select 
          value={selectedCompany} 
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {companies.map(company => (
            <option key={company} value={company}>
              {company === 'ALL' ? 'Todas las empresas' : company}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button
            variant={selectedMetric === 'growth' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('growth')}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Crecimiento
          </Button>
          <Button
            variant={selectedMetric === 'volume' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('volume')}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Volumen 2025
          </Button>
          <Button
            variant={selectedMetric === 'variance' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('variance')}
            size="sm"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Varianza
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Leyenda:</div>
            <div className="flex items-center gap-4">
              {selectedMetric === 'growth' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Crecimiento Positivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Decrecimiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-sm">Sin Cambio</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <span className="text-sm">Bajo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Medio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-800 rounded"></div>
                    <span className="text-sm">Alto</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>
            Heatmap de Performance - {selectedMetric === 'growth' ? 'Crecimiento' : selectedMetric === 'volume' ? 'Volumen 2025' : 'Varianza'} por Proyecto y Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 bg-gray-50 sticky left-0 min-w-48">Proyecto</th>
                  {months.map(month => (
                    <th key={month} className="text-center p-2 bg-gray-50 min-w-24">{month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(proyecto => (
                  <tr key={proyecto} className="border-b">
                    <td className="p-2 bg-gray-50 sticky left-0 font-medium text-xs">
                      <div className="max-w-48 truncate" title={proyecto}>
                        {proyecto}
                      </div>
                      <div className="text-xs text-gray-500">
                        {heatmapData.find(cell => cell.proyecto === proyecto)?.empresa}
                      </div>
                    </td>
                    {months.map(month => {
                      const cell = heatmapData.find(c => c.proyecto === proyecto && c.month === month);
                      return (
                        <td 
                          key={month} 
                          className="p-2 text-center border-r border-gray-100"
                          style={{ 
                            backgroundColor: cell ? getCellColor(cell) : 'transparent'
                          }}
                          title={cell ? 
                            `${proyecto} - ${month}\n2024: ${formatCurrency(cell.value2024)}\n2025: ${formatCurrency(cell.value2025)}\nCrecimiento: ${formatPercentage(cell.growth)}` 
                            : 'Sin datos'
                          }
                        >
                          {cell && (
                            <div>
                              <div className="font-medium">
                                {selectedMetric === 'growth' ? formatPercentage(cell.growth) : 
                                 selectedMetric === 'volume' ? formatCurrency(cell.value2025) :
                                 formatCurrency(Math.abs(cell.value2025 - cell.value2024))}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatCurrency(cell.value2025)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Proyectos Analizados</div>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Crecimiento Promedio</div>
            <div className="text-2xl font-bold">
              {formatPercentage(
                heatmapData.reduce((sum, cell) => sum + cell.growth, 0) / heatmapData.length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total 2025</div>
            <div className="text-2xl font-bold">
              {formatCurrency(
                heatmapData.reduce((sum, cell) => sum + cell.value2025, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueHeatmap;
