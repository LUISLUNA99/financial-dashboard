import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { 
  Filter, 
  Search, 
  Calendar, 
  Building, 
  DollarSign, 
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FilterOptions {
  companies: string[];
  projects: string[];
  dateRange: {
    start: string;
    end: string;
  };
  revenueRange: {
    min: number;
    max: number;
  };
  growthRange: {
    min: number;
    max: number;
  };
  searchTerm: string;
}

interface FilterProps {
  onFiltersChange: (filters: FilterOptions) => void;
  availableCompanies: string[];
  availableProjects: string[];
}

const AdvancedFilters: React.FC<FilterProps> = ({
  onFiltersChange,
  availableCompanies,
  availableProjects
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    companies: [],
    projects: [],
    dateRange: {
      start: '2024-01-01',
      end: '2025-12-31'
    },
    revenueRange: {
      min: 0,
      max: 10000000
    },
    growthRange: {
      min: -100,
      max: 500
    },
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.companies.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.searchTerm.trim()) count++;
    if (filters.revenueRange.min > 0 || filters.revenueRange.max < 10000000) count++;
    if (filters.growthRange.min > -100 || filters.growthRange.max < 500) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleCompanyToggle = (company: string) => {
    setFilters(prev => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter(c => c !== company)
        : [...prev.companies, company]
    }));
  };

  const handleProjectToggle = (project: string) => {
    setFilters(prev => ({
      ...prev,
      projects: prev.projects.includes(project)
        ? prev.projects.filter(p => p !== project)
        : [...prev.projects, project]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      companies: [],
      projects: [],
      dateRange: {
        start: '2024-01-01',
        end: '2025-12-31'
      },
      revenueRange: {
        min: 0,
        max: 10000000
      },
      growthRange: {
        min: -100,
        max: 500
      },
      searchTerm: ''
    });
  };

  const getQuickFilters = () => [
    {
      name: 'Alto Crecimiento',
      action: () => setFilters(prev => ({ ...prev, growthRange: { min: 50, max: 500 } }))
    },
    {
      name: 'Proyectos Grandes',
      action: () => setFilters(prev => ({ ...prev, revenueRange: { min: 1000000, max: 10000000 } }))
    },
    {
      name: 'Solo BUZZWORD',
      action: () => setFilters(prev => ({ ...prev, companies: ['BUZZWORD'] }))
    },
    {
      name: 'Solo INOVITZ',
      action: () => setFilters(prev => ({ ...prev, companies: ['INOVITZ'] }))
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filtros Avanzados</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} activos</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtros Rápidos
          </label>
          <div className="flex flex-wrap gap-2">
            {getQuickFilters().map((filter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={filter.action}
                className="text-xs"
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6">
            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Empresas ({filters.companies.length}/{availableCompanies.length})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableCompanies.map(company => (
                  <label key={company} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company)}
                      onChange={() => handleCompanyToggle(company)}
                      className="rounded"
                    />
                    <span className="text-sm">{company}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Revenue Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Rango de Ingresos
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={filters.revenueRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      revenueRange: { ...prev.revenueRange, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={filters.revenueRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      revenueRange: { ...prev.revenueRange, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000000"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                ${filters.revenueRange.min.toLocaleString('es-MX')} - ${filters.revenueRange.max.toLocaleString('es-MX')}
              </div>
            </div>

            {/* Growth Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Rango de Crecimiento (%)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={filters.growthRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      growthRange: { ...prev.growthRange, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={filters.growthRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      growthRange: { ...prev.growthRange, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {filters.growthRange.min}% - {filters.growthRange.max}%
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Rango de Fechas
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Top Projects Filter */}
            {availableProjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proyectos Específicos ({filters.projects.length}/{Math.min(availableProjects.length, 10)})
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {availableProjects.slice(0, 10).map(project => (
                    <label key={project} className="flex items-center gap-2 p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <input
                        type="checkbox"
                        checked={filters.projects.includes(project)}
                        onChange={() => handleProjectToggle(project)}
                        className="rounded"
                      />
                      <span className="text-sm truncate" title={project}>
                        {project.length > 30 ? project.substring(0, 30) + '...' : project}
                      </span>
                    </label>
                  ))}
                </div>
                {availableProjects.length > 10 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Mostrando los primeros 10 proyectos. Use la búsqueda para encontrar proyectos específicos.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Filtros Activos:</div>
            <div className="flex flex-wrap gap-2">
              {filters.companies.length > 0 && (
                <Badge variant="outline">
                  Empresas: {filters.companies.join(', ')}
                </Badge>
              )}
              {filters.projects.length > 0 && (
                <Badge variant="outline">
                  {filters.projects.length} proyecto(s)
                </Badge>
              )}
              {filters.searchTerm.trim() && (
                <Badge variant="outline">
                  Búsqueda: "{filters.searchTerm}"
                </Badge>
              )}
              {(filters.revenueRange.min > 0 || filters.revenueRange.max < 10000000) && (
                <Badge variant="outline">
                  Ingresos: ${filters.revenueRange.min.toLocaleString('es-MX')} - ${filters.revenueRange.max.toLocaleString('es-MX')}
                </Badge>
              )}
              {(filters.growthRange.min > -100 || filters.growthRange.max < 500) && (
                <Badge variant="outline">
                  Crecimiento: {filters.growthRange.min}% - {filters.growthRange.max}%
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
