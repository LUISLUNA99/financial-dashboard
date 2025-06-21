import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Bell, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'revenue' | 'growth' | 'performance' | 'forecast';
  title: string;
  description: string;
  value?: string;
  trend?: number;
  actionRequired: boolean;
  timestamp: Date;
  project?: string;
  company?: string;
}

interface RevenueData {
  empresa: string;
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

const SmartAlertsSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
          proyecto,
          monthlyData,
          total2024,
          total2025,
          annualPercentage
        });
      }
      
      setRevenueData(parsedData.filter(item => item.empresa !== 'Total'));
      generateAlerts(parsedData.filter(item => item.empresa !== 'Total'));
      setLoading(false);
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      setLoading(false);
    }
  };

  // Generate intelligent alerts based on data analysis
  const generateAlerts = (data: RevenueData[]) => {
    const newAlerts: Alert[] = [];
    let alertId = 1;

    // 1. Critical Revenue Drops
    data.forEach(item => {
      const revenueDrop = ((item.total2025 - item.total2024) / item.total2024) * 100;
      
      if (revenueDrop < -50 && item.total2024 > 100000) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'critical',
          category: 'revenue',
          title: 'Caída Crítica de Ingresos',
          description: `El proyecto ${item.proyecto} muestra una caída del ${Math.abs(revenueDrop).toFixed(1)}% en ingresos`,
          value: `$${item.total2025.toLocaleString('es-MX')}`,
          trend: revenueDrop,
          actionRequired: true,
          timestamp: new Date(),
          project: item.proyecto,
          company: item.empresa
        });
      } else if (revenueDrop < -20 && item.total2024 > 50000) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'warning',
          category: 'revenue',
          title: 'Disminución de Ingresos',
          description: `El proyecto ${item.proyecto} presenta una reducción del ${Math.abs(revenueDrop).toFixed(1)}%`,
          value: `$${item.total2025.toLocaleString('es-MX')}`,
          trend: revenueDrop,
          actionRequired: false,
          timestamp: new Date(),
          project: item.proyecto,
          company: item.empresa
        });
      }
    });

    // 2. Exceptional Growth
    data.forEach(item => {
      const revenueGrowth = ((item.total2025 - item.total2024) / item.total2024) * 100;
      
      if (revenueGrowth > 100 && item.total2024 > 10000) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'success',
          category: 'growth',
          title: 'Crecimiento Excepcional',
          description: `${item.proyecto} ha logrado un crecimiento del ${revenueGrowth.toFixed(1)}%`,
          value: `$${item.total2025.toLocaleString('es-MX')}`,
          trend: revenueGrowth,
          actionRequired: false,
          timestamp: new Date(),
          project: item.proyecto,
          company: item.empresa
        });
      }
    });

    // 3. Inactive Projects
    data.forEach(item => {
      if (item.total2024 > 0 && item.total2025 === 0) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'warning',
          category: 'performance',
          title: 'Proyecto Inactivo',
          description: `${item.proyecto} no registra ingresos en 2025 pero tenía actividad en 2024`,
          value: `$0`,
          trend: -100,
          actionRequired: true,
          timestamp: new Date(),
          project: item.proyecto,
          company: item.empresa
        });
      }
    });

    // 4. Monthly Volatility Alerts
    data.forEach(item => {
      const monthlyChanges: number[] = [];
      
      for (let i = 0; i < months.length - 1; i++) {
        const currentMonth = months[i];
        const nextMonth = months[i + 1];
        
        const current2025 = item.monthlyData[currentMonth]?.revenue2025 || 0;
        const next2025 = item.monthlyData[nextMonth]?.revenue2025 || 0;
        
        if (current2025 > 0) {
          const change = ((next2025 - current2025) / current2025) * 100;
          monthlyChanges.push(Math.abs(change));
        }
      }
      
      const avgVolatility = monthlyChanges.length > 0 
        ? monthlyChanges.reduce((sum, change) => sum + change, 0) / monthlyChanges.length 
        : 0;
      
      if (avgVolatility > 50 && item.total2025 > 50000) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'info',
          category: 'performance',
          title: 'Alta Volatilidad Mensual',
          description: `${item.proyecto} muestra fluctuaciones promedio del ${avgVolatility.toFixed(1)}%`,
          value: `${avgVolatility.toFixed(1)}% volatilidad`,
          actionRequired: false,
          timestamp: new Date(),
          project: item.proyecto,
          company: item.empresa
        });
      }
    });

    // 5. Company Performance Alerts
    const companyTotals = new Map<string, { total2024: number; total2025: number }>();
    
    data.forEach(item => {
      const current = companyTotals.get(item.empresa) || { total2024: 0, total2025: 0 };
      companyTotals.set(item.empresa, {
        total2024: current.total2024 + item.total2024,
        total2025: current.total2025 + item.total2025
      });
    });

    companyTotals.forEach((totals, company) => {
      const companyGrowth = totals.total2024 > 0 
        ? ((totals.total2025 - totals.total2024) / totals.total2024) * 100 
        : 0;
      
      if (companyGrowth < -15) {
        newAlerts.push({
          id: `alert-${alertId++}`,
          type: 'warning',
          category: 'performance',
          title: 'Desempeño Empresarial Bajo',
          description: `${company} muestra una reducción general del ${Math.abs(companyGrowth).toFixed(1)}%`,
          value: `$${totals.total2025.toLocaleString('es-MX')}`,
          trend: companyGrowth,
          actionRequired: true,
          timestamp: new Date(),
          company: company
        });
      }
    });

    // Sort alerts by priority (critical first)
    const sortedAlerts = newAlerts.sort((a, b) => {
      const priority = { critical: 4, warning: 3, info: 2, success: 1 };
      return priority[b.type] - priority[a.type];
    });

    setAlerts(sortedAlerts);
  };

  useEffect(() => {
    parseCSVData();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Clock className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const filteredAlerts = selectedCategory === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.category === selectedCategory);

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    actionRequired: alerts.filter(a => a.actionRequired).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Analizando datos y generando alertas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Sistema de Alertas Inteligentes
          </h2>
          <p className="text-gray-600">Análisis automático de anomalías y oportunidades</p>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alertStats.total}</div>
                <div className="text-sm text-gray-600">Total Alertas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
                <div className="text-sm text-gray-600">Críticas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{alertStats.warning}</div>
                <div className="text-sm text-gray-600">Advertencias</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{alertStats.actionRequired}</div>
                <div className="text-sm text-gray-600">Requieren Acción</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'revenue', 'growth', 'performance', 'forecast'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'Todas' : 
             category === 'revenue' ? 'Ingresos' :
             category === 'growth' ? 'Crecimiento' :
             category === 'performance' ? 'Rendimiento' : 'Pronóstico'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Todo se ve bien!</h3>
              <p className="text-gray-600">No se encontraron alertas para la categoría seleccionada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      alert.type === 'info' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <Badge variant={getBadgeVariant(alert.type)}>
                          {alert.type === 'critical' ? 'Crítica' :
                           alert.type === 'warning' ? 'Advertencia' :
                           alert.type === 'info' ? 'Info' : 'Éxito'}
                        </Badge>
                        {alert.actionRequired && (
                          <Badge variant="destructive">Acción Requerida</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {alert.value && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {alert.value}
                          </div>
                        )}
                        
                        {alert.trend !== undefined && (
                          <div className="flex items-center gap-1">
                            {alert.trend > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            {alert.trend > 0 ? '+' : ''}{alert.trend.toFixed(1)}%
                          </div>
                        )}
                        
                        {alert.company && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {alert.company}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {alert.timestamp.toLocaleDateString('es-MX')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartAlertsSystem;
