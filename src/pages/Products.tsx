import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Package } from 'lucide-react';
import { FilterBar } from '@/components/filters/FilterBar';
import { useFilters } from '@/hooks/useFilters';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  reorder_level: number;
  unit_cost: number | null;
  is_active: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { search, setSearch, filters, updateFilter, clearFilters } = useFilters({
    initialFilters: { category: null, status: null },
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, filters]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;
      
      const uniqueCategories = Array.from(
        new Set((data || []).map((p) => p.category))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('name');

      // Apply search filter
      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`
        );
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('is_active', filters.status === 'active');
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading products..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory levels
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new product</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardHeader>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, SKU, or category..."
            filters={[
              {
                label: 'Category',
                value: filters.category,
                options: categories.map((cat) => ({ label: cat, value: cat })),
                onChange: (value) => updateFilter('category', value),
                placeholder: 'All Categories',
              },
              {
                label: 'Status',
                value: filters.status,
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
                onChange: (value) => updateFilter('status', value),
                placeholder: 'All Status',
              },
            ]}
            onClearFilters={clearFilters}
          />
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Get started by creating your first product in the inventory system."
              action={{
                label: 'Add Product',
                onClick: () => {},
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">UOM</TableHead>
                    <TableHead className="font-semibold">Reorder Level</TableHead>
                    <TableHead className="font-semibold">Unit Cost</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.uom}</TableCell>
                      <TableCell className="text-center">{product.reorder_level}</TableCell>
                      <TableCell className="font-medium">
                        {product.unit_cost ? `$${product.unit_cost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'} className="font-medium">
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
