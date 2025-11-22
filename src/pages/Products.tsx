import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { FilterBar } from '@/components/filters/FilterBar';
import { useFilters } from '@/hooks/useFilters';
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory levels
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.uom}</TableCell>
                    <TableCell>{product.reorder_level}</TableCell>
                    <TableCell>
                      {product.unit_cost ? `$${product.unit_cost.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
