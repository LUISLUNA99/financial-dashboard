import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Zap,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  target?: number;
  format: 'currency' | 'percentage' | 'number';
  lastUpdated: Date;
}

interface AlertData {
  id: string;
  metric: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const initializeMetrics = () => {
      const baseMetrics: MetricData[] = [
        {
          id: 'revenue_rate',
          name: 'Tasa de Ingresos',
          value: 125000,
          previousValue: 118000,
          unit: '/mes',
          icon: <DollarSign className="w-5 h-5" />,
          color: 'text-green-600',
          target: 130000,
          format: 'currency',
          lastUpdated: new Date()
        },
        {
          id: 'growth_velocity',
          name: 'Velocidad de Crecimiento',
          value: 8.5,
          previousValue: 7.2,
          unit: '%/mes',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-blue-600',
          target: 10,
          format: 'percentage',
          lastUpdated: new Date()
        },
        {
          id: 'active_projects',
          name: 'Proyectos Activos',
          value: 24,
          previousValue: 22,
          unit: 'proyectos',
          icon: <BarChart3 className="w-5 h-5" />,
          color: 'text-purple-600',
          target: 30,
          format: 'number',
          lastUpdated: new Date()
        },
        {
          id: 'efficiency_score',
          name: 'Índice de Eficiencia',
          value: 87.3,
          previousValue: 84.1,
          unit: '%',
          icon: <Target className="w-5 h-5" />,
          color: 'text-orange-600',
          target: 90,
          format: 'percentage',
          lastUpdated: new Date()
        },
        {
          id: 'pipeline_value',
          name: 'Valor del Pipeline',
          value: 2340000,
          previousValue: 2180000,
          unit: '',
          icon: <Activity className="w-5 h-5" />,
          color: 'text-indigo-600',
          target: 2500000,
          format: 'currency',
          lastUpdated: new Date()
        },
        {
          id: 'avg_project_size',
          name: 'Tamaño Promedio de Proyecto',
          value: 97500,
          previousValue: 99000,
          unit: '',
          icon: <Users className="w-5 h-5" />,
          color: 'text-cyan-600',
          format: 'currency',
          lastUpdated: new Date()
        }
      ];
      
      setMetrics(baseMetrics);
    };

    initializeMetrics();

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setTimeout(() => {
        setMetrics(prevMetrics => 
          prevMetrics.map(metric => {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            const newValue = metric.value * (1 + variation);
            
            return {
              ...metric,
              previousValue: metric.value,
              value: Math.max(0, newValue),
              lastUpdated: new Date()
            };
          })
        );
        
        setLastUpdate(new Date());
        setIsUpdating(false);
        
        // Generate alerts based on metric changes
        generateAlerts();
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateAlerts = () => {
    const newAlerts: AlertData[] = [];
    
    metrics.forEach(metric => {
      const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
      
      if (Math.abs(change) > 10) {
        newAlerts.push({
          id: `alert_${metric.id}_${Date.now()}`,
          metric: metric.name,
          message: `${metric.name} cambió ${change > 0 ? '+' : ''}${change.toFixed(1)}% en la última actualización`,
          severity: Math.abs(change) > 20 ? 'high' : Math.abs(change) > 15 ? 'medium' : 'low',
          timestamp: new Date()
        });
      }
      
      if (metric.target && metric.value < metric.target * 0.8) {
        newAlerts.push({
          id: `target_${metric.id}_${Date.now()}`,
          metric: metric.name,
          message: `${metric.name} está por debajo del 80% del objetivo`,
          severity: 'medium',
          timestamp: new Date()
        });
      }
    });
    
    setAlerts(prev => [...newAlerts, ...prev.slice(0, 5)]);
  };

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `$${(value / 1000).toFixed(1)}K${unit}`;
      case 'percentage':
        return `${value.toFixed(1)}${unit}`;
      case 'number':
        return `${Math.round(value)} ${unit}`;
      default:
        return `${value.toFixed(1)}${unit}`;
    }
  };

