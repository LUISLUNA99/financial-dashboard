import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Calendar, 
  Filter,
  Settings,
  CheckCircle
} from 'lucide-react';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png';
  dateRange: 'current' | '6m' | '12m' | 'custom';
  companies: string[];
  sections: string[];
  includeCharts: boolean;
  includeDetailedData: boolean;
}

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

const ReportExporter: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'current',
    companies: [],
    sections: ['summary', 'charts', 'detailed'],
    includeCharts: true,
    includeDetailedData: true
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Load data for export
  const loadData = async () => {
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
    } catch (error) {
      console.error('Error loading data for export:', error);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Generate CSV content
  const generateCSV = (data: RevenueData[]) => {
    const headers = [
      'Empresa', 'LN', 'CC', 'Proyecto',
      ...months.flatMap(month => [`${month} 2024`, `${month} 2025`, `${month} %`]),
      'Total 2024', 'Total 2025', 'Cambio Anual %'
    ];
    
    const rows = data.map(item => [
      item.empresa,
      item.ln,
      item.cc,
      item.proyecto,
      ...months.flatMap(month => [
        item.monthlyData[month]?.revenue2024 || 0,
        item.monthlyData[month]?.revenue2025 || 0,
        item.monthlyData[month]?.percentage || 0
      ]),
      item.total2024,
      item.total2025,
      item.annualPercentage
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Generate summary statistics
  const generateSummary = (data: RevenueData[]) => {
    const totalRevenue2024 = data.reduce((sum, item) => sum + item.total2024, 0);
    const totalRevenue2025 = data.reduce((sum, item) => sum + item.total2025, 0);
    const overallGrowth = totalRevenue2024 > 0 ? ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024) * 100 : 0;
    
    const activeProjects2024 = data.filter(item => item.total2024 > 0).length;
    const activeProjects2025 = data.filter(item => item.total2025 > 0).length;
    
    const topGrowers = data
      .filter(item => item.total2024 > 0 && item.total2025 > 0)
      .map(item => ({
        proyecto: item.proyecto,
        empresa: item.empresa,
        growth: ((item.total2025 - item.total2024) / item.total2024) * 100
      }))
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 5);

    return {
      totalRevenue2024,
      totalRevenue2025,
      overallGrowth,
      activeProjects2024,
      activeProjects2025,
      topGrowers,
      totalProjects: data.length,
      companies: new Set(data.map(item => item.empresa)).size
    };
  };

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Filter data based on selected companies
      let filteredData = revenueData;
      if (exportOptions.companies.length > 0) {
        filteredData = revenueData.filter(item => 
          exportOptions.companies.includes(item.empresa)
        );
      }

      const summary = generateSummary(filteredData);
      const timestamp = new Date().toLocaleDateString('es-MX').replace(/\//g, '-');

      switch (exportOptions.format) {
        case 'csv':
          const csvContent = generateCSV(filteredData);
          downloadFile(csvContent, `reporte-ingresos-${timestamp}.csv`, 'text/csv');
          break;

        case 'excel':
          // In a real implementation, you would use a library like xlsx
          const excelData = generateCSV(filteredData);
          downloadFile(excelData, `reporte-ingresos-${timestamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;

        case 'pdf':
          await generatePDFReport(filteredData, summary, timestamp);
          break;

        case 'png':
          // This would capture chart images in a real implementation
          await captureChartsAsImages(timestamp);
          break;
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate PDF report (simplified version)
  const generatePDFReport = async (data: RevenueData[], summary: any, timestamp: string) => {
    // In a real implementation, you would use a library like jsPDF or Puppeteer
    const reportContent = `
REPORTE FINANCIERO 2024 vs 2025
Generado el: ${new Date().toLocaleDateString('es-MX')}

RESUMEN EJECUTIVO
================
Total Ingresos 2024: $${summary.totalRevenue2024.toLocaleString('es-MX')}
Total Ingresos 2025: $${summary.totalRevenue2025.toLocaleString('es-MX')}
Crecimiento General: ${summary.overallGrowth.toFixed(2)}%

Proyectos Activos 2024: ${summary.activeProjects2024}
Proyectos Activos 2025: ${summary.activeProjects2025}
Total de Empresas: ${summary.companies}

TOP 5 PROYECTOS DE MAYOR CRECIMIENTO
===================================
${summary.topGrowers.map((item: any, index: number) => 
  `${index + 1}. ${item.proyecto} (${item.empresa}) - ${item.growth.toFixed(2)}%`
).join('\n')}

DATOS DETALLADOS
================
${data.map(item => 
  `${item.empresa} - ${item.proyecto}: $${item.total2024.toLocaleString('es-MX')} → $${item.total2025.toLocaleString('es-MX')} (${item.annualPercentage.toFixed(2)}%)`
).join('\n')}
    `;

    downloadFile(reportContent, `reporte-financiero-${timestamp}.txt`, 'text/plain');
  };

  // Capture charts as images (placeholder)
  const captureChartsAsImages = async (timestamp: string) => {
    // In a real implementation, you would capture actual chart canvases
    const placeholder = 'Chart image placeholder - would contain actual chart data';
    downloadFile(placeholder, `graficos-${timestamp}.txt`, 'text/plain');
  };

  const availableCompanies = Array.from(new Set(revenueData.map(item => item.empresa)));

  const sectionOptions = [
    { id: 'summary', label: 'Resumen Ejecutivo', icon: <FileText className="w-4 h-4" /> },
    { id: 'charts', label: 'Gráficas y Visualizaciones', icon: <FileImage className="w-4 h-4" /> },
    { id: 'detailed', label: 'Datos Detallados', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-6 h-6" />
            Exportación de Reportes
          </h2>
          <p className="text-gray-600">Genera reportes personalizados en múltiples formatos</p>
        </div>
        
        {exportSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            ¡Reporte exportado exitosamente!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Formato de Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { format: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" />, description: 'Reporte completo' },
                  { format: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Datos editables' },
                  { format: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Datos planos' },
                  { format: 'png', label: 'Imágenes', icon: <FileImage className="w-5 h-5" />, description: 'Solo gráficas' }
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: option.format as any }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      exportOptions.format === option.format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-center mb-2">{option.icon}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rango de Fechas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { range: 'current', label: 'Año Actual' },
                  { range: '6m', label: 'Últimos 6 Meses' },
                  { range: '12m', label: 'Últimos 12 Meses' }
                ].map((option) => (
                  <button
                    key={option.range}
                    onClick={() => setExportOptions(prev => ({ ...prev, dateRange: option.range as any }))}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      exportOptions.dateRange === option.range
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtrar por Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportOptions(prev => ({ ...prev, companies: [] }))}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setExportOptions(prev => ({ ...prev, companies: availableCompanies }))}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
                  >
                    Seleccionar Todas
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableCompanies.map((company) => (
                    <label key={company} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.companies.includes(company)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportOptions(prev => ({
                              ...prev,
                              companies: [...prev.companies, company]
                            }));
                          } else {
                            setExportOptions(prev => ({
                              ...prev,
                              companies: prev.companies.filter(c => c !== company)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{company}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections to Include */}
          <Card>
            <CardHeader>
              <CardTitle>Secciones a Incluir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionOptions.map((section) => (
                  <label key={section.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.sections.includes(section.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportOptions(prev => ({
                            ...prev,
                            sections: [...prev.sections, section.id]
                          }));
                        } else {
                          setExportOptions(prev => ({
                            ...prev,
                            sections: prev.sections.filter(s => s !== section.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    {section.icon}
                    <span>{section.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Incluir gráficas y visualizaciones</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDetailedData}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetailedData: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Incluir datos detallados por proyecto</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Export */}
        <div className="space-y-6">
          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div><strong>Formato:</strong> {exportOptions.format.toUpperCase()}</div>
                <div><strong>Período:</strong> {
                  exportOptions.dateRange === 'current' ? 'Año Actual' :
                  exportOptions.dateRange === '6m' ? 'Últimos 6 Meses' : 'Últimos 12 Meses'
                }</div>
                <div><strong>Empresas:</strong> {
                  exportOptions.companies.length === 0 ? 'Todas' : 
                  exportOptions.companies.length === availableCompanies.length ? 'Todas' :
                  `${exportOptions.companies.length} seleccionadas`
                }</div>
                <div><strong>Secciones:</strong> {exportOptions.sections.length}</div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Proyectos incluidos: {revenueData.length}</div>
                  <div>• Gráficas: {exportOptions.includeCharts ? 'Sí' : 'No'}</div>
                  <div>• Datos detallados: {exportOptions.includeDetailedData ? 'Sí' : 'No'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleExport}
                disabled={isExporting || exportOptions.sections.length === 0}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Reporte
                  </div>
                )}
              </Button>
              
              {exportOptions.sections.length === 0 && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Selecciona al menos una sección para exportar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exportación Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  setExportOptions({
                    format: 'csv',
                    dateRange: 'current',
                    companies: [],
                    sections: ['detailed'],
                    includeCharts: false,
                    includeDetailedData: true
                  });
                  handleExport();
                }}
                className="w-full"
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Datos en CSV
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setExportOptions({
                    format: 'pdf',
                    dateRange: 'current',
                    companies: [],
                    sections: ['summary', 'charts'],
                    includeCharts: true,
                    includeDetailedData: false
                  });
                  handleExport();
                }}
                className="w-full"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Resumen PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;
