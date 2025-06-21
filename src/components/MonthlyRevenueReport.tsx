import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { RevenueData, FinancialReport } from '../types';
import { 
  getMonthlyRevenueData, 
  getFinancialReportsByCategory, 
  uploadFinancialData,
  getFinancialCategories 
} from '../services/financialDataService';

interface MonthlyRevenueReportProps {
  className?: string;
}

const MonthlyRevenueReport: React.FC<MonthlyRevenueReportProps> = ({ className }) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Ingresos');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataUploaded, setDataUploaded] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revenue, cats] = await Promise.all([
        getMonthlyRevenueData(),
        getFinancialCategories()
      ]);
      
      setRevenueData(revenue);
      setCategories(cats);
      
      if (cats.length === 0) {
        // Si no hay datos, mostrar que necesita subir datos
        setDataUploaded(false);
      } else {
        setDataUploaded(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Subir datos del CSV a Supabase
  const handleUploadData = async () => {
    setLoading(true);
    try {
      await uploadFinancialData();
      setDataUploaded(true);
      await loadData();
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Error al subir los datos. Revisa la conexión a Supabase.');
    }
    setLoading(false);
  };

  // Configurar gráfico de ingresos mensuales
  useEffect(() => {
    if (revenueData.length > 0) {
      const chartElement = document.getElementById('monthly-revenue-chart');
      if (chartElement) {
        const chart = echarts.init(chartElement);
        
        const option = {
          title: {
            text: 'Ingresos Mensuales 2025',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
              let result = `<strong>${params[0].axisValue}</strong><br/>`;
              params.forEach((param: any) => {
                const value = new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'USD'
                }).format(param.value);
                result += `${param.marker}${param.seriesName}: ${value}<br/>`;
              });
              return result;
            }
          },
          legend: {
            data: ['Planeado', 'Real', 'Varianza'],
            top: 30
          },
          xAxis: {
            type: 'category',
            data: revenueData.map(item => item.month)
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: (value: number) => {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact'
                }).format(value);
              }
            }
          },
          series: [
            {
              name: 'Planeado',
              type: 'bar',
              data: revenueData.map(item => item.planned),
              itemStyle: {
                color: '#3b82f6'
              }
            },
            {
              name: 'Real',
              type: 'bar',
              data: revenueData.map(item => item.actual),
              itemStyle: {
                color: '#10b981'
              }
            },
            {
              name: 'Varianza',
              type: 'line',
              yAxisIndex: 0,
              data: revenueData.map(item => item.variance),
              itemStyle: {
                color: '#f59e0b'
              },
              lineStyle: {
                width: 3
              }
            }
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        };

        chart.setOption(option);
        
        // Cleanup
        return () => {
          chart.dispose();
        };
      }
    }
  }, [revenueData]);

  // Formatear números como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calcular totales
  const totals = revenueData.reduce((acc, item) => ({
    planned: acc.planned + item.planned,
    actual: acc.actual + item.actual,
    variance: acc.variance + item.variance
  }), { planned: 0, actual: 0, variance: 0 });

  const totalVariancePercentage = totals.planned > 0 
    ? (totals.variance / totals.planned) * 100 
    : 0;

  if (!dataUploaded) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Reportes Financieros</h2>
            <p className="text-gray-600">
              No hay datos financieros disponibles. Sube los datos del CSV de Buzzword para comenzar.
            </p>
            <Button 
              onClick={handleUploadData}
              disabled={loading}
              className="px-6 py-2"
            >
              {loading ? 'Subiendo...' : 'Subir Datos de Buzzword CSV'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con botón de actualización */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reportes de Ingresos Mensuales</h2>
        <Button 
          onClick={handleUploadData}
          disabled={loading}
          variant="outline"
          className="px-4 py-2"
        >
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Planeados</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.planned)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Reales</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.actual)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Varianza</h3>
          <p className={`text-2xl font-bold ${totals.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.variance)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">% Varianza</h3>
          <p className={`text-2xl font-bold ${totalVariancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalVariancePercentage.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Gráfico de ingresos mensuales */}
      <Card className="p-6">
        <div id="monthly-revenue-chart" style={{ width: '100%', height: '400px' }}></div>
      </Card>

      {/* Tabla detallada */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalle por Mes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Mes</th>
                <th className="text-right py-2">Planeado</th>
                <th className="text-right py-2">Real</th>
                <th className="text-right py-2">Varianza</th>
                <th className="text-right py-2">% Varianza</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{item.month}</td>
                  <td className="text-right py-2">{formatCurrency(item.planned)}</td>
                  <td className="text-right py-2">{formatCurrency(item.actual)}</td>
                  <td className={`text-right py-2 ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.variance)}
                  </td>
                  <td className={`text-right py-2 ${item.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyRevenueReport;