  const getChangeIcon = (current: number, previous: number) => {
    const change = current - previous;
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="w-8 h-8" />
                </div>
                Métricas en Tiempo Real
              </h2>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Última actualización: {lastUpdate.toLocaleTimeString('es-MX')}</span>
                </div>
                {isUpdating && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Actualizando...</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Auto-actualización: 30s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>
      </div>

      {/* Enhanced Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const changePercentage = getChangePercentage(metric.value, metric.previousValue);
          const progressPercentage = getProgressPercentage(metric.value, metric.target);
          
          // Define gradient colors for each metric
          const gradients = [
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-indigo-600', 
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-indigo-500 to-purple-600',
            'from-cyan-500 to-blue-600'
          ];
          
          const gradient = gradients[index % gradients.length];
          
          return (
            <Card key={metric.id} className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              <CardContent className="relative z-10 p-6">
                {/* Header with Icon and Change */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {metric.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {getChangeIcon(metric.value, metric.previousValue)}
                    <Badge 
                      variant={changePercentage > 0 ? "default" : changePercentage < 0 ? "destructive" : "secondary"}
                      className="font-semibold px-3 py-1"
                    >
                      {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                {/* Metric Value */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{metric.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </div>
                </div>
                
                {/* Progress Bar (if target exists) */}
                {metric.target && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>Progreso hacia objetivo</span>
                      <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                            progressPercentage >= 100 ? 'from-green-400 to-green-600' :
                            progressPercentage >= 80 ? 'from-yellow-400 to-yellow-600' : 
                            `${gradient}`
                          } shadow-sm`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      {progressPercentage >= 100 && (
                        <div className="absolute -top-1 -right-1">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                      <span>Objetivo: {formatValue(metric.target, metric.format, metric.unit)}</span>
                      <span className="font-medium">
                        {progressPercentage >= 100 ? '🎯 Completado' : `${(metric.target - metric.value > 0 ? metric.target - metric.value : 0).toFixed(0)} restante`}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Last Updated */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{metric.lastUpdated.toLocaleTimeString('es-MX')}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Performance Insights */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white">
              <Zap className="w-6 h-6" />
            </div>
            Insights de Rendimiento en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-2">
                  {metrics.filter(m => getChangePercentage(m.value, m.previousValue) > 0).length}
                </div>
                <div className="text-emerald-100 font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Métricas en alza
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-2">
                  {metrics.filter(m => getChangePercentage(m.value, m.previousValue) < 0).length}
                </div>
                <div className="text-red-100 font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Métricas en baja
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-2">
                  {metrics.filter(m => m.target && m.value >= m.target).length}
                </div>
                <div className="text-blue-100 font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivos cumplidos
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-2">
                  {alerts.filter(a => a.severity === 'high').length}
                </div>
                <div className="text-amber-100 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Alertas críticas
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl text-white">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-xl">Alertas Recientes del Sistema</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {alerts.length} alertas activas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert, index) => {
                const severityConfig = {
                  high: {
                    gradient: 'from-red-500 to-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    icon: '🔴'
                  },
                  medium: {
                    gradient: 'from-amber-500 to-orange-600', 
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'text-amber-800',
                    icon: '🟡'
                  },
                  low: {
                    gradient: 'from-blue-500 to-blue-600',
                    bg: 'bg-blue-50', 
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    icon: '🔵'
                  }
                };
                
                const config = severityConfig[alert.severity as keyof typeof severityConfig];
                
                return (
                  <div 
                    key={alert.id}
                    className={`group relative overflow-hidden ${config.bg} ${config.border} border-l-4 p-4 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {/* Gradient accent */}
                    <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${config.gradient}`}></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{config.icon}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm uppercase tracking-wide ${config.text}`}>
                              {alert.metric}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${config.text} border-current`}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className={`text-sm leading-relaxed ${config.text}`}>
                          {alert.message}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="text-xs text-gray-500 font-medium">
                          {alert.timestamp.toLocaleTimeString('es-MX')}
                        </div>
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${config.gradient} group-hover:scale-125 transition-transform duration-300`}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {alerts.length > 5 && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-gray-600">
                  +{alerts.length - 5} alertas adicionales
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMetrics;
