import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardContent } from './ui';

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(215.4 16.3% 46.9%);
`;

const FilterSelect = styled.select`
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: hsl(222.2 84% 4.9%);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: 2px solid hsl(221.2 83.2% 53.3%);
    outline-offset: 2px;
    border-color: hsl(221.2 83.2% 53.3%);
  }
  
  &:hover {
    border-color: hsl(221.2 83.2% 53.3%);
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%) 0%, hsl(262.1 83.3% 57.8%) 100%)'
    : 'hsl(0 0% 100%)'};
  color: ${props => props.active ? 'hsl(0 0% 100%)' : 'hsl(222.2 84% 4.9%)'};
  border: 1px solid ${props => props.active ? 'transparent' : 'hsl(214.3 31.8% 91.4%)'};
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, hsl(221.2 83.2% 48.3%) 0%, hsl(262.1 83.3% 52.8%) 100%)'
      : 'hsl(210 40% 98%)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(214 32% 91%) 100%);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  min-width: 120px;
`;

const StatsValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(221.2 83.2% 53.3%);
  margin-bottom: 0.25rem;
`;

const StatsLabel = styled.div`
  font-size: 0.75rem;
  color: hsl(215.4 16.3% 46.9%);
  font-weight: 500;
`;

interface CompanyFiltersProps {
  selectedCompany: string;
  selectedCategory: string;
  selectedTimeRange: string;
  onCompanyChange: (company: string) => void;
  onCategoryChange: (category: string) => void;
  onTimeRangeChange: (timeRange: string) => void;
  stats?: {
    totalProjects: number;
    totalRevenue: number;
    avgGrowth: number;
    activeMonths: number;
  };
}

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  selectedCompany,
  selectedCategory,
  selectedTimeRange,
  onCompanyChange,
  onCategoryChange,
  onTimeRangeChange,
  stats
}) => {
  const companies = ['ALL', 'BUZZWORD', 'INOVITZ'];
  const categories = ['ALL', 'Corporate', 'Utilidad', 'EBIT', 'ART', 'FSW', 'CC'];
  const timeRanges = ['ALL', 'Q1', 'Q2', 'Q3', 'Q4', 'YTD'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Filtros Avanzados
          <span className="text-sm font-normal text-gray-500">
            Filtra por empresa, categoría y período
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Empresa</FilterLabel>
            <FilterButtonGroup>
              {companies.map(company => (
                <FilterButton
                  key={company}
                  active={selectedCompany === company}
                  onClick={() => onCompanyChange(company)}
                >
                  {company === 'ALL' ? '🏢 Todas' : 
                   company === 'BUZZWORD' ? '🚀 BUZZWORD' : 
                   '💡 INOVITZ'}
                </FilterButton>
              ))}
            </FilterButtonGroup>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Categoría</FilterLabel>
            <FilterSelect
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'ALL' ? 'Todas las categorías' : category}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Período</FilterLabel>
            <FilterSelect
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range} value={range}>
                  {range === 'ALL' ? 'Todo el año' :
                   range === 'YTD' ? 'Year to Date' : range}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FilterContainer>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatsCard>
              <StatsValue>{stats.totalProjects}</StatsValue>
              <StatsLabel>Proyectos</StatsLabel>
            </StatsCard>
            <StatsCard>
              <StatsValue>{formatCurrency(stats.totalRevenue)}</StatsValue>
              <StatsLabel>Ingresos Totales</StatsLabel>
            </StatsCard>
            <StatsCard>
              <StatsValue>{stats.avgGrowth.toFixed(1)}%</StatsValue>
              <StatsLabel>Crecimiento Prom.</StatsLabel>
            </StatsCard>
            <StatsCard>
              <StatsValue>{stats.activeMonths}</StatsValue>
              <StatsLabel>Meses Activos</StatsLabel>
            </StatsCard>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyFilters;
