import { useState, useCallback, useMemo } from 'react';

interface UseFiltersOptions {
  initialSearch?: string;
  initialFilters?: Record<string, string | null>;
}

export const useFilters = (options: UseFiltersOptions = {}) => {
  const [search, setSearch] = useState(options.initialSearch || '');
  const [filters, setFilters] = useState<Record<string, string | null>>(
    options.initialFilters || {}
  );

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? null : value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilters(
      Object.keys(filters).reduce((acc, key) => ({ ...acc, [key]: null }), {})
    );
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return search !== '' || Object.values(filters).some((v) => v !== null);
  }, [search, filters]);

  return {
    search,
    setSearch,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};
