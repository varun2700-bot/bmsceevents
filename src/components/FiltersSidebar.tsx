import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FiltersState {
  departments: string[];
  tags: string[];
  clubs: string[];
  statuses: string[];
  costs: string[];
}

interface FiltersSidebarProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  availableFilters: {
    departments: string[];
    tags: string[];
    clubs: string[];
    statuses: string[];
    costs: string[];
  };
}

export function FiltersSidebar({ filters, setFilters, availableFilters }: FiltersSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    department: true,
    tags: true,
    clubs: true,
    status: true,
    cost: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (category: keyof FiltersState, value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      departments: [],
      tags: [],
      clubs: [],
      statuses: [],
      costs: [],
    });
  };

  const activeFilterCount = Object.values(filters).flat().length;

  const renderFilterSection = (
    title: string,
    key: string,
    category: keyof FiltersState,
    options: string[]
  ) => (
    <div className="mb-3">
      <button 
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between py-2 text-left border-b border-border"
      >
        <span className="font-semibold text-foreground text-sm">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            expandedSections[key] ? '' : '-rotate-90'
          }`}
        />
      </button>
      {expandedSections[key] && (
        <div className="pl-2 mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          {options.map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={filters[category].includes(option)}
                onChange={() => toggleFilter(category, option)}
                className="filter-checkbox"
              />
              <span className="text-sm text-foreground/80">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside className="w-72 flex-shrink-0">
      <div className="bg-card rounded-lg shadow-md p-5 border border-border sticky top-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground mb-1">Filters</h2>
          <p className="text-xs text-muted-foreground font-medium">Refine your search</p>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">ACTIVE:</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs text-destructive hover:text-destructive/80 p-0 h-auto"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(filters).flatMap(([category, values]) =>
                values.map(value => (
                  <Badge 
                    key={`${category}-${value}`}
                    variant="secondary"
                    className="text-xs animate-fade-in cursor-pointer"
                    onClick={() => toggleFilter(category as keyof FiltersState, value)}
                  >
                    {value}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))
              )}
            </div>
          </div>
        )}

        {renderFilterSection('Department', 'department', 'departments', availableFilters.departments)}
        {renderFilterSection('Tags', 'tags', 'tags', availableFilters.tags)}
        {renderFilterSection('Clubs', 'clubs', 'clubs', availableFilters.clubs)}
        {renderFilterSection('Status', 'status', 'statuses', availableFilters.statuses)}
        {renderFilterSection('Cost', 'cost', 'costs', availableFilters.costs)}
      </div>
    </aside>
  );
}
